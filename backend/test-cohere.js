// Test Cohere API directly
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from backend folder
dotenv.config({ path: path.join(process.cwd(), '.env') });

const apiKey = process.env.COHERE_API_KEY;

async function testCohere() {
  try {
    console.log('Testing Cohere API...');
    console.log('API Key:', apiKey ? 'Present' : 'Missing');
    console.log('API Key (first 10 chars):', apiKey ? apiKey.substring(0, 10) + '...' : 'None');
    console.log('API Key length:', apiKey ? apiKey.length : 0);
    console.log('API Key starts with:', apiKey ? apiKey.substring(0, 3) : 'None');
    
    if (!apiKey) {
      console.error('COHERE_API_KEY not found');
      return;
    }

    const response = await fetch('https://api.cohere.ai/v1/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Cohere-Version': '2024-05-21'
      },
      body: JSON.stringify({
        model: 'command-nightly',
        message: 'You are a helpful learning assistant for ShopNest. What are the best practices for starting an e-commerce business?',
        max_tokens: 500,
        temperature: 0.7
      })
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Cohere API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Cohere Response:', JSON.stringify(data, null, 2));
    
    if (data.text) {
      console.log('\n--- AI Response ---');
      console.log(data.text);
    } else {
      console.log('No text found in response');
    }

  } catch (error) {
    console.error('Cohere API test error:', error);
  }
}

testCohere();
