const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendOTPEmail = async (email, otp) => {
  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Your OTP Code - ShopNest',
      html: `
        <h2>Your OTP Code</h2>
        <p>Use this code to complete your login:</p>
        <h1 style="color: #22c55e; letter-spacing: 4px;">${otp}</h1>
        <p>This code expires in 10 minutes.</p>
        <p>If you didn't request this, ignore this email.</p>
      `,
    });
    console.log('✅ OTP email sent via Resend');
    return true;
  } catch (error) {
    console.error('❌ Resend error:', error);
    return false;
  }
};

module.exports = { sendOTPEmail };
