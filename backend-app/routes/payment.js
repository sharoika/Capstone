// backend/stripeRoutes.js
const express = require('express');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const router = express.Router();

router.get('/get-payment-method', async (req, res) => {
    try {
        const { customerId, paymentMethodId } = req.query;

        if (!customerId || !paymentMethodId) {
            return res.status(400).json({ message: 'customerId and paymentMethodId are required' });
        }

        const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

        if (paymentMethod.customer !== customerId) {
            return res.status(400).json({ message: 'Payment method does not belong to the customer' });
        }
        
        res.json({ paymentMethod });
    } catch (error) {
        console.error('Error retrieving payment method:', error);
        res.status(500).json({ error: 'Failed to retrieve payment method' });
    }
});


router.post('/create-payment-method', async (req, res) => {
    try {
        const { paymentMethodId, id } = req.body;

        const rider = await Rider.findById(id);
        if (!rider) {
            return res.status(404).json({ message: 'Rider not found' });
        }

        let customerId = rider.stripeCustomerId;

        if (!customerId) {
            const customer = await stripe.customers.create({
                email: rider.email,
                payment_method: paymentMethodId,
                invoice_settings: {
                    default_payment_method: paymentMethodId,
                },
            });
            customerId = customer.id;
        } else {
            await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
            await stripe.customers.update(customerId, {
                invoice_settings: {
                    default_payment_method: paymentMethodId,
                },
            });
        }

        rider.stripeCustomerId = customerId;
        rider.stripePaymentMethodId = paymentMethodId;
        await rider.save();

        res.json({ customerId, paymentMethodId });
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
