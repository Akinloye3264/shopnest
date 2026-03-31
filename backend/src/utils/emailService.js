const nodemailer = require('nodemailer');

// Brevo SMTP transporter
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_FROM_EMAIL,
    pass: process.env.BREVO_API_KEY,
  },
});

const sendOTPEmail = async (email, otp) => {
  try {
    await transporter.sendMail({
      from: `"ShopNest" <${process.env.BREVO_FROM_EMAIL}>`,
      to: email,
      subject: 'Your OTP Code - ShopNest',
      html: `
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
      `,
    });
    console.log('✅ OTP email sent via Brevo');
    return true;
  } catch (error) {
    console.error('❌ Brevo email error:', error.message);
    return false;
  }
};

const sendJobNotificationEmail = async (email, name, job) => {
  try {
    await transporter.sendMail({
      from: `"ShopNest" <${process.env.BREVO_FROM_EMAIL}>`,
      to: email,
      subject: `New Job Alert: ${job.title} at ${job.company} - ShopNest`,
      html: `
        <div style="font-family: 'Nunito', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="font-size: 28px; font-weight: 900; margin: 0; color: #1a472a;">ShopNest<span style="color: #52b788;">.</span></h1>
            <p style="color: #666; margin: 6px 0 0; font-size: 14px;">Job Opportunity Alert</p>
          </div>
          <div style="background: #f0faf4; border-left: 4px solid #2d6a4f; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <p style="margin: 0 0 4px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #2d6a4f;">New Job Posted</p>
            <h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 900; color: #1a1a2e;">${job.title}</h2>
            <p style="margin: 0; font-size: 16px; font-weight: 700; color: #2d6a4f;">${job.company}</p>
          </div>
          <div style="background: white; border: 1px solid #e8e4df; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-size: 14px; color: #666; width: 40%;">📍 Location</td>
                <td style="padding: 8px 0; font-size: 14px; font-weight: 700; color: #1a1a2e;">${job.location || 'Not specified'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-size: 14px; color: #666;">💼 Type</td>
                <td style="padding: 8px 0; font-size: 14px; font-weight: 700; color: #1a1a2e;">${job.type || 'Not specified'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-size: 14px; color: #666;">💰 Salary</td>
                <td style="padding: 8px 0; font-size: 14px; font-weight: 700; color: #1a1a2e;">${job.salary || 'Competitive'}</td>
              </tr>
            </table>
          </div>
          <div style="margin-bottom: 24px;">
            <p style="font-size: 14px; font-weight: 700; color: #1a1a2e; margin: 0 0 8px;">Job Description</p>
            <p style="font-size: 14px; color: #555; line-height: 1.7; margin: 0;">${job.description}</p>
          </div>
          <div style="text-align: center; margin-bottom: 32px;">
            <a href="${process.env.FRONTEND_URL}/jobs" style="background: linear-gradient(135deg, #1a472a, #2d6a4f); color: white; text-decoration: none; padding: 14px 36px; border-radius: 50px; font-size: 15px; font-weight: 800; display: inline-block;">View & Apply Now</a>
          </div>
          <p style="text-align: center; font-size: 12px; color: #aaa; margin: 0;">You received this because you're registered as a job seeker on ShopNest.<br/>© 2026 ShopNest. Built for African Youth.</p>
        </div>
      `,
    });
    console.log(`✅ Job notification sent via Brevo to ${email}`);
    return true;
  } catch (error) {
    console.error(`❌ Brevo job notification error to ${email}:`, error.message);
    return false;
  }
};

module.exports = { sendOTPEmail, sendJobNotificationEmail };
