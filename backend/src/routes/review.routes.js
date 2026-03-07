const express = require('express');
const router = express.Router();
const { Review, User, Product, Job } = require('../models');

// GET /api/reviews/product/:productId - Get all reviews for a product
router.get('/product/:productId', async (req, res) => {
    try {
        const reviews = await Review.findAll({
            where: { productId: req.params.productId, type: 'product' },
            include: [{ model: User, as: 'reviewer', attributes: ['name', 'picture'] }],
            order: [['createdAt', 'DESC']]
        });

        const avgRating = reviews.length
            ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
            : 0;

        res.json({ success: true, reviews, averageRating: Number(avgRating), total: reviews.length });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/reviews/job/:jobId - Get all reviews for a job/employer
router.get('/job/:jobId', async (req, res) => {
    try {
        const reviews = await Review.findAll({
            where: { jobId: req.params.jobId, type: 'job' },
            include: [{ model: User, as: 'reviewer', attributes: ['name', 'picture'] }],
            order: [['createdAt', 'DESC']]
        });

        const avgRating = reviews.length
            ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
            : 0;

        res.json({ success: true, reviews, averageRating: Number(avgRating), total: reviews.length });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/reviews - Create a new review
router.post('/', async (req, res) => {
    try {
        const { rating, comment, userId, productId, jobId, type } = req.body;

        if (!rating || !userId || !type) {
            return res.status(400).json({
                success: false,
                message: 'Rating, userId, and type are required'
            });
        }

        if (!['product', 'job', 'seller', 'employer'].includes(type)) {
            return res.status(400).json({ success: false, message: 'Invalid review type' });
        }

        if (type === 'product' && !productId) {
            return res.status(400).json({ success: false, message: 'productId required for product reviews' });
        }

        if ((type === 'job' || type === 'employer') && !jobId) {
            return res.status(400).json({ success: false, message: 'jobId required for job/employer reviews' });
        }

        const review = await Review.create({ rating, comment, userId, productId, jobId, type });

        res.status(201).json({ success: true, message: 'Review submitted successfully', review });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE /api/reviews/:id - Admin delete a review
router.delete('/:id', async (req, res) => {
    try {
        const review = await Review.findByPk(req.params.id);
        if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

        await review.destroy();
        res.json({ success: true, message: 'Review removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
