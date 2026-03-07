const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// POST /api/payments/create-checkout-session
router.post('/create-checkout-session', async (req, res) => {
    try {
        const { items, success_url, cancel_url } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, message: 'No items in cart' });
        }

        const line_items = items.map(item => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.title,
                    description: item.description || '',
                    images: item.image ? [item.image] : [],
                },
                unit_amount: Math.round(parseFloat(item.price) * 100),
            },
            quantity: item.quantity || 1,
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items,
            mode: 'payment',
            success_url: success_url || `${process.env.FRONTEND_URL}/orders?status=success`,
            cancel_url: cancel_url || `${process.env.FRONTEND_URL}/products?status=cancel`,
        });

        res.json({ success: true, id: session.id, url: session.url });
    } catch (error) {
        console.error('Stripe Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/payments/config - Returns Stripe publishable key to frontend
router.get('/config', (req, res) => {
    res.json({
        success: true,
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
    });
});

// POST /api/payments/verify-session/:sessionId - Verify a Stripe checkout session
router.get('/verify-session/:sessionId', async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
        res.json({
            success: true,
            status: session.payment_status,
            amountTotal: session.amount_total,
            currency: session.currency,
            customerEmail: session.customer_details?.email
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
