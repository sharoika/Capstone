const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Rider = require('../models/Rider');
const { getRiderById, updateRiderById } = require('../services/user');

const getPaymentMethod = async (riderId) => {
    try {
        console.log("here1")
        var rider = await getRiderById(riderId);
        console.log("here2")
        if (!rider.stripeCustomerId) {
            const customer = await stripe.customers.create({
                email: rider.email,
              });
            const stripeCustomerId = customer.id;
            console.log(stripeCustomerId);
            await updateRiderById(riderId, { stripeCustomerId })
        }
        console.log("here3");
        return
    } catch (error) {
        console.error('Error in getPaymentMethod:', error);
        return;
    }
};

async function createOrUpdatePaymentMethod(riderId, cardNumber, expMonth, expYear, cvc) {
    try {
      const rider = await Rider.findById(riderId);
      if (!rider) throw new Error('Rider not found');
  
      console
      if (!rider.stripeCustomerId) throw new Error('Rider does not have a Stripe customer ID');

      const paymentMethod = await stripe.paymentMethods.create({
        type: 'card',
        card: {
          number: cardNumber,
          exp_month: expMonth,
          exp_year: expYear,
          cvc: cvc,
        },
        billing_details: {
          email: rider.email,
        },
      });

      await stripe.paymentMethods.attach(paymentMethod.id, {
        customer: rider.stripeCustomerId,
      });
  
      await stripe.customers.update(rider.stripeCustomerId, {
        invoice_settings: { default_payment_method: paymentMethod.id },
      });
  
      const updatedRider = await updateRiderById(riderId, { paymentMethodId: paymentMethod.id });
  
      return { success: true, paymentMethodId: paymentMethod.id, rider: updatedRider };
    } catch (error) {
      console.error('Error in createOrUpdatePaymentMethod:', error);
      return { success: false, error: error.message };
    }
  }

module.exports = {
    getPaymentMethod,
    createOrUpdatePaymentMethod
};
