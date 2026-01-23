import express from 'express';
import { body, validationResult } from 'express-validator';
import { protect } from '../middleware/auth.js';
import { ProductRequest, User } from '../models/index.js';
import sendEmail from '../utils/sendEmail.js';

const router = express.Router();

/**
 * @swagger
 * /product-requests:
 *   post:
 *     summary: Create a product request (for products not found)
 *     tags: [Product Requests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productName
 *               - phone
 *             properties:
 *               productName:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Product request created and sellers notified
 *       400:
 *         description: Validation error
 */
// @route   POST /api/product-requests
// @desc    Create a product request and notify all sellers
// @access  Private
router.post(
  '/',
  protect,
  [
    body('productName').trim().notEmpty().withMessage('Product name is required'),
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
    body('description').optional().trim(),
    body('image').optional().isString()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { productName, description, image, phone } = req.body;

      // Create product request
      const productRequest = await ProductRequest.create({
        buyerId: req.user.id,
        buyerPhone: phone,
        productName,
        description,
        image
      });

      // Get all approved sellers
      const sellers = await User.findAll({
        where: {
          role: 'seller',
          isApproved: true,
          isSuspended: false
        }
      });

      // Notify all sellers via email
      const notificationPromises = sellers.map(async (seller) => {
        try {
          const requestUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/seller/dashboard`;

          await sendEmail({
            email: seller.email,
            subject: `New Product Request: ${productName}`,
            message: `
              A buyer is looking for a product that might not be available on the platform:
              
              Product Name: ${productName}
              ${description ? `Description: ${description}` : ''}
              Buyer Phone: ${phone}
              
              If you have this product or can source it, please log in to your seller dashboard to see the request.
              
              ${requestUrl}
            `,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>New Product Request</h2>
                <p>A buyer is looking for a product that might not be available on the platform.</p>
                
                <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
                  <h3 style="margin-top: 0;">Product Details</h3>
                  <p><strong>Product Name:</strong> ${productName}</p>
                  ${description ? `<p><strong>Description:</strong> ${description}</p>` : ''}
                  ${image ? `<p><strong>Image:</strong> <img src="${image}" alt="${productName}" style="max-width: 300px; margin-top: 10px;" /></p>` : ''}
                  <p><strong>Buyer Phone:</strong> ${phone}</p>
                </div>
                
                <p>If you have this product or can source it, please log in to your seller dashboard to see the request.</p>
                
                <a href="${requestUrl}" style="display: inline-block; padding: 10px 20px; background-color: #3B82F6; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
                  View Dashboard
                </a>
              </div>
            `
          });

          // Track notified sellers
          if (!productRequest.notifiedSellers.includes(seller.id)) {
            productRequest.notifiedSellers.push(seller.id);
          }
        } catch (error) {
          console.error(`Error notifying seller ${seller.id}:`, error);
        }
      });

      await Promise.all(notificationPromises);
      await productRequest.save();

      res.status(201).json({
        success: true,
        message: 'Product request created. All sellers have been notified.',
        data: productRequest
      });
    } catch (error) {
      console.error('Error creating product request:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating product request',
        error: error.message
      });
    }
  }
);

/**
 * @swagger
 * /product-requests:
 *   get:
 *     summary: Get product requests (for sellers)
 *     tags: [Product Requests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of product requests
 */
// @route   GET /api/product-requests
// @desc    Get product requests (for sellers)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    // Admins and sellers can see all requests
    // Buyers see only their own requests
    const where = {};
    if (req.user.role === 'customer') {
      where.buyerId = req.user.id;
    }

    const requests = await ProductRequest.findAll({
      where,
      include: [
        {
          model: User,
          as: 'buyer',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Error fetching product requests:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product requests',
      error: error.message
    });
  }
});

export default router;
