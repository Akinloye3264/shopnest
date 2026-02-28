const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes
const authRoutes = require('./src/routes/auth.routes.js');
const googleAuthRoutes = require('./src/routes/google.auth.js');
const aiRoutes = require('./src/routes/ai.routes.js');
const productRoutes = require('./src/routes/product.routes.js');
const jobRoutes = require('./src/routes/job.routes.js');

// Import middleware
const { errorHandler, notFound, requestLogger } = require('./src/middleware/error.middleware.js');

const app = express();
const PORT = process.env.PORT || 5001;
const { sequelize } = require('./src/config/database.config');
require('./src/models'); // Initialize associations

// Connect to Database
sequelize.sync({ alter: true })
  .then(() => console.log('✅ MySQL Models synchronized.'))
  .catch(err => console.error('❌ Error synchronizing models:', err));

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/google-auth', googleAuthRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/products', productRoutes);
app.use('/api/jobs', jobRoutes);

// Legacy routes for backward compatibility
app.get('/api/external-products', (req, res) => {
  res.redirect('/api/products');
});

// Google OAuth is handled by src/routes/google.auth.js

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '2.0.0'
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to ShopNest API',
    version: '2.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      googleAuth: '/api/google-auth',
      ai: '/api/ai',
      products: '/api/products',
      jobs: '/api/jobs'
    },
    documentation: 'https://api.shopnest.com/docs'
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 ShopNest Server v2.0.0 running on port ${PORT}`);
  console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`🔗 Google OAuth Init: http://localhost:${PORT}/api/google-auth/google`);
  console.log(`📡 Google OAuth Redirect: http://localhost:${PORT}/api/google-auth/callback`);
  console.log(`🤖 AI Assistant: http://localhost:${PORT}/api/ai/learning-assistant`);
  console.log(`🛍️ Products: http://localhost:${PORT}/api/products`);
  console.log(`💼 Jobs: http://localhost:${PORT}/api/jobs`);
  console.log(`🔐 Health Check: http://localhost:${PORT}/health`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/`);
});

module.exports = app;