import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';
import { sequelize } from './models/index.js';

// Import routes
import authRoutes from './routes/auth.js';
import sellerRoutes from './routes/seller.js';
import customerRoutes from './routes/customer.js';
import adminRoutes from './routes/admin.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import paymentRoutes from './routes/payments.js';
import cartRoutes from './routes/cart.js';
import productRequestRoutes from './routes/productRequests.js';
import jobRoutes from './routes/jobs.js';
import jobApplicationRoutes from './routes/jobApplications.js';
import messageRoutes from './routes/messages.js';
import notificationRoutes from './routes/notifications.js';
import learningResourceRoutes from './routes/learningResources.js';
import aiRoutes from './routes/ai.js';
import externalProductsRoutes from './routes/externalProducts.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend folder
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

// Middleware
// CORS configuration - allow frontend origin
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection
sequelize.authenticate()
  .then(() => {
    console.log(' MySQL database connected successfully');
    return sequelize.sync({ alter: false });
  })
  .then(() => {
    console.log(' Database synced successfully');
  })
  .catch((err) => {
    console.error(' Database connection error:', err);
  });

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'ShopNest API Documentation'
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/paygitments', paymentRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/product-requests', productRequestRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/job-applications', jobApplicationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/learning-resources', learningResourceRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/external-products', externalProductsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'ShopNest API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
});
