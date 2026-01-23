import twilio from 'twilio';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend folder
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const sendSMS = async (options) => {
  // Validate required environment variables
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    throw new Error('TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN must be set in environment variables');
  }

  // Initialize Twilio client
  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  // Get Messaging Service SID from env
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;

  if (!messagingServiceSid) {
    throw new Error('TWILIO_MESSAGING_SERVICE_SID must be set in environment variables');
  }

  try {
    const message = await client.messages.create({
      body: options.message,
      messagingServiceSid: messagingServiceSid,
      to: options.phone
    });

    console.log('SMS sent successfully:', message.sid);
    return {
      success: true,
      messageSid: message.sid,
      status: message.status
    };
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw new Error(`Failed to send SMS: ${error.message}`);
  }
};

export default sendSMS;
