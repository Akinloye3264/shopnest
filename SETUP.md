# ShopNest Setup Guide

## Quick Start

### 1. Prerequisites
- Node.js (v16 or higher) - [Download](https://nodejs.org/)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn package manager

### 2. Database Setup

Create a `.env` file in the **root directory** of the project with the following content:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration (MySQL)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=shopnest
DB_USER=root
DB_PASSWORD=your_password_here

# JWT Secret (change this to a random string in production)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Stripe Payment Gateway
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

**Important**: 
- Replace database credentials with your actual MySQL credentials
- Add your Stripe API keys from [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
- Create a `.env` file in the **frontend directory** with:
  ```env
  VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
  ```

### 3. Install Dependencies

From the root directory, run:

```bash
npm run install:all
```

Or install separately:

```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

### 4. Seed the Database

To populate the database with sample data (users, products, orders), run from the **root directory**:

**Windows:**
```bash
npm run seed
```

Or double-click `seed.bat`

**Linux/Mac:**
```bash
npm run seed
```

Or run the shell script:
```bash
chmod +x seed.sh
./seed.sh
```

This will create:
- 1 Admin user
- 2 Seller users (with stores)
- 2 Customer users
- 10 Sample products
- 2 Discount codes
- 5 Sample orders

### 5. Start the Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

The backend will start on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:3000`

### 6. Access the Application

Open your browser and navigate to: `http://localhost:3000`

## Default Login Credentials (after seeding)

- **Admin**: admin@shopnest.com / admin123
- **Seller**: seller@shopnest.com / seller123
- **Customer**: customer@shopnest.com / customer123

## Troubleshooting

### MySQL Connection Issues

1. **Local MySQL**: Make sure MySQL is running on your machine
   ```bash
   # Windows: Check MySQL service status in Services
   # Linux/Mac
   sudo systemctl start mysql
   # or
   sudo service mysql start
   ```

2. **Create Database**: 
   - Make sure the database exists: `CREATE DATABASE shopnest;`
   - Or the tables will be created automatically on first run
   - Verify your username and password in the .env file

### Port Already in Use

If port 5000 or 3000 is already in use:
- Change `PORT` in your `.env` file (backend)
- Update `vite.config.js` port (frontend)

### Module Not Found Errors

Make sure you've installed all dependencies:
```bash
npm run install:all
```

## Production Deployment

For production deployment:

1. Set `NODE_ENV=production` in your `.env` file
2. Change `JWT_SECRET` to a strong, random string
3. Use a production MySQL database
4. Configure your database credentials
5. Build the frontend: `cd frontend && npm run build`
6. Use a process manager like PM2 for the backend
7. Serve the frontend build with a web server (nginx, Apache, etc.)

## Support

For issues or questions, please check the main README.md or open an issue in the repository.

