import { sequelize } from './models/index.js';
import { User } from './models/index.js';
import { generateToken } from './utils/generateToken.js';

async function testAI() {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('Database connected successfully');

    // Find or create test user
    let user = await User.findOne({ where: { email: 'test@example.com' } });
    
    if (!user) {
      user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
        role: 'customer',
        emailVerified: true
      });
      console.log('Test user created');
    }

    // Generate token
    const token = generateToken(user.id);
    console.log('Token generated:', token);

    // Test AI endpoint
    console.log('\n--- Testing AI Learning Assistant ---');
    const response = await fetch('http://localhost:5001/api/ai/learning-assistant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        query: 'What are the best practices for starting an e-commerce business?',
        context: 'learning_resources'
      })
    });

    const result = await response.json();
    console.log('AI Response:', JSON.stringify(result, null, 2));

    // Test AI learning resources
    console.log('\n--- Testing AI Learning Resources ---');
    const resourcesResponse = await fetch('http://localhost:5001/api/ai/learning-resources', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const resourcesResult = await resourcesResponse.json();
    console.log('AI Resources:', JSON.stringify(resourcesResult, null, 2));

    // Test external products
    console.log('\n--- Testing External Products ---');
    const productsResponse = await fetch('http://localhost:5001/api/external-products', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const productsResult = await productsResponse.json();
    console.log('External Products:', JSON.stringify(productsResult, null, 2));

  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await sequelize.close();
  }
}

testAI();
