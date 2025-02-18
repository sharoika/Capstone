// backend/stripeRoutes.js
const express = require('express');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const router = express.Router();

router.post('/create-customer', async (req, res) => {
    try {
        const { paymentMethodId, email } = req.body;

        const customer = await stripe.customers.create({
            email: email,
            payment_method: paymentMethodId,
            invoice_settings: {
                default_payment_method: paymentMethodId,
            },
        });

        res.json({ customerId: customer.id, paymentMethodId });
    } catch (error) {
        console.error('Error creating customer:', error);
        res.status(500).json({ error: 'Failed to create customer' });
    }
});

router.post('/create-charge', async (req, res) => {
    try {
        const { customerId, amount } = req.body;
        console.log("Payment Method")
        console.log(req.body);
        console.log(req.body.paymentMethodId);

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100,
            currency: 'usd',
            customer: customerId,
            description: 'Fake charge for test purposes',
            payment_method: req.body.paymentMethodId,
            off_session: true,
            confirm: true,
        });

        if (paymentIntent.status === 'succeeded') {
            res.json({ success: true, message: 'Payment processed successfully!' });
        } else {
            res.json({ success: false, message: 'Payment failed' });
        }
    } catch (error) {
        console.error('Error creating charge:', error);
        res.status(500).json({ error: 'Failed to create charge' });
    }
});

module.exports = router;
