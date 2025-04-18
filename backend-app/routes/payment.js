const express = require('express');
const { createSetupIntent, attachPaymentMethodFromSetupIntent, chargePaymentMethod, retrievePaymentMethod } = require('../services/payment');
const router = express.Router();

// TODO: this should be a get
router.post('/payment-method', async (req, res) => {
  try {
    const { riderId } = req.body;
    const paymentMethod = await retrievePaymentMethod(riderId);
    res.status(200).json({ paymentMethod });
  } catch (error) {
    console.error('Error in /create-setup-intent:', error);
    res.status(500).send('Failed to create SetupIntent');
  }
});

router.post('/create-setup-intent', async (req, res) => {
  try {
    const { riderId } = req.body;
    const clientSecret = await createSetupIntent(riderId);
    res.status(200).send({
      paymentIntent: clientSecret.setupIntentClientSecret,
      customer: clientSecret.customerId,
      ephemeralKey: clientSecret.ephemeralKeySecret,
    });
  } catch (error) {
    console.error('Error in /create-setup-intent:', error);
    res.status(500).send('Failed to create SetupIntent');
  }
});

router.post('/attach-payment-method', async (req, res) => {
  try {
    const { riderId, paymentMethodId } = req.body;
    await attachPaymentMethodFromSetupIntent(riderId);
    res.status(200).send('Payment method attached successfully');
  } catch (error) {
    console.log('Error in /attach-payment-method:', error);
    res.status(500).send('Failed to attach payment method');
  }
});

// TODO: This shouldnt exist, maybe only an admin route for re-billing if a
// payment fails - otherwise should occur on conclusion of a ride.

// router.post('/charge-payment-method', async (req, res) => {
//   try {
//     const { riderId, amount, currency } = req.body;
//     const paymentIntent = await chargePaymentMethod(riderId, amount, currency);

//     res.status(200).json({
//       success: true,
//       message: 'Payment processed successfully',
//       paymentIntentId: paymentIntent.id,
//     });
//   } catch (error) {
//     console.error('Error in /charge-payment-method:', error);
//     res.status(500).send('Failed to process payment');
//   }
// });


module.exports = router;
