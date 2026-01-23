import express from 'express';
import { Op } from 'sequelize';
import { protect, isSeller } from '../middleware/auth.js';
import { Product, Order, Store, DiscountCode, User } from '../models/index.js';

const router = express.Router();

// All routes require authentication and seller role
router.use(protect);
router.use(isSeller);

/**
 * @swagger
 * /seller/dashboard:
 *   get:
 *     summary: Get seller dashboard statistics
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Seller dashboard data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     store:
 *                       type: object
 *                     stats:
 *                       type: object
 *       500:
 *         description: Server error
 */
// @route   GET /api/seller/dashboard
// @desc    Get seller dashboard stats
// @access  Private/Seller
router.get('/dashboard', async (req, res) => {
  try {
    // Admins can access any seller dashboard (default to their own)
    const sellerId = req.user.role === 'admin' && req.query.sellerId 
      ? req.query.sellerId 
      : req.user.id;
    const store = await Store.findOne({ where: { ownerId: sellerId } });

    // Get date ranges
    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    // Total products
    const totalProducts = await Product.count({ where: { sellerId } });

    // Today's stats
    const todayOrders = await Order.findAll({
      where: {
        sellerId,
        createdAt: {
          [Op.gte]: today
        }
      }
    });
    const todayRevenue = todayOrders.reduce((sum, order) => sum + parseFloat(order.total), 0);

    // Weekly stats
    const weekOrders = await Order.findAll({
      where: {
        sellerId,
        createdAt: {
          [Op.gte]: weekAgo
        }
      }
    });
    const weekRevenue = weekOrders.reduce((sum, order) => sum + parseFloat(order.total), 0);

    // Monthly stats
    const monthOrders = await Order.findAll({
      where: {
        sellerId,
        createdAt: {
          [Op.gte]: monthAgo
        }
      }
    });
    const monthRevenue = monthOrders.reduce((sum, order) => sum + parseFloat(order.total), 0);

    // Total stats
    const totalOrders = await Order.count({ where: { sellerId } });
    const allOrders = await Order.findAll({ where: { sellerId } });
    const totalRevenue = allOrders.reduce((sum, order) => sum + parseFloat(order.total), 0);

    res.json({
      success: true,
      data: {
        store: store || null,
        stats: {
          totalProducts,
          orders: {
            today: todayOrders.length,
            week: weekOrders.length,
            month: monthOrders.length,
            total: totalOrders
          },
          revenue: {
            today: todayRevenue,
            week: weekRevenue,
            month: monthRevenue,
            total: totalRevenue
          }
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /seller/products:
 *   get:
 *     summary: Get seller's products
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of seller's products
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
 *                     $ref: '#/components/schemas/Product'
 *       500:
 *         description: Server error
 */
// @route   GET /api/seller/products
// @desc    Get seller's products
// @access  Private/Seller
router.get('/products', async (req, res) => {
  try {
    // Admins can see all products, sellers see only their own
    const where = req.user.role === 'admin' ? {} : { sellerId: req.user.id };
    const products = await Product.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /seller/orders:
 *   get:
 *     summary: Get seller's orders
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of seller's orders
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
// @route   GET /api/seller/orders
// @desc    Get seller's orders
// @access  Private/Seller
router.get('/orders', async (req, res) => {
  try {
    // Admins can see all orders, sellers see only their own
    const where = req.user.role === 'admin' ? {} : { sellerId: req.user.id };
    const orders = await Order.findAll({
      where,
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'name', 'email']
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

/**
 * @swagger
 * /seller/discount-codes:
 *   get:
 *     summary: Get seller's discount codes
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of seller's discount codes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *       500:
 *         description: Server error
 */
// @route   GET /api/seller/discount-codes
// @desc    Get seller's discount codes
// @access  Private/Seller
router.get('/discount-codes', async (req, res) => {
  try {
    // Admins can see all discount codes, sellers see only their own
    const where = req.user.role === 'admin' ? {} : { sellerId: req.user.id };
    const codes = await DiscountCode.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, data: codes });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching discount codes',
      error: error.message
    });
  }
});

export default router;
