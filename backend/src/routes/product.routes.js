const express = require('express');
const router = express.Router();
const { Product, User } = require('../models');
const { Op } = require('sequelize');

// GET /api/products - Get all products
router.get('/', async (req, res) => {
  try {
    const { category, minPrice, maxPrice, search } = req.query;

    let where = {};

    if (category) {
      where.category = category;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
    }

    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    const products = await Product.findAll({
      where,
      include: [{ model: User, as: 'seller', attributes: ['name', 'email'] }]
    });

    res.json({
      success: true,
      products,
      total: products.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/products/:id - Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: User, as: 'seller', attributes: ['name', 'email'] }]
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      product
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/products - Create new product
router.post('/', async (req, res) => {
  try {
    const { title, description, price, category, sellerId, image, stock } = req.body;

    if (!title || !description || !price || !sellerId) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, price, and sellerId are required'
      });
    }

    const newProduct = await Product.create({
      title,
      description,
      price: parseFloat(price),
      category: category || 'General',
      image: image || `https://via.placeholder.com/300x200/F59E0B/FFFFFF?text=${encodeURIComponent(title)}`,
      stock: stock || 0,
      sellerId
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: newProduct
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/products/seed - Seed sample products
router.post('/seed', async (req, res) => {
  try {
    const { sellerId } = req.body;
    if (!sellerId) return res.status(400).json({ success: false, message: 'SellerId required' });

    const samples = [
      { title: 'Ultra-Wide Logic Monitor', description: 'Maximum surface area for multi-stream logic analysis.', price: 1200, category: 'Electronics' },
      { title: 'Aeron Ergonomic Throne', description: 'Sustainable support for high-bandwidth engineering sessions.', price: 1500, category: 'Business Tools' },
      { title: 'Quantizer ANC Hub', description: 'Absolute acoustic isolation for deep focus protocols.', price: 450, category: 'Electronics' },
      { title: 'Vector Standing Desk', description: 'Dynamic height adjustment for fluid workflow transitions.', price: 950, category: 'Business Tools' },
      { title: 'Neural-Link Cable Set', description: 'High-fidelity data transmission for premium peripherals.', price: 45, category: 'Electronics' }
    ];

    const products = await Promise.all(samples.map(s => Product.create({
      ...s,
      sellerId,
      image: `https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?auto=format&fit=crop&q=80&w=800`, // Placeholder
      stock: 50
    })));

    res.json({ success: true, message: 'Warehouse populated.', products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
