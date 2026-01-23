import express from 'express';
import { protect } from '../middleware/auth.js';
import { Order, Cart, Product } from '../models/index.js';


const router = express.Router();


/**
 * @swagger
 * /payments/initialize:
 *   post:
 *     summary: Initialize payment for an order
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *             properties:
 *               orderId:
 *                 type: integer
 *                 description: Order ID to initialize payment for
 *     responses:
 *       200:
 *         description: Payment initialization successful
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
 *                   type: object
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
// @route   POST /api/payments/create-payment-intent
// @access  Private
router.post('/create-payment-intent', protect, async (req, res) => {
  try {
    const { items, shippingAddress } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart items are required'
      });
    }

    // Calculate total from cart items
    let total = 0;
    for (const item of items) {
      total += parseFloat(item.price) * item.quantity;
    }

    // Convert to kobo (smallest currency unit for NGN)
    const amountInKobo = Math.round(total * 100);

    // Create payment intent
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: amountInKobo,
    //   currency: 'ngn',
    //   metadata: {
    //     userId: req.user.id.toString(),
    //     items: JSON.stringify(items),
    //     shippingAddress: JSON.stringify(shippingAddress || {})
    //   },
    //   automatic_payment_methods: {
    //     enabled: true,
    //   },
    // });

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      }
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating payment intent',
      error: error.message
    });
  }
});

// @route   POST /api/payments/initialize
// @desc    Initialize payment (legacy endpoint - kept for compatibility)
// @access  Private
router.post('/initialize', protect, async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.customerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Convert to kobo
    const amountInKobo = Math.round(parseFloat(order.total) * 100);

    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: amountInKobo,
    //   currency: 'ngn',
    //   metadata: {
    //     orderId: order.id.toString(),
    //     userId: req.user.id.toString()
    //   },
    //   automatic_payment_methods: {
    //     enabled: true,
    //   },
    // });

    res.json({
      success: true,
      message: 'Payment intent created',
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        orderId: order.id,
        amount: order.total,
        currency: 'NGN'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error initializing payment',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /payments/verify:
 *   post:
 *     summary: Verify payment (webhook)
 *     tags: [Payments]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reference
 *             properties:
 *               reference:
 *                 type: string
 *                 description: Payment reference
 *     responses:
 *       200:
 *         description: Payment verified successfully
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
 *                   $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
// @route   POST /api/payments/confirm
// @desc    Confirm payment and create order
// @access  Private
router.post('/confirm', protect, async (req, res) => {
  try {
    const { paymentIntentId, shippingAddress, billingAddress } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment intent ID is required'
      });
    }

    // // Retrieve payment intent from Stripe
    // const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // if (paymentIntent.status !== 'succeeded') {
    //   return res.status(400).json({
    //     success: false,
    //     message: `Payment not completed. Status: ${paymentIntent.status}`
    //   });
    // }

    // Parse metadata
    const items = JSON.parse(paymentIntent.metadata.items || '[]');
    const parsedShippingAddress = JSON.parse(paymentIntent.metadata.shippingAddress || '{}');

    if (items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No items in payment intent'
      });
    }

    // Get first product to determine seller
    const firstProduct = await Product.findByPk(items[0].productId);
    if (!firstProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const sellerId = firstProduct.sellerId;
    const storeId = firstProduct.storeId;

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      if (!product || !product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product ${item.productId} not found or inactive`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`
        });
      }

      const itemTotal = parseFloat(product.price) * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: product.id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.images && product.images[0] ? product.images[0].url : ''
      });
    }

    const shippingCost = 0;
    const tax = 0;
    const discount = 0;
    const total = subtotal + shippingCost + tax - discount;

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create order
    const order = await Order.create({
      orderNumber,
      customerId: req.user.id,
      items: orderItems,
      sellerId,
      storeId,
      shippingAddressName: shippingAddress?.name || parsedShippingAddress?.name || req.user.name,
      shippingAddressStreet: shippingAddress?.street || parsedShippingAddress?.street || req.user.addressStreet || '',
      shippingAddressCity: shippingAddress?.city || parsedShippingAddress?.city || req.user.addressCity || '',
      shippingAddressState: shippingAddress?.state || parsedShippingAddress?.state || req.user.addressState || '',
      shippingAddressCountry: shippingAddress?.country || parsedShippingAddress?.country || req.user.addressCountry || 'Nigeria',
      shippingAddressZipCode: shippingAddress?.zipCode || parsedShippingAddress?.zipCode || req.user.addressZipCode || '',
      shippingAddressPhone: shippingAddress?.phone || parsedShippingAddress?.phone || req.user.phone,
      billingAddressName: billingAddress?.name || shippingAddress?.name || parsedShippingAddress?.name || req.user.name,
      billingAddressStreet: billingAddress?.street || shippingAddress?.street || parsedShippingAddress?.street || req.user.addressStreet,
      billingAddressCity: billingAddress?.city || shippingAddress?.city || parsedShippingAddress?.city || req.user.addressCity,
      billingAddressState: billingAddress?.state || shippingAddress?.state || parsedShippingAddress?.state || req.user.addressState,
      billingAddressCountry: billingAddress?.country || shippingAddress?.country || parsedShippingAddress?.country || req.user.addressCountry,
      billingAddressZipCode: billingAddress?.zipCode || shippingAddress?.zipCode || parsedShippingAddress?.zipCode || req.user.addressZipCode,
      subtotal,
      shippingCost,
      tax,
      discount,
      total,
      paymentStatus: 'paid',
      paymentMethod: 'card',
      // paymentGateway: 'stripe',
      paymentReference: paymentIntent.id,
      orderStatus: 'confirmed'
    });

    // Update product stock
    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      await product.update({
        stock: product.stock - item.quantity,
        salesCount: product.salesCount + item.quantity
      });
    }

    // Clear cart
    const cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (cart) {
      await cart.update({ items: [] });
    }

    res.json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error confirming payment',
      error: error.message
    });
  }
});

// @route   POST /api/payments/verify
// @desc    Verify payment (webhook)
// @access  Public (webhook)
// router.post('/verify', express.raw({ type: 'application/json' }), async (req, res) => {
//   const sig = req.headers['stripe-signature'];
//   const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

//   let event;

//   try {
//     event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
//   } catch (err) {
//     console.error('Webhook signature verification failed:', err.message);
//     return res.status(400).send(`Webhook Error: ${err.message}`);
//   }

  // Handle the event
//   switch (event.type) {
//     case 'payment_intent.succeeded':
//       const paymentIntent = event.data.object;
//       // Update order if exists
//       const order = await Order.findOne({ where: { paymentReference: paymentIntent.id } });
//       if (order) {
//         await order.update({
//           paymentStatus: 'paid',
//           orderStatus: 'confirmed'
//         });
//       }
//       break;
//     case 'payment_intent.payment_failed':
//       const failedPayment = event.data.object;
//       const failedOrder = await Order.findOne({ where: { paymentReference: failedPayment.id } });
//       if (failedOrder) {
//         await failedOrder.update({
//           paymentStatus: 'failed'
//         });
//       }
//       break;
//     default:
//       console.log(`Unhandled event type ${event.type}`);
//   }

//   res.json({ received: true });
// });

export default router;
