const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const multer = require('multer');
const pdf = require('pdf-parse');
const upload = multer();

// POST /api/ai/learning-assistant - AI Business Assistant (Powered by Anthropic Claude)
router.post('/learning-assistant', async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ success: false, error: 'Question is required' });
    }

    const CLAUDE_API_KEY = process.env.CLAUDE_API;
    if (!CLAUDE_API_KEY) {
      return res.json({ success: true, response: "AI OFFLINE: The CLAUDE_API key is missing.", timestamp: new Date().toISOString() });
    }

    const requestBody = {
      model: 'claude-opus-4-1',
      max_tokens: 1024,
      messages: [{ role: 'user', content: `You are ShopNest AI, a helpful business assistant for an e-commerce and job platform. Answer concisely. Question: ${question}` }]
    };

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': CLAUDE_API_KEY.trim(),
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    
    // Check for API errors
    if (data.error) {
      console.error('Claude API Error:', data.error);
      return res.json({ success: true, response: `AI Error: ${data.error.message || 'API request failed'}`, timestamp: new Date().toISOString() });
    }
    
    const aiText = data.content && data.content[0] ? data.content[0].text : "No content in response.";

    res.json({ success: true, response: aiText, timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ success: false, response: `AI Exception: ${error.message}` });
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

    const url = `https://api.adzuna.com/v1/api/jobs/${location}/search/1?app_id=${AD_ID}&app_key=${AD_KEY}&results_per_page=20&what=${encodeURIComponent(search || 'software business design')}&content-type=application/json&sort_by=relevance`;

    const response = await fetch(url);
    if (!response.ok) return res.status(response.status).json({ success: false, message: 'External API Error' });

    const data = await response.json();

    res.json({
      success: true,
      jobs: (data.results || []).map(job => ({
        id: job.id,
        title: (job.title || 'Specialist').replace(/<\/?[^>]+(>|$)/g, ""),
        company: job.company?.display_name || 'Global Enterprise',
        location: job.location?.display_name || 'Remote / Tier 1',
        description: (job.description || 'Access specifications via external node.').replace(/<\/?[^>]+(>|$)/g, ""),
        redirect_url: job.redirect_url,
        salary: job.salary_min ? `$${Math.round(job.salary_min)} - $${Math.round(job.salary_max)}` : 'Competitive'
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/ai/audit-resume - AI Resume Auditor
router.post('/audit-resume', upload.single('resume'), async (req, res) => {
  try {
    const { focus, salary } = req.body;
    const CLAUDE_API_KEY = process.env.CLAUDE_API;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'PDF Resume is required' });
    }

    if (!CLAUDE_API_KEY) {
      return res.json({ success: true, audit: "AI SERVICE OFFLINE: Please configure Claude API." });
    }

    let pdfParser = pdf;
    // Handle ESM/CJS mismatch
    if (typeof pdfParser !== 'function' && pdfParser.default) {
      pdfParser = pdfParser.default;
    }

    let resumeText = '';
    try {
      if (typeof pdfParser === 'function') {
        const pdfData = await pdfParser(req.file.buffer);
        resumeText = pdfData.text;
      } else {
        console.error('PDF Parser is not a function:', typeof pdfParser);
        resumeText = "Error: PDF processing engine mismatch.";
      }
    } catch (pdfErr) {
      console.error('PDF Extraction Error:', pdfErr);
      resumeText = "Error extracting text from PDF.";
    }

    const requestBody = {
      model: 'claude-opus-4-1',
      max_tokens: 1500,
      messages: [
        {
          role: 'user',
          content: `You are an expert HR auditor. Analyze this resume text and provide a strategic audit report.
          Target Focus: ${focus || 'General'}
          Desired Salary: ${salary || 'Market Rate'}
          
          Resume Content:
          ${resumeText}
          
          Format your response with:
          1. **Strategic Score** (x/100)
          2. **Gap Analysis**
          3. **Salary Realism Check**
          4. **Recommended Upskills**`
        }
      ]
    };

    const aiResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': CLAUDE_API_KEY.trim(),
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await aiResponse.json();
    const auditText = data.content && data.content[0] ? data.content[0].text : "Audit failed.";

    res.json({
      success: true,
      audit: auditText
    });
  } catch (error) {
    console.error('Audit Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
