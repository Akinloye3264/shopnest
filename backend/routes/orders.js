import express from 'express';
import { protect } from '../middleware/auth.js';
import { Order, Product, User, Store } from '../models/index.js';

const router = express.Router();

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { items, shippingAddress, billingAddress, discountCode } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order items are required'
      });
    }

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

    // Get seller (assuming single seller per order for simplicity)
    const firstProduct = await Product.findByPk(items[0].productId);
    const sellerId = firstProduct.sellerId;
    const storeId = firstProduct.storeId;

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const shippingCost = 0;
    const tax = 0;
    const discount = 0;
    const total = subtotal + shippingCost + tax - discount;

    const order = await Order.create({
      orderNumber,
      customerId: req.user.id,
      items: orderItems,
      sellerId,
      storeId,
      shippingAddressName: shippingAddress?.name || req.user.name,
      shippingAddressStreet: shippingAddress?.street || req.user.addressStreet,
      shippingAddressCity: shippingAddress?.city || req.user.addressCity,
      shippingAddressState: shippingAddress?.state || req.user.addressState,
      shippingAddressCountry: shippingAddress?.country || req.user.addressCountry,
      shippingAddressZipCode: shippingAddress?.zipCode || req.user.addressZipCode,
      shippingAddressPhone: shippingAddress?.phone || req.user.phone,
      billingAddressName: billingAddress?.name || shippingAddress?.name || req.user.name,
      billingAddressStreet: billingAddress?.street || shippingAddress?.street || req.user.addressStreet,
      billingAddressCity: billingAddress?.city || shippingAddress?.city || req.user.addressCity,
      billingAddressState: billingAddress?.state || shippingAddress?.state || req.user.addressState,
      billingAddressCountry: billingAddress?.country || shippingAddress?.country || req.user.addressCountry,
      billingAddressZipCode: billingAddress?.zipCode || shippingAddress?.zipCode || req.user.addressZipCode,
      subtotal,
      shippingCost,
      tax,
      discount,
      discountCode,
      total,
      paymentStatus: 'pending',
      orderStatus: 'pending'
    });

    // Update product stock
    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      await product.update({
        stock: product.stock - item.quantity,
        salesCount: product.salesCount + item.quantity
      });
    }

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message
    });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'name', 'email']
        },
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
      ]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check authorization
    if (
      order.customerId !== req.user.id &&
      order.sellerId !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message
    });
  }
});

export default router;
