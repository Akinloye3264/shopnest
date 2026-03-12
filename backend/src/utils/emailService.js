const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

// The FROM address must be from a domain verified in your Resend dashboard.
// If you haven't verified a domain yet, use: onboarding@resend.dev (for testing only)
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

const sendOTPEmail = async (email, otp) => {
  const html = `
    <div style="font-family: 'Nunito', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="font-size: 28px; font-weight: 900; letter-spacing: -0.02em; margin: 0; color: #1a472a;">ShopNest<span style="color: #52b788;">.</span></h1>
      </div>
      <div style="background: #1a472a; color: #fff; border-radius: 20px; padding: 40px; text-align: center;">
        <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.2em; font-weight: 700; opacity: 0.7; margin: 0 0 24px 0; color: #b7e4c7;">Verification Code</p>
        <h2 style="font-size: 48px; font-weight: 900; letter-spacing: 12px; margin: 0 0 24px 0; color: #b7e4c7;">${otp}</h2>
        <p style="font-size: 14px; opacity: 0.8; margin: 0; line-height: 1.6; color: rgba(255,255,255,0.85);">This code expires in <strong>10 minutes</strong>.<br/>Do not share this code with anyone.</p>
      </div>
      <p style="text-align: center; font-size: 11px; color: #999; margin-top: 24px; text-transform: uppercase; letter-spacing: 0.1em;">ShopNest © 2026</p>
    </div>
  `;

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Your OTP Code - ShopNest',
      html,
    });

    if (error) {
      console.error('❌ Resend error:', error.message || JSON.stringify(error));
      return false;
    }

    console.log('✅ OTP email sent via Resend');
    return true;
  } catch (err) {
    console.error('❌ Resend error:', err.message);
    return false;
  }
};

module.exports = { sendOTPEmail };
