# ShopNest 🛒

A modern, scalable e-commerce web platform focused on helping small businesses and SMEs launch online stores easily and affordably, especially in emerging markets.

## 🎯 Features

### Seller Features
- User authentication (sign up, login, password reset)
- Seller dashboard with analytics
- Product management (upload, edit, delete)
- Order management
- Sales analytics (daily, weekly, monthly)
- Storefront builder (simple templates)
- Marketing tools (discount codes, featured products)

### Customer Features
- Browse stores and products (authentication required)
- Product search and categories
- Add to cart & checkout
- Order tracking
- User authentication

### Admin Features
- Manage sellers and stores
- Approve or suspend accounts
- Monitor platform activity
- View platform statistics

## 🚀 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MySQL with Sequelize
- **Authentication**: JWT (JSON Web Tokens)
- **Styling**: Tailwind CSS with custom design system
- **API Documentation**: Swagger/OpenAPI 3.0

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MySQL (local or remote)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the **root directory** of the project:
```env
PORT=5000
NODE_ENV=development

# Database Configuration (MySQL)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=shopnest
DB_USER=root
DB_PASSWORD=your_password_here

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Email Configuration (for password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_FROM_NAME=ShopNest

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Stripe Payment Gateway
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

4. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the **frontend directory**:
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## 🗄️ Database Seeding

To populate the database with sample data, run from the **root directory**:

```bash
npm run seed
```

Or use the batch/shell script:
- **Windows**: Double-click `seed.bat` or run `seed.bat` from command prompt
- **Linux/Mac**: Run `./seed.sh` (make sure it's executable: `chmod +x seed.sh`)

This will create:
- 1 Admin user
- 2 Seller users (with stores)
- 2 Customer users
- 10 Sample products
- 2 Discount codes
- 5 Sample orders

### Default Login Credentials (after seeding)

- **Admin**: admin@shopnest.com / admin123
- **Seller**: seller@shopnest.com / seller123
- **Customer**: customer@shopnest.com / customer123

## 📚 API Documentation

Swagger API documentation is available at:
```
http://localhost:5000/api-docs
```

The documentation includes:
- All API endpoints
- Request/response schemas
- Authentication requirements
- Example requests and responses

## 📁 Project Structure

```
shopnest/
├── backend/
│   ├── config/          # Configuration files (database, swagger)
│   ├── models/          # Sequelize models
│   ├── routes/          # API routes
│   ├── middleware/      # Auth & validation middleware
│   ├── utils/           # Utility functions
│   ├── scripts/         # Database seeding script
│   └── server.js        # Express server
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── context/     # React context (Auth)
│   │   ├── pages/       # Page components
│   │   ├── utils/       # Utility functions
│   │   ├── App.jsx      # Main app component
│   │   └── main.jsx     # Entry point
│   └── index.html
└── README.md
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/forgotpassword` - Request password reset
- `POST /api/auth/resetpassword/:resettoken` - Reset password
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get all products (public)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Seller)
- `PATCH /api/products/:id` - Update product (Seller)
- `DELETE /api/products/:id` - Delete product (Seller)

### Orders
- `GET /api/customer/orders` - Get customer orders
- `GET /api/seller/orders` - Get seller orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get single order

### Seller
- `GET /api/seller/dashboard` - Get seller dashboard stats
- `GET /api/seller/products` - Get seller's products
- `GET /api/seller/discount-codes` - Get seller's discount codes

### Admin
- `GET /api/admin/dashboard` - Get admin dashboard stats
- `GET /api/admin/sellers` - Get all sellers
- `PATCH /api/admin/sellers/:id/approve` - Approve seller
- `PATCH /api/admin/sellers/:id/suspend` - Suspend seller

### Payments
- `POST /api/payments/initialize` - Initialize payment
- `POST /api/payments/verify` - Verify payment

For detailed API documentation, visit `/api-docs` when the server is running.

## 🎨 Design System

The platform uses a modern design system with:
- **Primary Color**: Blue (#3B82F6)
- **Secondary Color**: Green (#22C55E)
- **Fonts**: Inter (body), Poppins (headings)
- **Components**: Custom button styles, cards, forms

## 🔒 Security

- Password hashing with bcrypt
- JWT authentication
- Protected routes with middleware
- Input validation with express-validator
- Regex validation for email, phone, and password

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For support, please open an issue in the repository.

---

Built with ❤️ for small businesses and entrepreneurs in emerging markets.
