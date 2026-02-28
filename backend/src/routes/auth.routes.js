const express = require('express');
const router = express.Router();
const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateOTP, sendEmailOTP, sendSmsOTP, storeOTP, verifyOTP } = require('../utils/verification');

// POST /api/auth/register - Step 1: Register and send OTP
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Generate OTP
    const otp = generateOTP();

    // Store OTP with user data for later creation
    const hashedPassword = await bcrypt.hash(password, 10);
    storeOTP(email, otp, {
      name,
      email,
      password: hashedPassword,
      role: role || 'buyer',
      phone: phone || null
    });

    // Send OTP via email
    const emailSent = await sendEmailOTP(email, otp);

    // Send OTP via SMS if phone provided
    let smsSent = false;
    if (phone) {
      smsSent = await sendSmsOTP(phone, otp);
    }

    res.json({
      success: true,
      message: 'Verification code sent',
      verificationSent: {
        email: emailSent,
        sms: smsSent
      },
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

    const result = verifyOTP(email, otp);
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
    storeOTP(email, otp, { userId: user.id });

    // Send OTP via email
    const emailSent = await sendEmailOTP(email, otp);

    // Send OTP via SMS if phone exists
    let smsSent = false;
    if (user.phone) {
      smsSent = await sendSmsOTP(user.phone, otp);
    }

    res.json({
      success: true,
      message: 'Verification code sent',
      verificationSent: {
        email: emailSent,
        sms: smsSent
      },
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

    const result = verifyOTP(email, otp);
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
    storeOTP(email, otp);

    const emailSent = await sendEmailOTP(email, otp);

    let smsSent = false;
    if (phone) {
      smsSent = await sendSmsOTP(phone, otp);
    }

    res.json({
      success: true,
      message: 'New verification code sent',
      verificationSent: { email: emailSent, sms: smsSent }
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
