import express from 'express';
import { protect } from '../middleware/auth.js';
import { Order, User, Store } from '../models/index.js';

const router = express.Router();

// @route   GET /api/customer/orders
// @desc    Get customer's orders
// @access  Private
router.get('/orders', protect, async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { customerId: req.user.id },
      include: [
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'name', 'storeName']
        },
        {
          model: Store,
          as: 'store',
          attributes: ['id', 'name', 'slug']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
});

export default router;
