import express from 'express';
import { protect, isAdmin } from '../middleware/auth.js';
import { User, Store, Product, Order } from '../models/index.js';
import { Sequelize } from 'sequelize';

const router = express.Router();

// All routes require admin role
router.use(protect);
router.use(isAdmin);

/**
 * @swagger
 * /admin/dashboard:
 *   get:
 *     summary: Get admin dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin dashboard data
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
 *                     users:
 *                       type: object
 *                     stores:
 *                       type: integer
 *                     products:
 *                       type: integer
 *                     orders:
 *                       type: integer
 *                     revenue:
 *                       type: number
 *       500:
 *         description: Server error
 */
// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard stats
// @access  Private/Admin
router.get('/dashboard', async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalSellers = await User.count({ where: { role: 'seller' } });
    const totalCustomers = await User.count({ where: { role: 'customer' } });
    const totalStores = await Store.count();
    const totalProducts = await Product.count();
    const totalOrders = await Order.count();

    const allOrders = await Order.findAll();
    const totalRevenue = allOrders.reduce((sum, order) => sum + parseFloat(order.total), 0);

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          sellers: totalSellers,
          customers: totalCustomers
        },
        stores: totalStores,
        products: totalProducts,
        orders: totalOrders,
        revenue: totalRevenue
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
 * /admin/sellers:
 *   get:
 *     summary: Get all sellers
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all sellers
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
 *                     $ref: '#/components/schemas/User'
 *       500:
 *         description: Server error
 */
// @route   GET /api/admin/sellers
// @desc    Get all sellers
// @access  Private/Admin
router.get('/sellers', async (req, res) => {
  try {
    const sellers = await User.findAll({
      where: { role: 'seller' },
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, data: sellers });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching sellers',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /admin/sellers/{id}/approve:
 *   patch:
 *     summary: Approve a seller
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Seller user ID
 *     responses:
 *       200:
 *         description: Seller approved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: Seller not found
 *       500:
 *         description: Server error
 */
// @route   PATCH /api/admin/sellers/:id/approve
// @desc    Approve a seller
// @access  Private/Admin
router.patch('/sellers/:id/approve', async (req, res) => {
  try {
    const seller = await User.findByPk(req.params.id);

    if (!seller || seller.role !== 'seller') {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    await seller.update({ isApproved: true });

    res.json({
      success: true,
      message: 'Seller approved successfully',
      data: seller
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error approving seller',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /admin/sellers/{id}/suspend:
 *   patch:
 *     summary: Suspend a seller
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Seller user ID
 *     responses:
 *       200:
 *         description: Seller suspended successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: Seller not found
 *       500:
 *         description: Server error
 */
// @route   PATCH /api/admin/sellers/:id/suspend
// @desc    Suspend a seller
// @access  Private/Admin
router.patch('/sellers/:id/suspend', async (req, res) => {
  try {
    const seller = await User.findByPk(req.params.id);

    if (!seller || seller.role !== 'seller') {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    await seller.update({ isSuspended: true });

    res.json({
      success: true,
      message: 'Seller suspended successfully',
      data: seller
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error suspending seller',
      error: error.message
    });
  }
});

export default router;
