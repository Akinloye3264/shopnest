const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendOTPEmail = async (email, otp) => {
  const msg = {
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL || 'shopnest3264@gmail.com',
    subject: 'ShopNest - Your Verification Code',
    text: `Your ShopNest verification code is: ${otp}. This code expires in 10 minutes.`,
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
        <p style="text-align: center; font-size: 11px; color: #999; margin-top: 24px; text-transform: uppercase; letter-spacing: 0.1em;">ShopNest © 2026</p>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log(`📧 OTP email sent to ${email} via SendGrid`);
    return true;
  } catch (error) {
    console.error('❌ SendGrid error:', error.response?.body || error.message);
    return false;
  }
};

module.exports = { sendOTPEmail };
