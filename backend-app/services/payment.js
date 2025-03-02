require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { getRiderById, updateRiderById } = require('../services/user');
const Rider = require('../models/Rider');

const retrievePaymentMethod = async (riderId) => {
  try {
    const rider = await getRiderById(riderId);

    if (!rider) throw new Error('Rider not found');

    if (rider.stripePaymentMethodId) {
      const paymentMethod = await stripe.paymentMethods.retrieve(rider.stripePaymentMethodId);
      return paymentMethod;
    } else {
      return null;
    }

  } catch (error) {
    console.error('Error retrieving PaymentMethod:', error);
    throw new Error('Failed to retrieve PaymentMethod');
  }
};

const createSetupIntent = async (riderId) => {
  try {
    const rider = await getRiderById(riderId);

    if (!rider) throw new Error('Rider not found');

    if (!rider.stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: rider.email,
      });
      const stripeCustomerId = customer.id;
      await updateRiderById(riderId, { stripeCustomerId });
      return;
    }

    // TODO: we don't need to create a new intent each time
    // but instead we can just attach a new payment to the 
    // present one 
    const setupIntent = await stripe.setupIntents.create({
      customer: rider.stripeCustomerId,
    });

    const stripeSetupIntentId = setupIntent.id

    await updateRiderById(riderId, { stripeSetupIntentId });

    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: setupIntent.customer },
      { apiVersion: '2020-08-27' }
    );
    
    return {
      setupIntentClientSecret: setupIntent.client_secret,
      customerId: setupIntent.customer,
      ephemeralKeySecret: ephemeralKey.secret,
    };
  } catch (error) {
    console.error('Error in createSetupIntent:', error);
    throw new Error('Failed to create SetupIntent');
  }
};

const attachPaymentMethodFromSetupIntent = async (riderId) => {
  try {
    const rider = await getRiderById(riderId);
    if (!rider) throw new Error('Rider not found');

    if (!rider.stripeCustomerId) throw new Error('Rider does not have a Stripe customer ID');
    if (!rider.stripeSetupIntentId) throw new Error('Rider does not have a Stripe SetupIntent ID');

    const setupIntent = await stripe.setupIntents.retrieve(rider.stripeSetupIntentId);
    if (!setupIntent.payment_method) throw new Error('No payment method found in SetupIntent');

    const paymentMethodId = setupIntent.payment_method;

    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: rider.stripeCustomerId,
    });

    await stripe.customers.update(rider.stripeCustomerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });

    await updateRiderById(riderId, { stripePaymentMethodId: paymentMethodId });

    console.log(`Payment method ${paymentMethodId} attached and set as default for rider ${riderId}`);
  } catch (error) {
    console.error('Error in attachPaymentMethodFromSetupIntent:', error);
    throw new Error('Failed to attach payment method');
  }
};

const chargePaymentMethod = async (riderId, amount, currency = 'usd') => {
  const rider = await getRiderById(riderId);
  if (!rider) throw new Error('Rider not found');

  if (!rider.stripeCustomerId || !rider.stripePaymentMethodId) {
    throw new Error('Rider is missing Stripe payment details');
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency,
    customer: rider.stripeCustomerId,
    payment_method: rider.stripePaymentMethodId,
    confirm: true,
    off_session: true,
  });

  return paymentIntent;
};

module.exports = { retrievePaymentMethod, chargePaymentMethod, createSetupIntent, attachPaymentMethodFromSetupIntent };
