const express = require('express');
const router = express.Router();
const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateOTP, sendEmailOTP, sendSmsOTP, storeOTP, verifyOTP } = require('../utils/verification');

// POST /api/auth/register - Email/password (OTP flow) OR Google signup (direct login)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone, googleId, picture } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      // If same Google user tries again, just log them in
      if (googleId && existingUser.googleId === googleId) {
        const token = jwt.sign(
          { id: existingUser.id, email: existingUser.email, role: existingUser.role },
          process.env.JWT_secret || 'secret',
          { expiresIn: '24h' }
        );
        return res.json({
          success: true,
          googleSignup: true,
          token,
          user: { id: existingUser.id, name: existingUser.name, email: existingUser.email, role: existingUser.role, picture: existingUser.picture }
        });
      }
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    // ── GOOGLE SIGNUP: email already verified by Google, create account directly ──
    if (googleId) {
      const user = await User.create({
        name,
        email,
        password: null,
        role: role || 'buyer',
        phone: phone || null,
        googleId,
        picture: picture || null,
        isVerified: true
      });

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_secret || 'secret',
        { expiresIn: '24h' }
      );

      return res.status(201).json({
        success: true,
        googleSignup: true,
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role, picture: user.picture }
      });
    }

    // ── EMAIL/PASSWORD SIGNUP: send OTP for verification ──
    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required' });
    }

    const otp = generateOTP();
    const hashedPassword = await bcrypt.hash(password, 10);
    await storeOTP(email, otp, {
      name,
      email,
      password: hashedPassword,
      role: role || 'buyer',
      phone: phone || null
    });

    const emailSent = await sendEmailOTP(email, otp);
    const smsSent = phone ? await sendSmsOTP(phone, otp) : false;

    res.json({
      success: true,
      message: 'Verification code sent',
      verificationSent: { email: emailSent, sms: smsSent, whatsapp: false },
      requiresVerification: true
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/auth/verify-register - Step 2: Verify OTP and create account
router.post('/verify-register', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and verification code are required'
      });
    }
    const result = await verifyOTP(email, otp);
    if (!result.valid) {
      return res.status(400).json({ success: false, message: result.message });
    }

    // Create the user now that OTP is verified
    const userData = result.userData;
    const user = await User.create({
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: userData.role,
      phone: userData.phone,
      isVerified: true
    });

    res.status(201).json({
      success: true,
      message: 'Account verified and created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Verify register error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/auth/login - Step 1: Verify credentials and send OTP
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
    } else if (user.googleId) {
      return res.status(401).json({ success: false, message: 'Please sign in with Google' });
    }

    // Generate and send OTP
    const otp = generateOTP();
    await storeOTP(email, otp, { userId: user.id });

    // Send OTP via email and SMS (same code)
    const emailSent = await sendEmailOTP(email, otp);
    const smsSent = user.phone ? await sendSmsOTP(user.phone, otp) : false;

    res.json({
      success: true,
      message: 'Verification code sent',
      verificationSent: { email: emailSent, sms: smsSent, whatsapp: false },
      requiresVerification: true
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/auth/verify-login - Step 2: Verify OTP and complete login
router.post('/verify-login', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and verification code are required'
      });
    }

    const result = await verifyOTP(email, otp);
    if (!result.valid) {
      return res.status(400).json({ success: false, message: result.message });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Mark as verified if not already
    if (!user.isVerified) {
      user.isVerified = true;
      await user.save();
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_secret || 'secret',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        picture: user.picture
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/auth/resend-otp - Resend verification code
router.post('/resend-otp', async (req, res) => {
  try {
    const { email, phone, context } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const otp = generateOTP();
    await storeOTP(email, otp);

    const emailSent = await sendEmailOTP(email, otp);
    const smsSent = phone ? await sendSmsOTP(phone, otp) : false;

    res.json({
      success: true,
      message: 'New verification code sent',
      verificationSent: { email: emailSent, sms: smsSent, whatsapp: false }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/auth/forgot-password - Request password reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const otp = generateOTP();
    await storeOTP(email, otp, { resetPassword: true });

    const emailSent = await sendEmailOTP(email, otp);
    const smsSent = user.phone ? await sendSmsOTP(user.phone, otp) : false;

    res.json({
      success: true,
      message: 'Password reset code sent',
      verificationSent: { email: emailSent, sms: smsSent, whatsapp: false }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/auth/reset-password - Reset password with OTP
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, verification code, and new password are required'
      });
    }

    const result = await verifyOTP(email, otp);
    if (!result.valid) {
      return res.status(400).json({ success: false, message: result.message });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/auth/profile
router.get('/profile', async (req, res) => {
  try {
    res.status(501).json({ message: 'Profile route requires authentication middleware' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
