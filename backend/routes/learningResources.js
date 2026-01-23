import express from 'express';
import { body, validationResult, query } from 'express-validator';
import { Op } from 'sequelize';
import { LearningResource, User } from '../models/index.js';
import { protect, isAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /learning-resources:
 *   get:
 *     summary: Get learning resources
 *     tags: [Learning Resources]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of learning resources
 */
// @route   GET /api/learning-resources
// @desc    Get learning resources
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, difficulty, search, resourceType } = req.query;

    const whereClause = {
      isPublished: true
    };

    if (category) {
      whereClause.category = category;
    }

    if (difficulty) {
      whereClause.difficulty = difficulty;
    }

    if (resourceType) {
      whereClause.resourceType = resourceType;
    }

    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { content: { [Op.like]: `%${search}%` } }
      ];
    }

    const resources = await LearningResource.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: resources,
      count: resources.length
    });
  } catch (error) {
    console.error('Get learning resources error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching learning resources',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /learning-resources/{id}:
 *   get:
 *     summary: Get a single learning resource
 *     tags: [Learning Resources]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Learning resource details
 */
// @route   GET /api/learning-resources/:id
// @desc    Get single learning resource
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const resource = await LearningResource.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Learning resource not found'
      });
    }

    // Increment view count
    await resource.increment('viewCount');

    res.json({
      success: true,
      data: resource
    });
  } catch (error) {
    console.error('Get learning resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching learning resource',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /learning-resources:
 *   post:
 *     summary: Create a learning resource (admin only)
 *     tags: [Learning Resources]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - content
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               content:
 *                 type: string
 *               category:
 *                 type: string
 *               resourceType:
 *                 type: string
 *               url:
 *                 type: string
 *               thumbnail:
 *                 type: string
 *               difficulty:
 *                 type: string
 *               tags:
 *                 type: array
 *     responses:
 *       201:
 *         description: Learning resource created
 */
// @route   POST /api/learning-resources
// @desc    Create learning resource
// @access  Private/Admin
router.post(
  '/',
  protect,
  isAdmin,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('content').trim().notEmpty().withMessage('Content is required'),
    body('category').isIn([
      'entrepreneurship',
      'ecommerce',
      'digital_skills',
      'financial_literacy',
      'marketing',
      'sales',
      'customer_service',
      'business_management'
    ]).withMessage('Invalid category'),
    body('resourceType').optional().isIn(['article', 'video', 'course', 'guide', 'tool', 'template']),
    body('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced'])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const {
        title,
        description,
        content,
        category,
        resourceType = 'article',
        url,
        thumbnail,
        duration,
        difficulty = 'beginner',
        tags = [],
        isPublished = false
      } = req.body;

      const resource = await LearningResource.create({
        title,
        description,
        content,
        category,
        resourceType,
        url: url || null,
        thumbnail: thumbnail || null,
        duration: duration ? parseInt(duration) : null,
        difficulty,
        tags: Array.isArray(tags) ? tags : [],
        isPublished,
        createdBy: req.user.id
      });

      res.status(201).json({
        success: true,
        message: 'Learning resource created successfully',
        data: resource
      });
    } catch (error) {
      console.error('Create learning resource error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating learning resource',
        error: error.message
      });
    }
  }
);

/**
 * @swagger
 * /learning-resources/{id}:
 *   put:
 *     summary: Update a learning resource (admin only)
 *     tags: [Learning Resources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Learning resource updated
 */
// @route   PUT /api/learning-resources/:id
// @desc    Update learning resource
// @access  Private/Admin
router.put('/:id', protect, isAdmin, async (req, res) => {
  try {
    const resource = await LearningResource.findByPk(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Learning resource not found'
      });
    }

    const allowedFields = [
      'title', 'description', 'content', 'category', 'resourceType',
      'url', 'thumbnail', 'duration', 'difficulty', 'tags', 'isPublished'
    ];

    const updateData = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    await resource.update(updateData);

    res.json({
      success: true,
      message: 'Learning resource updated successfully',
      data: resource
    });
  } catch (error) {
    console.error('Update learning resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating learning resource',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /learning-resources/{id}:
 *   delete:
 *     summary: Delete a learning resource (admin only)
 *     tags: [Learning Resources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Learning resource deleted
 */
// @route   DELETE /api/learning-resources/:id
// @desc    Delete learning resource
// @access  Private/Admin
router.delete('/:id', protect, isAdmin, async (req, res) => {
  try {
    const resource = await LearningResource.findByPk(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Learning resource not found'
      });
    }

    await resource.destroy();

    res.json({
      success: true,
      message: 'Learning resource deleted successfully'
    });
  } catch (error) {
    console.error('Delete learning resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting learning resource',
      error: error.message
    });
  }
});

export default router;
