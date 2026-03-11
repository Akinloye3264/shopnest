const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes
const authRoutes = require('./src/routes/auth.routes.js');
const googleAuthRoutes = require('./src/routes/google.auth.js');
const aiRoutes = require('./src/routes/ai.routes.js');
const productRoutes = require('./src/routes/product.routes.js');
const jobRoutes = require('./src/routes/job.routes.js');
const paymentRoutes = require('./src/routes/payment.routes.js');
const orderRoutes = require('./src/routes/order.routes.js');
const reviewRoutes = require('./src/routes/review.routes.js');
const messageRoutes = require('./src/routes/message.routes.js');
const adminRoutes = require('./src/routes/admin.routes.js');

// Import middleware
const { errorHandler, notFound, requestLogger } = require('./src/middleware/error.middleware.js');

const app = express();
const PORT = process.env.PORT || 5001;
const { sequelize } = require('./src/config/database.config');
require('./src/models'); // Initialize associations

// Connect to Database
sequelize.sync({ alter: true })
  .then(() => console.log(' MySQL Models synchronized.'))
  .catch(err => console.error(' Error synchronizing models:', err));

// Middleware
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'https://sshopnest.netlify.app'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
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
app.use('/api/payments', paymentRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);

// Legacy routes for backward compatibility
app.get('/api/external-products', (req, res) => {
  res.redirect('/api/products');
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'ShopNest Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '2.1.0'
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to ShopNest API',
    version: '2.1.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      googleAuth: '/api/google-auth',
      ai: '/api/ai',
      products: '/api/products',
      jobs: '/api/jobs',
      orders: '/api/orders',
      reviews: '/api/reviews',
      messages: '/api/messages',
      admin: '/api/admin',
      payments: '/api/payments'
    },
    documentation: 'https://api.shopnest.com/docs'
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, "0.0.0.0", () => {
  const backendUrl = process.env.BACKEND_URL || `http://localhost:${PORT}`;
  console.log(` ShopNest Server v2.1.0 running on port ${PORT}`);
  console.log(` Backend URL: ${backendUrl}`);
  console.log(` Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log(` Health Check: ${backendUrl}/health`);
});

module.exports = app;