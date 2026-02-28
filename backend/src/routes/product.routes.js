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

module.exports = router;
