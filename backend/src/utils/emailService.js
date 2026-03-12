const nodemailer = require('nodemailer');

// Gmail transporter using App Password (works on Render — no SMTP port issues)
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      // App passwords sometimes have spaces — strip them
      pass: (process.env.EMAIL_PASS || '').replace(/\s/g, ''),
    },
  });
};

const sendOTPEmail = async (email, otp) => {
  try {
    const transporter = createTransporter();

    await transporter.sendMail({
      from: `"ShopNest" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `${otp} is your ShopNest verification code`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
            <tr><td align="center">
              <table width="560" cellpadding="0" cellspacing="0" style="background:#111;border:1px solid #222;border-radius:16px;overflow:hidden;">
                <tr>
                  <td style="background:linear-gradient(135deg,#050505,#111);padding:32px 40px;border-bottom:1px solid #222;">
                    <p style="margin:0;font-size:24px;font-weight:900;color:#fff;letter-spacing:-0.5px;">
                      ShopNest<span style="color:#00ff88;">.</span>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:40px;">
                    <h1 style="margin:0 0 8px;font-size:28px;font-weight:900;color:#fff;letter-spacing:-0.5px;">Verification Code</h1>
                    <p style="margin:0 0 32px;color:#888;font-size:15px;">Use the code below to verify your identity.</p>
                    <div style="background:#0a0a0a;border:2px solid #00ff88;border-radius:12px;padding:24px;text-align:center;margin-bottom:32px;">
                      <span style="font-size:48px;font-weight:900;letter-spacing:12px;color:#00ff88;">${otp}</span>
                    </div>
                    <p style="margin:0 0 8px;color:#666;font-size:13px;">&#9201; This code expires in <strong style="color:#fff;">10 minutes</strong>.</p>
                    <p style="margin:0;color:#666;font-size:13px;">&#128274; Do not share this code with anyone.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:24px 40px;border-top:1px solid #222;">
                    <p style="margin:0;color:#444;font-size:12px;">If you didn't request this, you can safely ignore this email.</p>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
      `,
    });

    console.log(`✅ OTP email sent via Gmail to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Gmail email error:', error.message);
    return false;
  }
};

module.exports = { sendOTPEmail };
