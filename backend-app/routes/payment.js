const express = require('express');
require('dotenv').config();
const { getPaymentMethod, createOrUpdatePaymentMethod } = require('../services/payment');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

router.get('/get-payment-method', async (req, res) => {
    try {
        console.log("Hit0");
        const { riderId } = req.query;
        res.status(200).json(getPaymentMethod(riderId));
    } catch (error) {
        console.error('Error retrieving payment method:', error);
        res.status(500).json({ error: 'Failed to retrieve payment method' });
    }
});

router.post('/create-setup-intent', async (req, res) => {
    try {
        console.log("Hit1");
      const { riderId } = req.body;
  
      console.log(riderId);
      // Step 1: Create a SetupIntent for saving a payment method
      const setupIntent = await stripe.setupIntents.create({
        customer: riderId.stripeCustomerId,  // Attach to the customer
      });

      console.log(setupIntent);
  
      // Step 2: Return the client secret for frontend to use
      res.status(200).json({
        clientSecret: setupIntent.client_secret,
      });
    } catch (error) {
    console.log(error);
      res.status(500).send(error.message);
    }
  });

router.post('/attach-payment-method', async (req, res) => {
    try {
        console.log("Hit2");
      const { riderId, paymentMethodId } = req.body;
  
      // Step 3: Attach the payment method to the customer
      const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
        customer: riderId,
      });
  
      // Step 4: Update the default payment method if desired
      await stripe.customers.update(riderId, {
        invoice_settings: {
          default_payment_method: paymentMethod.id,
        },
      });
  
      res.json({ success: true });
    } catch (error) {
      res.status(500).send(error.message);
    }
  });

router.post('/create-payment-method', async (req, res) => {
    try {
        console.log("Hit3");
        console.log(req.body);
        const { riderId, cardNumber, expMonth, expYear, cvc } = req.body;
        return res.status(200).json(createOrUpdatePaymentMethod(riderId, cardNumber, expMonth, expYear, cvc))
    } catch (error) {
        console.error('Error creating/updating payment method:', error);
        res.status(500).json({ error: 'Failed to create/update payment method' });
    }
});

// router.post('/create-charge', async (req, res) => {
//     try {
//         const { customerId, amount } = req.body;
//         console.log("Payment Method")
//         console.log(req.body);
//         console.log(req.body.paymentMethodId);

//         const paymentIntent = await stripe.paymentIntents.create({
//             amount: amount * 100,
//             currency: 'usd',
//             customer: customerId,
//             description: 'Fake charge for test purposes',
//             payment_method: req.body.paymentMethodId,
//             off_session: true,
//             confirm: true,
//         });

//         if (paymentIntent.status === 'succeeded') {
//             res.json({ success: true, message: 'Payment processed successfully!' });
//         } else {
//             res.json({ success: false, message: 'Payment failed' });
//         }
//     } catch (error) {
//         console.error('Error creating charge:', error);
//         res.status(500).json({ error: 'Failed to create charge' });
//     }
// });

module.exports = router;
