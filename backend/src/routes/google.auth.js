const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();
const { User } = require('../models');
const jwt = require('jsonwebtoken');

const getAppUrl = (value, fallback) => value || fallback;

const readResponseText = async (response) => {
  try {
    return await response.text();
  } catch (error) {
    return '';
  }
};

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
    const backendUrl = getAppUrl(process.env.BACKEND_URL, 'http://localhost:5001');
    const frontendUrl = getAppUrl(process.env.FRONTEND_URL, 'http://localhost:5173');

    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_SECRET) {
      console.error('Google OAuth is missing GOOGLE_CLIENT_ID or GOOGLE_SECRET');
      return res.status(500).json({
        success: false,
        message: 'Google OAuth is not configured on the server'
      });
    }

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
        redirect_uri: `${backendUrl}/api/google-auth/callback`
      })
    });

    if (!tokenResponse.ok) {
      const tokenErrorText = await readResponseText(tokenResponse);
      console.error('Google token exchange failed:', tokenResponse.status, tokenErrorText);
      return res.status(400).json({
        success: false,
        message: 'Failed to exchange Google authorization code',
        error: tokenErrorText || 'Unknown token exchange error'
      });
    }

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

    if (!userResponse.ok) {
      const userErrorText = await readResponseText(userResponse);
      console.error('Google userinfo request failed:', userResponse.status, userErrorText);
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch Google user profile',
        error: userErrorText || 'Unknown userinfo error'
      });
    }

    const userData = await userResponse.json();

    if (!userData.email) {
      console.error('Google OAuth user profile did not include an email:', userData);
      return res.status(400).json({
        success: false,
        message: 'Google account email was not returned'
      });
    }

    // Find or create user in database
    let user = await User.findOne({ where: { email: userData.email } });

    if (!user) {
      // New Google user — redirect to role selection before creating account
      const tempToken = jwt.sign(
        {
          isGoogleSetup: true,
          googleData: {
            name: userData.name,
            email: userData.email,
            googleId: userData.id,
            picture: userData.picture || null
          }
        },
        process.env.JWT_secret || 'secret',
        { expiresIn: '15m' }
      );

      const frontendUrl = process.env.FRONTEND_URL;
      return res.redirect(`${frontendUrl}/auth/select-role?token=${tempToken}`);
    }

    if (!user.googleId) {
      // Link google account if email matches but no googleId
      try {
        user.googleId = userData.id;
        user.picture = userData.picture;
        await user.save();
      } catch (linkError) {
        if (linkError.name === 'SequelizeUniqueConstraintError') {
          const linkedUser = await User.findOne({ where: { googleId: userData.id } });
          if (linkedUser) {
            user = linkedUser;
          } else {
            throw linkError;
          }
        } else {
          throw linkError;
        }
      }
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

    const redirectUrl = `${frontendUrl}/auth/callback?token=${mockToken}&user=${encodeURIComponent(JSON.stringify(safeUser))}`;

    res.redirect(redirectUrl);

  } catch (error) {
    console.error('Google OAuth error:', error);
    const frontendUrl = getAppUrl(process.env.FRONTEND_URL, 'http://localhost:5173');
    return res.redirect(`${frontendUrl}/login?error=google_oauth_failed`);
  }
});

// POST /api/google-auth/complete-signup - Create new Google user with chosen role
router.post('/complete-signup', async (req, res) => {
  const { token, role } = req.body;

  const validRoles = ['buyer', 'seller', 'job_seeker', 'employer', 'employee'];
  if (!token || !role || !validRoles.includes(role)) {
    return res.status(400).json({ success: false, message: 'Invalid token or role' });
  }

  try {
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_secret || 'secret');
    } catch (jwtErr) {
      if (jwtErr.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Setup link expired. Please sign in with Google again.' });
      }
      return res.status(401).json({ success: false, message: 'Invalid setup token. Please sign in with Google again.' });
    }

    if (!decoded.isGoogleSetup || !decoded.googleData) {
      return res.status(400).json({ success: false, message: 'Invalid setup token' });
    }

    const { name, email, googleId, picture } = decoded.googleData;

    // Check if user was already created (double-submit guard)
    let user = await User.findOne({ where: { email } });
    if (!user) {
      user = await User.create({
        name,
        email,
        password: null,
        role,
        phone: null,
        googleId,
        picture: picture || null,
        isVerified: true
      });
      console.log(`✅ New Google user created: ${user.email} (${user.role})`);
    } else if (!user.googleId) {
      // Link google to existing account
      user.googleId = googleId;
      user.picture = picture || user.picture;
      await user.save();
    }

    const authToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_secret || 'secret',
      { expiresIn: '24h' }
    );

    return res.json({
      success: true,
      token: authToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        role: user.role
      }
    });
  } catch (err) {
    console.error('complete-signup error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error. Please try again.' });
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
