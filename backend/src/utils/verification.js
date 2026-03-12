const { sendOTPEmail } = require('./emailService');
const OTP = require('../models/OTP.model');

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via Email using SendGrid/Nodemailer
const sendEmailOTP = async (email, otp) => {
    try {
        return await sendOTPEmail(email, otp);
    } catch (error) {
        console.error('❌ Email OTP error:', error.message);
        return false;
    }
};

// Store OTP in database with expiry (10 minutes)
const storeOTP = async (identifier, otp, userData = null) => {
    try {
        // Delete any existing OTPs for this identifier
        await OTP.destroy({ where: { identifier } });

        // Create new OTP
        await OTP.create({
            identifier,
            otp,
            userData,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
        });

        console.log(`🔐 OTP stored for ${identifier}`);
        return true;
    } catch (error) {
        console.error('❌ Error storing OTP:', error.message);
        return false;
    }
};

// Verify OTP from database
const verifyOTP = async (identifier, otp) => {
    try {
        const stored = await OTP.findOne({
            where: {
                identifier,
                otp,
                verified: false
            }
        });

        if (!stored) {
            return { valid: false, message: 'Invalid or expired verification code.' };
        }

        if (new Date() > stored.expiresAt) {
            await stored.destroy();
            return { valid: false, message: 'Verification code has expired. Please request a new one.' };
        }

        // Mark as verified and delete
        const userData = stored.userData;
        await stored.destroy();

        console.log(`✅ OTP verified for ${identifier}`);
        return { valid: true, message: 'Verified successfully.', userData };
    } catch (error) {
        console.error('❌ Error verifying OTP:', error.message);
        return { valid: false, message: 'Verification failed.' };
    }
};

module.exports = {
    generateOTP,
    sendEmailOTP,
    storeOTP,
    verifyOTP
};
