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
    }

    const setupIntent = await stripe.setupIntents.create({
      customer: rider.stripeCustomerId,
    });

    console.log(setupIntent);

    return setupIntent.client_secret;
  } catch (error) {
    console.error('Error in createSetupIntent:', error);
    throw new Error('Failed to create SetupIntent');
  }
};

const attachPaymentMethod = async (riderId, paymentMethodId) => {
  try {
    const rider = await getRiderById(riderId);
    if (!rider) throw new Error('Rider not found');

    if (!rider.stripeCustomerId) throw new Error('Rider does not have a Stripe customer ID');

    const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
      customer: rider.stripeCustomerId,
    });

    await stripe.customers.update(rider.stripeCustomerId, {
      invoice_settings: { default_payment_method: paymentMethod.id },
    });

    await updateRiderById(riderId, { stripePaymentMethodId: paymentMethod.id });
  } catch (error) {
    console.error('Error in attachPaymentMethod:', error);
    throw new Error('Failed to attach payment method');
  }
};

module.exports = { retrievePaymentMethod, createSetupIntent, attachPaymentMethod };
