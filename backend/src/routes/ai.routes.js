const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

// POST /api/ai/learning-assistant - AI Business Assistant (Powered by Anthropic Claude)
router.post('/learning-assistant', async (req, res) => {
  try {
    const { question } = req.body;
    console.log('========================================');
    console.log('🤖 AI STRATEGIST - Request Received');
    console.log('========================================');
    console.log('📝 Question:', question);

    if (!question) {
      return res.status(400).json({
        success: false,
        error: 'Question is required'
      });
    }

    const CLAUDE_API_KEY = process.env.CLAUDE_API;

    // STEP 1: Check if key exists
    console.log('🔑 STEP 1: Checking API Key...');
    if (!CLAUDE_API_KEY) {
      console.error('❌ CLAUDE_API is MISSING from .env file');
      return res.json({
        success: true,
        response: "AI OFFLINE: The CLAUDE_API key is missing from the .env file.",
        timestamp: new Date().toISOString()
      });
    }
    const trimmedKey = CLAUDE_API_KEY.trim();
    console.log('✅ Key found. Prefix:', trimmedKey.substring(0, 15) + '...');
    console.log('✅ Key length:', trimmedKey.length, 'characters');

    // STEP 2: Build the request
    console.log('📡 STEP 2: Building Anthropic API request...');

    // Use claude-sonnet-4-20250514 which is a current, widely available model
    const modelId = 'claude-sonnet-4-20250514';
    console.log('🧠 Model:', modelId);

    const requestBody = {
      model: modelId,
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `You are ShopNest AI, a helpful business assistant for an e-commerce and job platform. Answer concisely. Question: ${question}`
        }
      ]
    };
    console.log('📦 Request body:', JSON.stringify(requestBody, null, 2));

    // STEP 3: Make the API call
    console.log('🚀 STEP 3: Sending request to https://api.anthropic.com/v1/messages ...');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': trimmedKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    // STEP 4: Read the response
    console.log('📥 STEP 4: Response received');
    console.log('   HTTP Status:', response.status, response.statusText);

    const rawText = await response.text();
    console.log('   Raw response (first 500 chars):', rawText.substring(0, 500));

    let data;
    try {
      data = JSON.parse(rawText);
    } catch (parseErr) {
      console.error('❌ Failed to parse response as JSON:', parseErr.message);
      return res.status(500).json({
        success: false,
        response: `API returned non-JSON: ${rawText.substring(0, 200)}`
      });
    }

    // STEP 5: Check for errors
    console.log('🔍 STEP 5: Checking for errors...');
    if (data.error) {
      console.error('❌ Anthropic API Error:', JSON.stringify(data.error, null, 2));
      return res.status(response.status).json({
        success: false,
        response: `Claude Error [${data.error.type}]: ${data.error.message}`,
        details: data.error
      });
    }

    // STEP 6: Extract text
    console.log('✅ STEP 6: Extracting AI response...');
    const aiText = data.content && data.content[0] ? data.content[0].text : "No content in response.";
    console.log('💬 AI Response (first 200 chars):', aiText.substring(0, 200));
    console.log('========================================');
    console.log('✅ AI REQUEST COMPLETE - SUCCESS');
    console.log('========================================');

    res.json({
      success: true,
      response: aiText,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('========================================');
    console.error('❌ AI REQUEST FAILED - EXCEPTION');
    console.error('========================================');
    console.error('Error Name:', error.name);
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    res.status(500).json({
      success: false,
      response: `AI Exception: [${error.name}] ${error.message}`,
      error: error.message
    });
  }
});

// GET /api/ai/external-jobs - Fetch jobs from Adzuna
router.get('/external-jobs', async (req, res) => {
  try {
    const { search, location = 'us' } = req.query;
    const AD_ID = process.env.ADZUNA_APP_ID;
    const AD_KEY = process.env.ADZUNA_API_KEY;

    if (!AD_ID || !AD_KEY) {
      return res.status(500).json({ success: false, message: 'Adzuna credentials not configured' });
    }

    const url = `https://api.adzuna.com/v1/api/jobs/${location}/search/1?app_id=${AD_ID}&app_key=${AD_KEY}&results_per_page=10&what=${encodeURIComponent(search || 'business')}`;

    const response = await fetch(url);
    const data = await response.json();

    res.json({
      success: true,
      jobs: data.results || []
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
