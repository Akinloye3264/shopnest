import express from 'express';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/ai/learning-assistant
// @desc    AI Learning Assistant using Cohere
// @access  Private
router.post('/learning-assistant', protect, async (req, res) => {
  try {
    const { query, context } = req.body;

    if (!query || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Query is required'
      });
    }

    const apiKey = process.env.COHERE_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: 'Cohere API service not configured'
      });
    }

    // AI prompt based on context
    let prompt = `You are a helpful learning assistant for ShopNest, an e-commerce and business learning platform.`;
    
    if (context === 'learning_resources') {
      prompt += ` You help users find learning resources, understand business concepts, and get recommendations for skill development.
      
      Available categories include:
      - Entrepreneurship
      - E-commerce
      - Digital Skills
      - Financial Literacy
      - Marketing
      - Sales
      - Customer Service
      - Business Management
      
      Available resource types: articles, videos, courses, guides, tools, templates.
      Available difficulty levels: beginner, intermediate, advanced.
      
      Provide helpful, actionable responses related to learning and skill development.

User question: ${query}`;
    } else {
      prompt += `

User question: ${query}`;
    }

    const response = await fetch('https://api.cohere.ai/v1/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Cohere-Version': '2024-05-21'
      },
      body: JSON.stringify({
        model: 'command-nightly',
        message: prompt,
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`Cohere API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.text || 'Sorry, I could not process your request.';

    res.json({
      success: true,
      response: aiResponse
    });

  } catch (error) {
    console.error('AI Assistant error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing AI request',
      error: error.message
    });
  }
});

// @route   GET /api/ai/learning-resources
// @desc    Get AI-generated learning resources
// @access  Private
router.get('/learning-resources', protect, async (req, res) => {
  try {
    const { category, difficulty } = req.query;
    const apiKey = process.env.COHERE_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: 'Cohere API service not configured'
      });
    }

    let prompt = `Generate 5 learning resources for business and professional development.`;
    
    if (category) {
      prompt += ` Focus on ${category}.`;
    }
    if (difficulty) {
      prompt += ` Target ${difficulty} level.`;
    }
    
    prompt += ` For each resource, provide:
1. Title
2. Description
3. Category
4. Difficulty level
5. Resource type (article, video, course, guide, tool, template)
6. Brief content summary

Format as JSON array.`;

    const response = await fetch('https://api.cohere.ai/v1/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Cohere-Version': '2024-05-21'
      },
      body: JSON.stringify({
        model: 'command-nightly',
        message: prompt,
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`Cohere API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.text || '[]';

    try {
      const resources = JSON.parse(aiResponse);
      res.json({
        success: true,
        data: resources
      });
    } catch (parseError) {
      res.json({
        success: true,
        data: []
      });
    }

  } catch (error) {
    console.error('Learning resources error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching learning resources',
      error: error.message
    });
  }
});

export default router;
