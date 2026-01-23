import express from 'express';
import { protect } from '../middleware/auth.js';
import { Order, User, Store } from '../models/index.js';

const router = express.Router();

/**
 * @swagger
 * /customer/orders:
 *   get:
 *     summary: Get customer's orders
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of customer orders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *       500:
 *         description: Server error
 */
// @route   GET /api/customer/orders
// @desc    Get customer's orders
// @access  Private
router.get('/orders', protect, async (req, res) => {
  try {
    // Admins can see all orders, customers see only their own
    const where = req.user.role === 'admin' ? {} : { customerId: req.user.id };
    const orders = await Order.findAll({
      where,
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
