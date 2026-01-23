import express from 'express';
import { Op, Sequelize } from 'sequelize';
import { body, validationResult } from 'express-validator';
import { protect, isSeller } from '../middleware/auth.js';
import { Product, Store, User } from '../models/index.js';

const router = express.Router();

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search products by name or description
 *       - in: query
 *         name: seller
 *         schema:
 *           type: integer
 *         description: Filter by seller ID
 *       - in: query
 *         name: featured
 *         schema:
 *           type: boolean
 *         description: Filter featured products
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of products
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
 *                 pagination:
 *                   type: object
 */
router.get('/', async (req, res) => {
  try {
    const { category, search, seller, featured, page = 1, limit = 20 } = req.query;
    const where = { isActive: true };

    if (category) where.category = category;
    if (seller) where.sellerId = seller;
    if (featured === 'true') where.isFeatured = true;
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: products } = await Product.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'name', 'storeName', 'storeSlug']
        },
        {
          model: Store,
          as: 'store',
          attributes: ['id', 'name', 'slug', 'logo']
        }
      ],
      order: [['id', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    // Return flag for frontend to show product request option if no results and search was performed
    const response = {
      success: true,
      data: products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / parseInt(limit))
      },
      noResults: count === 0 && !!search // Flag for frontend to show product request option
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get a single product by ID
 *     tags: [Products]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'name', 'storeName', 'storeSlug']
        },
        {
          model: Store,
          as: 'store',
          attributes: ['id', 'name', 'slug', 'logo']
        }
      ]
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Increment views
    product.views += 1;
    await product.save();

    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - price
 *               - category
 *               - stock
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *               stock:
 *                 type: integer
 *               images:
 *                 type: array
 *                 items:
 *                   type: object
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Validation error
 */
router.post(
  '/',
  protect,
  isSeller,
  [
    body('name').trim().notEmpty().withMessage('Product name is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('stock').isInt({ min: 0 }).withMessage('Valid stock quantity is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const store = await Store.findOne({ where: { ownerId: req.user.id } });
      if (!store) {
        return res.status(404).json({
          success: false,
          message: 'Store not found. Please set up your store first.'
        });
      }

      const { name, description, price, category, stock, images, tags, sku, compareAtPrice } = req.body;

      const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now();

      const product = await Product.create({
        name,
        slug,
        description,
        price,
        compareAtPrice,
        category,
        stock,
        images: images || [],
        tags: tags || [],
        sku,
        sellerId: req.user.id,
        storeId: store.id,
        sellerEmail: req.user.email,
        sellerPhone: req.user.phone
      });

      res.status(201).json({
        success: true,
        data: product
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating product',
        error: error.message
      });
    }
  }
);

/**
 * @swagger
 * /products/{id}:
 *   patch:
 *     summary: Update a product
 *     tags: [Products]
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
 *         description: Product updated successfully
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Product not found
 */
router.patch('/:id', protect, isSeller, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Allow admins to update any product, or sellers to update their own
    if (req.user.role !== 'admin' && product.sellerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this product'
      });
    }

    await product.update(req.body);

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating product',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Products]
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
 *         description: Product deleted successfully
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Product not found
 */
router.delete('/:id', protect, isSeller, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Allow admins to delete any product, or sellers to delete their own
    if (req.user.role !== 'admin' && product.sellerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this product'
      });
    }

    await product.destroy();

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message
    });
  }
});

export default router;
