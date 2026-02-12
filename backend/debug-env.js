import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from backend folder
dotenv.config({ path: path.join(process.cwd(), '.env') });

console.log('Environment Variables:');
console.log('COHERE_API_KEY:', process.env.COHERE_API_KEY ? 'Present' : 'Missing');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'Present' : 'Missing');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID ? 'Present' : 'Missing');
console.log('ADZUNA_APP_ID:', process.env.ADZUNA_APP_ID);
console.log('Current working directory:', process.cwd());
console.log('Environment file path:', path.join(process.cwd(), '.env'));
