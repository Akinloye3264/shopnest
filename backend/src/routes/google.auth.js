const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();
const { User } = require('../models');
const jwt = require('jsonwebtoken');

// GET /api/google-auth/google - Real Google OAuth
router.get('/google', (req, res) => {
  const { GOOGLE_CLIENT_ID } = process.env;

  if (!GOOGLE_CLIENT_ID) {
    return res.status(500).json({
      success: false,
      message: 'Google Client ID not configured'
    });
  }

  const backendUrl = process.env.BACKEND_URL || 'http://localhost:5001';
  const redirectUri = `${backendUrl}/api/google-auth/callback`;
  const scope = 'email profile';

  console.log('--- Google OAuth Debug ---');
  console.log('Redirect URI:', redirectUri);
  console.log('Client ID:', GOOGLE_CLIENT_ID);
  console.log('---------------------------');

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${GOOGLE_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=code&` +
    `scope=${encodeURIComponent(scope)}&` +
    `access_type=offline&` +
    `prompt=consent`;

  res.redirect(googleAuthUrl);
});

// GET /api/google-auth/callback - Handle OAuth callback
router.get('/callback', async (req, res) => {
  const { code, error } = req.query;

  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Google OAuth failed',
      error: error
    });
  }

  if (!code) {
    return res.status(400).json({
      success: false,
      message: 'Authorization code not provided'
    });
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_SECRET,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.BACKEND_URL}/api/google-auth/callback`
      })
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to exchange code for tokens',
        error: tokenData.error_description
      });
    }

    // Get user info
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    });

    const userData = await userResponse.json();

    // Find or create user in database
    let user = await User.findOne({ where: { email: userData.email } });

    if (!user) {
      user = await User.create({
        name: userData.name,
        email: userData.email,
        picture: userData.picture,
        googleId: userData.id,
        role: 'buyer' // Default role
      });
    } else if (!user.googleId) {
      // Link google account if email matches but no googleId
      user.googleId = userData.id;
      user.picture = userData.picture;
      await user.save();
    }

    const mockToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_secret || 'secret',
      { expiresIn: '24h' }
    );

    const safeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      role: user.role
    };

    // Redirect to frontend callback with user data
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const redirectUrl = `${frontendUrl}/auth/callback?token=${mockToken}&user=${encodeURIComponent(JSON.stringify(safeUser))}`;

    res.redirect(redirectUrl);

  } catch (error) {
    console.error('Google OAuth error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during Google OAuth'
    });
  }
});

// GET /api/google-auth/success - OAuth success endpoint
router.get('/success', (req, res) => {
  res.json({
    success: true,
    message: 'Google OAuth successful'
  });
});

// GET /api/google-auth/failure - OAuth failure endpoint
router.get('/failure', (req, res) => {
  res.status(400).json({
    success: false,
    message: 'Google OAuth failed'
  });
});

module.exports = router;
