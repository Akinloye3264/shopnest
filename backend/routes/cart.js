import express from 'express';
import { body, validationResult } from 'express-validator';
import { protect } from '../middleware/auth.js';
import { Cart, Product, User } from '../models/index.js';

const router = express.Router();

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Get user's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 */
// @route   GET /api/cart
// @desc    Get user's cart
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    // Admins can access any cart (though typically they'd query by userId)
    // For now, admins get their own cart or can be extended later
    let cart = await Cart.findOne({ where: { userId: req.user.id } });

    if (!cart) {
      // Create empty cart if it doesn't exist
      cart = await Cart.create({
        userId: req.user.id,
        items: []
      });
    }

    // Enrich cart items with product details
    const enrichedItems = await Promise.all(
      cart.items.map(async (item) => {
        try {
          const product = await Product.findByPk(item.productId, {
            include: [
              {
                model: User,
                as: 'seller',
                attributes: ['id', 'name', 'storeName', 'storeSlug', 'email', 'phone']
              }
            ]
          });

          if (!product || !product.isActive) {
            return null;
          }

          return {
            ...item,
            product: {
              id: product.id,
              name: product.name,
              price: product.price,
              stock: product.stock,
              image: product.images?.[0]?.url || '',
              sellerEmail: product.sellerEmail || product.seller?.email,
              sellerPhone: product.sellerPhone || product.seller?.phone
            }
          };
        } catch (error) {
          return null;
        }
      })
    );

    // Filter out null items (products that no longer exist)
    const validItems = enrichedItems.filter(item => item !== null);

    // Update cart if items were removed
    if (validItems.length !== cart.items.length) {
      cart.items = validItems.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        sellerId: item.sellerId
      }));
      await cart.save();
    }

    res.json({
      success: true,
      data: {
        id: cart.id,
        items: validItems,
        total: validItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0)
      }
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching cart',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /cart:
 *   post:
 *     summary: Add item to cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Item added to cart
 *       400:
 *         description: Validation error
 */
// @route   POST /api/cart
// @desc    Add item to cart
// @access  Private
router.post(
  '/',
  protect,
  [
    body('productId').isInt().withMessage('Valid product ID is required'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { productId, quantity } = req.body;

      // Check if product exists and is active
      const product = await Product.findByPk(productId);
      if (!product || !product.isActive) {
        return res.status(404).json({
          success: false,
          message: 'Product not found or inactive'
        });
      }

      if (product.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock. Only ${product.stock} available.`
        });
      }

      // Get or create cart
      let cart = await Cart.findOne({ where: { userId: req.user.id } });
      if (!cart) {
        cart = await Cart.create({
          userId: req.user.id,
          items: []
        });
      }

      // Check if item already exists in cart
      const itemIndex = cart.items.findIndex(item => item.productId === productId);

      if (itemIndex > -1) {
        // Update quantity
        cart.items[itemIndex].quantity += quantity;
        if (cart.items[itemIndex].quantity > product.stock) {
          return res.status(400).json({
            success: false,
            message: `Total quantity exceeds stock. Maximum: ${product.stock}`
          });
        }
      } else {
        // Add new item
        cart.items.push({
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: quantity,
          image: product.images?.[0]?.url || '',
          sellerId: product.sellerId
        });
      }

      await cart.save();

      res.json({
        success: true,
        message: 'Item added to cart',
        data: cart
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      res.status(500).json({
        success: false,
        message: 'Error adding to cart',
        error: error.message
      });
    }
  }
);

/**
 * @swagger
 * /cart/{productId}:
 *   patch:
 *     summary: Update item quantity in cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Cart updated successfully
 *       404:
 *         description: Item not found in cart
 */
// @route   PATCH /api/cart/:productId
// @desc    Update item quantity in cart
// @access  Private
router.patch(
  '/:productId',
  protect,
  [
    body('quantity').isInt({ min: 0 }).withMessage('Quantity must be 0 or greater')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { productId } = req.params;
      const { quantity } = req.body;

      const cart = await Cart.findOne({ where: { userId: req.user.id } });
      if (!cart) {
        return res.status(404).json({
          success: false,
          message: 'Cart not found'
        });
      }

      const itemIndex = cart.items.findIndex(item => item.productId === parseInt(productId));
      if (itemIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Item not found in cart'
        });
      }

      if (quantity === 0) {
        // Remove item
        cart.items.splice(itemIndex, 1);
      } else {
        // Check stock
        const product = await Product.findByPk(productId);
        if (!product || !product.isActive) {
          return res.status(404).json({
            success: false,
            message: 'Product not found or inactive'
          });
        }

        if (product.stock < quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock. Only ${product.stock} available.`
          });
        }

        cart.items[itemIndex].quantity = quantity;
      }

      await cart.save();

      res.json({
        success: true,
        message: 'Cart updated',
        data: cart
      });
    } catch (error) {
      console.error('Error updating cart:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating cart',
        error: error.message
      });
    }
  }
);

/**
 * @swagger
 * /cart/{productId}:
 *   delete:
 *     summary: Remove item from cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Item removed from cart
 */
// @route   DELETE /api/cart/:productId
// @desc    Remove item from cart
// @access  Private
router.delete('/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.items = cart.items.filter(item => item.productId !== parseInt(productId));
    await cart.save();

    res.json({
      success: true,
      message: 'Item removed from cart',
      data: cart
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing from cart',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /cart:
 *   delete:
 *     summary: Clear entire cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared successfully
 */
// @route   DELETE /api/cart
// @desc    Clear entire cart
// @access  Private
router.delete('/', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.items = [];
    await cart.save();

    res.json({
      success: true,
      message: 'Cart cleared',
      data: cart
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing cart',
      error: error.message
    });
  }
});

export default router;
