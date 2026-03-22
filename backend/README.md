# ShopNest Backend API v2.0.0

A clean, modular, and scalable backend API for the ShopNest e-commerce and job platform.

## 🚀 Features

- **Modular Architecture**: Clean separation of routes, controllers, models, and middleware
- **Mock Data**: Ready-to-use mock endpoints for development and testing
- **Error Handling**: Comprehensive error handling middleware
- **CORS Support**: Properly configured for frontend integration
- **Request Logging**: Built-in request logging for debugging
- **TypeScript Ready**: Structured for easy TypeScript migration

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   └── database.config.js
│   ├── controllers/     # Business logic controllers
│   │   └── auth.controller.js
│   ├── middleware/      # Custom middleware
│   │   └── error.middleware.js
│   ├── models/          # Data models
│   │   └── User.js
│   ├── routes/          # API routes
│   │   ├── auth.routes.js
│   │   ├── ai.routes.js
│   │   ├── google.auth.js
│   │   ├── job.routes.js
│   │   └── product.routes.js
│   └── utils/           # Utility functions
├── .env                 # Environment variables
├── package.json         # Dependencies and scripts
└── server.js            # Main server file
```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile

### Google OAuth
- `GET /api/google-auth/google` - Google OAuth redirect
- `GET /api/google-auth/success` - OAuth success callback
- `GET /api/google-auth/failure` - OAuth failure callback

### AI Assistant
- `POST /api/ai/learning-assistant` - Get AI business advice
- `GET /api/ai/learning-resources` - Get AI-generated learning resources

### Products
- `GET /api/products` - Get all products (with filtering)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create new product

### Jobs
- `GET /api/jobs` - Get all jobs (with filtering)
- `GET /api/jobs/:id` - Get single job
- `POST /api/jobs` - Create new job posting
- `POST /api/jobs/:id/apply` - Apply for a job

### System
- `GET /health` - Health check
- `GET /` - API documentation and endpoints list

### Legacy Routes (for backward compatibility)
- `GET /api/external-products` - Redirects to `/api/products`

## 🛠️ Installation & Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment variables**:
   Create a `.env` file with:
   ```
   PORT=10000
   FRONTEND_URL=https://sshopnestt.netlify.app
   BACKEND_URL=https://shopnest-2ywt.onrender.com
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Start production server**:
   ```bash
    npm start
    ```

## 🗄️ Database Seeding

To populate the database with initial sample data (Users, Products, and Jobs), run the following command:

```bash
npm run seed
```

This will:
1.  **Sync the database**: Ensures all tables exist.
2.  **Create Default Users**:
    - **Admin**: `admin@shopnest.com` (pw: `admin123`)
    - **Seller**: `seller@shopnest.com` (pw: `seller123`)
    - **Buyer**: `buyer@shopnest.com` (pw: `buyer123`)
    - **Employer**: `employer@shopnest.com` (pw: `employer123`)
    - **Employee**: `employee@shopnest.com` (pw: `employee123`)
3.  **Seed Products**: Adds high-quality sample products assigned to the seller.
4.  **Seed Jobs**: Adds sample job postings assigned to the employer.

> [!NOTE]
> The seeding process is idempotent and will only create records if they don't already exist.

## 📦 Dependencies

### Core Dependencies
- `express` - Web framework
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variable management

### Development Dependencies
- `nodemon` - Auto-restart development server

## 🧪 Testing Endpoints

### Health Check
```bash
curl https://shopnest-2ywt.onrender.com/health
```

### Get Products
```bash
curl https://shopnest-2ywt.onrender.com/api/products
```

### Login
```bash
curl -X POST https://shopnest-2ywt.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

### AI Assistant
```bash
curl -X POST https://shopnest-2ywt.onrender.com/api/ai/learning-assistant \
  -H "Content-Type: application/json" \
  -d '{"question":"How can I grow my business?"}'
```

## 🔧 Configuration

### Server Configuration
- **Port**: 10000
- **Backend URL**: https://shopnest-2ywt.onrender.com
- **Frontend URL**: https://sshopnestt.netlify.app
- **Environment**: production

### CORS Configuration
- Origin: Configured via FRONTEND_URL
- Credentials: Enabled
- Methods: GET, POST, PUT, DELETE, OPTIONS
- Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization

## 🚨 Error Handling

The API includes comprehensive error handling:

- **400 Bad Request**: Invalid input data
- **401 Unauthorized**: Authentication required
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server-side errors

All errors return JSON responses with:
```json
{
  "success": false,
  "message": "Error description",
  "status": 400
}
```

## 📝 Request Logging

All API requests are logged with:
- HTTP method
- Request URL
- Timestamp

Example:
```
GET /api/products - 2024-02-27T10:45:13.180Z
```

## 🔄 Version History

### v2.0.0 (Current)
- Complete restructure with modular architecture
- Added comprehensive error handling
- Implemented request logging
- Created proper route separation
- Added mock data for all endpoints

### v1.0.0
- Basic server setup
- Mock endpoints
- Simple structure

## 🤝 Contributing

1. Follow the existing code structure
2. Add proper error handling
3. Include request logging for new endpoints
4. Update documentation for new features
5. Test all endpoints before submitting

## 📄 License

This project is part of the ShopNest platform.

---

**Server Status**: ✅ Running on https://shopnest-2ywt.onrender.com
**API Version**: v2.0.0
**Last Updated**: 2024-02-27


