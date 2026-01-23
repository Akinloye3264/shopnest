import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend folder
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const sendEmail = async (options) => {
  // Validate required environment variables
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('EMAIL_USER and EMAIL_PASS must be set in environment variables');
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: parseInt(process.env.EMAIL_PORT) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, 
    },
  });

  // Verify connection configuration
  try {
    await transporter.verify();
    console.log(' Email server is ready to send messages');
  } catch (error) {
    console.error('Email server configuration error:', error);
    throw new Error(`Email server configuration failed: ${error.message}`);
  }

  const message = {
    from: `${process.env.EMAIL_FROM_NAME || 'ShopNest'} <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html || options.message,
  };

  try {
    const info = await transporter.sendMail(message);
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error(' Error sending email:', error);
    throw error;
  }
};

export default sendEmail;

