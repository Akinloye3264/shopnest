const nodemailer = require('nodemailer');
const twilio = require('twilio');

// In-memory OTP store (in production, use Redis or DB)
const otpStore = new Map();

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Create Nodemailer transporter
const createEmailTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

// Create Twilio client
const createTwilioClient = () => {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
        return null;
    }
    return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
};

// Send OTP via Email
const sendEmailOTP = async (email, otp) => {
    try {
        const transporter = createEmailTransporter();

        const mailOptions = {
            from: `"ShopNest" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'ShopNest - Your Verification Code',
            html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="font-size: 28px; font-weight: 900; letter-spacing: -0.02em; margin: 0;">ShopNest<span style="color: #999;">.</span></h1>
          </div>
          <div style="background: #000; color: #fff; border-radius: 20px; padding: 40px; text-align: center;">
            <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.2em; font-weight: 700; opacity: 0.5; margin: 0 0 24px 0;">Verification Code</p>
            <h2 style="font-size: 48px; font-weight: 900; letter-spacing: 12px; margin: 0 0 24px 0;">${otp}</h2>
            <p style="font-size: 14px; opacity: 0.6; margin: 0; line-height: 1.6;">This code expires in <strong>10 minutes</strong>.<br/>Do not share this code with anyone.</p>
          </div>
          <p style="text-align: center; font-size: 11px; color: #999; margin-top: 24px; text-transform: uppercase; letter-spacing: 0.1em;">ShopNest &copy; 2026</p>
        </div>
      `
        };

        await transporter.sendMail(mailOptions);
        console.log(`📧 OTP email sent to ${email}`);
        return true;
    } catch (error) {
        console.error('❌ Email OTP error:', error.message);
        return false;
    }
};

// Send OTP via SMS (Twilio)
const sendSmsOTP = async (phone, otp) => {
    try {
        const client = createTwilioClient();
        if (!client) {
            console.log('⚠️ Twilio not configured, skipping SMS');
            return false;
        }

        await client.messages.create({
            body: `Your ShopNest verification code is: ${otp}. This code expires in 10 minutes.`,
            messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID,
            to: phone
        });

        console.log(`📱 OTP SMS sent to ${phone}`);
        return true;
    } catch (error) {
        console.error('❌ SMS OTP error:', error.message);
        return false;
    }
};

// Store OTP with expiry (10 minutes)
const storeOTP = (identifier, otp, userData = null) => {
    otpStore.set(identifier, {
        otp,
        userData,
        createdAt: Date.now(),
        expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
    });
};

// Verify OTP
const verifyOTP = (identifier, otp) => {
    const stored = otpStore.get(identifier);

    if (!stored) {
        return { valid: false, message: 'No verification code found. Please request a new one.' };
    }

    if (Date.now() > stored.expiresAt) {
        otpStore.delete(identifier);
        return { valid: false, message: 'Verification code has expired. Please request a new one.' };
    }

    if (stored.otp !== otp) {
        return { valid: false, message: 'Invalid verification code.' };
    }

    const userData = stored.userData;
    otpStore.delete(identifier);
    return { valid: true, message: 'Verified successfully.', userData };
};

module.exports = {
    generateOTP,
    sendEmailOTP,
    sendSmsOTP,
    storeOTP,
    verifyOTP
};
