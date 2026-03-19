const express = require('express');
const router = express.Router();
const { Order, OrderItem, Product, User } = require('../models');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// GET /api/orders/:userId - Get orders for a user
router.get('/user/:userId', async (req, res) => {
    try {
        const orders = await Order.findAll({
            where: { userId: req.params.userId },
            include: [
                {
                    model: OrderItem,
                    as: 'items',
                    include: [{ model: Product, as: 'product', attributes: ['title', 'image', 'price'] }]
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/orders/:id - Get single order
router.get('/:id', async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id, {
            include: [
                {
                    model: OrderItem,
                    as: 'items',
                    include: [{ model: Product, as: 'product', attributes: ['title', 'image', 'price', 'sellerId'] }]
                },
                { model: User, as: 'buyer', attributes: ['name', 'email'] }
            ]
        });
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
        res.json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/orders/checkout - Create Stripe checkout session and save order
router.post('/checkout', async (req, res) => {
    try {
        const { userId, items, shippingAddress } = req.body;

        if (!userId || !items || items.length === 0) {
            return res.status(400).json({ success: false, message: 'userId and items are required' });
        }

        const totalAmount = items.reduce((sum, item) => sum + (parseFloat(item.price) * (item.quantity || 1)), 0);

        // Create order in DB first (pending)
        const order = await Order.create({
            userId,
            totalAmount: totalAmount.toFixed(2),
            status: 'pending',
            shippingAddress: shippingAddress || null
        });

        // Create order items
        const orderItems = await Promise.all(
            items.map(item =>
                OrderItem.create({
                    orderId: order.id,
                    productId: item.id,
                    quantity: item.quantity || 1,
                    price: parseFloat(item.price)
                })
            )
        );

        // Create Stripe session
        const line_items = items.map(item => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.title,
                    description: item.description || '',
                    images: item.image ? [item.image] : []
                },
                unit_amount: Math.round(parseFloat(item.price) * 100)
            },
            quantity: item.quantity || 1
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items,
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/orders?status=success&orderId=${order.id}`,
            cancel_url: `${process.env.FRONTEND_URL}/orders?status=cancel`,
            metadata: { orderId: order.id }
        });

        // Update order with Stripe session ID
        await order.update({ stripeSessionId: session.id });

        res.json({ success: true, sessionId: session.id, url: session.url, orderId: order.id });
    } catch (error) {
        console.error('Order checkout error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/orders/:id/confirm - Confirm order after payment
router.post('/:id/confirm', async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        await order.update({ status: 'paid' });

        // Decrease stock for each item
        const items = await OrderItem.findAll({ where: { orderId: order.id } });
        for (const item of items) {
            const product = await Product.findByPk(item.productId);
            if (product && product.stock >= item.quantity) {
                await product.update({ stock: product.stock - item.quantity });
            }
        }

        res.json({ success: true, message: 'Order confirmed', order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/orders/:id/status - Update order status (admin/seller)
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const order = await Order.findByPk(req.params.id);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        await order.update({ status });
        res.json({ success: true, message: `Order status updated to ${status}`, order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/orders/:id/cancel - Cancel an order
router.post('/:id/cancel', async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        if (['shipped', 'delivered'].includes(order.status)) {
            return res.status(400).json({ success: false, message: 'Cannot cancel a shipped or delivered order' });
        }

        await order.update({ status: 'cancelled' });
        res.json({ success: true, message: 'Order cancelled', order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/orders/check-seller/:buyerId/:sellerId - Check if buyer has a completed transaction with a seller
router.get('/check-seller/:buyerId/:sellerId', async (req, res) => {
    try {
        const { buyerId, sellerId } = req.params;
        const completedStatuses = ['paid', 'processing', 'shipped', 'delivered'];

        const orders = await Order.findAll({
            where: { userId: buyerId },
            include: [{
                model: OrderItem,
                as: 'items',
                include: [{
                    model: Product,
                    as: 'product',
                    attributes: ['id', 'sellerId']
                }]
            }]
        });

        const hasTransaction = orders.some(order =>
            completedStatuses.includes(order.status) &&
            order.items?.some(item => item.product?.sellerId === sellerId)
        );

        res.json({ success: true, hasTransaction });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
