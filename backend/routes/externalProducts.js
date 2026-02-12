import express from 'express';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/external-products
// @desc    Fetch products from external API
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const response = await fetch('https://fakestoreapiserver.reactbd.org/api/products');
    
    if (!response.ok) {
      throw new Error(`External API error: ${response.status} ${response.statusText}`);
    }
    
    const products = await response.json();
    
    res.json({
      success: true,
      data: products
    });
    
  } catch (error) {
    console.error('External products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
});

// @route   GET /api/external-products/:id
// @desc    Fetch single product from external API
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const response = await fetch(`https://fakestoreapiserver.reactbd.org/api/products/${id}`);
    
    if (!response.ok) {
      throw new Error(`External API error: ${response.status} ${response.statusText}`);
    }
    
    const product = await response.json();
    
    res.json({
      success: true,
      data: product
    });
    
  } catch (error) {
    console.error('External product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message
    });
  }
});

export default router;
