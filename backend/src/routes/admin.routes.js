const express = require('express');
const router = express.Router();
const { User, Product, Job, Application, Order, Review } = require('../models');
const { sequelize } = require('../config/database.config');

// GET /api/admin/stats - Platform-wide analytics dashboard
router.get('/stats', async (req, res) => {
    try {
        const [
            totalUsers,
            totalProducts,
            totalJobs,
            totalApplications,
            totalOrders,
            totalReviews,
            recentUsers,
            recentOrders,
            usersByRole,
            ordersByStatus
        ] = await Promise.all([
            User.count(),
            Product.count(),
            Job.count(),
            Application.count(),
            Order.count(),
            Review.count(),
            User.findAll({ order: [['createdAt', 'DESC']], limit: 5, attributes: ['id', 'name', 'email', 'role', 'createdAt'] }),
            Order.findAll({ order: [['createdAt', 'DESC']], limit: 5, include: [{ model: User, as: 'buyer', attributes: ['name', 'email'] }] }),
            User.findAll({
                attributes: ['role', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
                group: ['role'],
                raw: true
            }),
            Order.findAll({
                attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
                group: ['status'],
                raw: true
            })
        ]);

        // Revenue calculation from paid orders
        const revenueResult = await Order.findAll({
            where: { status: ['paid', 'processing', 'shipped', 'delivered'] },
            attributes: [[sequelize.fn('SUM', sequelize.col('totalAmount')), 'total']],
            raw: true
        });
        const totalRevenue = parseFloat(revenueResult[0]?.total || 0).toFixed(2);

        res.json({
            success: true,
            stats: {
                totalUsers,
                totalProducts,
                totalJobs,
                totalApplications,
                totalOrders,
                totalReviews,
                totalRevenue: Number(totalRevenue),
                usersByRole,
                ordersByStatus
            },
            recentUsers,
            recentOrders
        });
    } catch (error) {
        console.error('Admin stats error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/admin/users - Get all users (admin only)
router.get('/users', async (req, res) => {
    try {
        const { role, search } = req.query;
        const { Op } = require('sequelize');
        let where = {};

        if (role) where.role = role;
        if (search) {
            where[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } }
            ];
        }

        const users = await User.findAll({
            where,
            attributes: ['id', 'name', 'email', 'role', 'isVerified', 'phone', 'picture', 'createdAt'],
            order: [['createdAt', 'DESC']]
        });

        res.json({ success: true, users, total: users.length });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/admin/users/:id/role - Update user role
router.put('/users/:id/role', async (req, res) => {
    try {
        const { role } = req.body;
        const validRoles = ['buyer', 'seller', 'job_seeker', 'admin', 'employer', 'employee'];

        if (!validRoles.includes(role)) {
            return res.status(400).json({ success: false, message: 'Invalid role' });
        }

        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        await user.update({ role });
        res.json({ success: true, message: `User role updated to ${role}`, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE /api/admin/users/:id - Delete a user
router.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        await user.destroy();
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/admin/orders - Get all orders
router.get('/orders', async (req, res) => {
    try {
        const orders = await Order.findAll({
            include: [
                { model: User, as: 'buyer', attributes: ['name', 'email'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json({ success: true, orders, total: orders.length });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE /api/admin/products/:id - Remove a product listing
router.delete('/products/:id', async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

        await product.destroy();
        res.json({ success: true, message: 'Product removed by admin' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE /api/admin/jobs/:id - Remove a job listing
router.delete('/jobs/:id', async (req, res) => {
    try {
        const job = await Job.findByPk(req.params.id);
        if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

        await job.destroy();
        res.json({ success: true, message: 'Job removed by admin' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
