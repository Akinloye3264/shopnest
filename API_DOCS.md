# ShopNest API Documentation

## Swagger/OpenAPI Documentation

The ShopNest API is fully documented using Swagger/OpenAPI 3.0 specification.

### Accessing the Documentation

Once the backend server is running, access the interactive API documentation at:

```
http://localhost:5000/api-docs
```

### Features

- **Interactive API Explorer**: Test API endpoints directly from the browser
- **Request/Response Schemas**: View detailed schemas for all endpoints
- **Authentication**: Test authenticated endpoints with JWT tokens
- **Try It Out**: Execute API calls and see responses in real-time

### API Base URL

- **Development**: `http://localhost:5000/api`
- **Production**: `https://api.shopnest.com/api`

### Authentication

Most endpoints require JWT authentication. To authenticate:

1. Login or Register to get a JWT token
2. Click the "Authorize" button in Swagger UI
3. Enter: `Bearer YOUR_JWT_TOKEN`
4. Click "Authorize" and "Close"

### API Endpoints Overview

#### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/forgotpassword` - Request password reset
- `POST /api/auth/resetpassword/:resettoken` - Reset password with token
- `GET /api/auth/me` - Get current user (Protected)

#### Products
- `GET /api/products` - Get all products (Public)
- `GET /api/products/:id` - Get single product (Public)
- `POST /api/products` - Create product (Seller)
- `PATCH /api/products/:id` - Update product (Seller)
- `DELETE /api/products/:id` - Delete product (Seller)

#### Orders
- `POST /api/orders` - Create order (Customer)
- `GET /api/orders/:id` - Get single order (Customer/Seller/Admin)
- `GET /api/customer/orders` - Get customer orders (Customer)
- `GET /api/seller/orders` - Get seller orders (Seller)

#### Seller Dashboard
- `GET /api/seller/dashboard` - Get dashboard stats (Seller)
- `GET /api/seller/products` - Get seller's products (Seller)
- `GET /api/seller/discount-codes` - Get discount codes (Seller)

#### Admin
- `GET /api/admin/dashboard` - Get admin dashboard stats (Admin)
- `GET /api/admin/sellers` - Get all sellers (Admin)
- `PATCH /api/admin/sellers/:id/approve` - Approve seller (Admin)
- `PATCH /api/admin/sellers/:id/suspend` - Suspend seller (Admin)

#### Payments
- `POST /api/payments/initialize` - Initialize payment (Customer)
- `POST /api/payments/verify` - Verify payment (Webhook)

### Response Format

All API responses follow this format:

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information"
}
```

### Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

### Rate Limiting

Currently, there is no rate limiting implemented. This should be added in production.

### Versioning

The API is currently at version 1.0.0. Future versions will be versioned in the URL path if needed.

---

For the most up-to-date and interactive documentation, visit `/api-docs` when the server is running.


