const express = require('express');
const { createSetupIntent, attachPaymentMethod, retrievePaymentMethod } = require('../services/payment');
const router = express.Router();

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
    res.status(200).json({ clientSecret });
  } catch (error) {
    console.error('Error in /create-setup-intent:', error);
    res.status(500).send('Failed to create SetupIntent');
  }
});

router.post('/attach-payment-method', async (req, res) => {
  try {
    const { riderId, paymentMethodId } = req.body;
    await attachPaymentMethod(riderId, paymentMethodId);
    res.status(200).send('Payment method attached successfully');
  } catch (error) {
    console.error('Error in /attach-payment-method:', error);
    res.status(500).send('Failed to attach payment method');
  }
});

module.exports = router;
