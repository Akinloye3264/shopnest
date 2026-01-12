import express from 'express';
import { protect } from '../middleware/auth.js';
import { Order } from '../models/index.js';

const router = express.Router();

// @route   POST /api/payments/initialize
// @desc    Initialize payment
// @access  Private
router.post('/initialize', protect, async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.customerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Payment initialization will be implemented later
    res.json({
      success: true,
      message: 'Payment initialization - to be implemented',
      data: {
        orderId: order.id,
        amount: order.total,
        currency: 'NGN'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error initializing payment',
      error: error.message
    });
  }
});

// @route   POST /api/payments/verify
// @desc    Verify payment
// @access  Public (webhook)
router.post('/verify', async (req, res) => {
  try {
    const { reference } = req.body;

    const order = await Order.findOne({ where: { paymentReference: reference } });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Payment verification will be implemented later
    await order.update({
      paymentStatus: 'paid',
      orderStatus: 'confirmed'
    });

    res.json({
      success: true,
      message: 'Payment verified successfully',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying payment',
      error: error.message
    });
  }
});

export default router;
