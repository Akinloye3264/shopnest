const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ShopNest API',
      version: '2.1.0',
      description: 'ShopNest E-Commerce Platform REST API'
    },
    servers: [
      { url: process.env.BACKEND_URL || 'http://localhost:5001', description: 'Active server' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['buyer', 'seller', 'admin'] },
            phone: { type: 'string', nullable: true },
            picture: { type: 'string', nullable: true },
            isVerified: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Product: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            title: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number' },
            category: { type: 'string' },
            image: { type: 'string' },
            stock: { type: 'integer' },
            sellerId: { type: 'integer' }
          }
        },
        Order: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            userId: { type: 'integer' },
            totalAmount: { type: 'number' },
            status: { type: 'string', enum: ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'] },
            shippingAddress: { type: 'string', nullable: true },
            stripeSessionId: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Review: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            rating: { type: 'integer', minimum: 1, maximum: 5 },
            comment: { type: 'string' },
            userId: { type: 'integer' },
            productId: { type: 'integer', nullable: true },
            jobId: { type: 'integer', nullable: true },
            type: { type: 'string', enum: ['product', 'job', 'seller', 'employer'] },
            createdAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    },
    paths: {
      // ── AUTH ──────────────────────────────────────────────────────────────────
      '/api/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register a new user (step 1)',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email'],
                  properties: {
                    name: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string' },
                    role: { type: 'string', enum: ['buyer', 'seller'], default: 'buyer' },
                    phone: { type: 'string' },
                    googleId: { type: 'string', description: 'Provide for Google signup (skips OTP)' },
                    picture: { type: 'string' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'OTP sent to email' },
            201: { description: 'Google account created, token returned' },
            400: { description: 'Validation error or email already exists' }
          }
        }
      },
      '/api/auth/verify-register': {
        post: {
          tags: ['Auth'],
          summary: 'Verify OTP and create account (step 2)',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'otp'],
                  properties: {
                    email: { type: 'string', format: 'email' },
                    otp: { type: 'string' }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: 'Account created successfully' },
            400: { description: 'Invalid or expired OTP' }
          }
        }
      },
      '/api/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login (step 1) — sends OTP to email',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'OTP sent' },
            401: { description: 'Invalid credentials' }
          }
        }
      },
      '/api/auth/verify-login': {
        post: {
          tags: ['Auth'],
          summary: 'Verify OTP and complete login (step 2)',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'otp'],
                  properties: {
                    email: { type: 'string', format: 'email' },
                    otp: { type: 'string' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Login successful, JWT token returned' },
            400: { description: 'Invalid OTP' }
          }
        }
      },
      '/api/auth/resend-otp': {
        post: {
          tags: ['Auth'],
          summary: 'Resend OTP verification code',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email'],
                  properties: { email: { type: 'string', format: 'email' } }
                }
              }
            }
          },
          responses: { 200: { description: 'New OTP sent' } }
        }
      },
      '/api/auth/forgot-password': {
        post: {
          tags: ['Auth'],
          summary: 'Request password reset OTP',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email'],
                  properties: { email: { type: 'string', format: 'email' } }
                }
              }
            }
          },
          responses: { 200: { description: 'Reset OTP sent' }, 404: { description: 'User not found' } }
        }
      },
      '/api/auth/reset-password': {
        post: {
          tags: ['Auth'],
          summary: 'Reset password with OTP',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'otp', 'newPassword'],
                  properties: {
                    email: { type: 'string', format: 'email' },
                    otp: { type: 'string' },
                    newPassword: { type: 'string' }
                  }
                }
              }
            }
          },
          responses: { 200: { description: 'Password reset successfully' }, 400: { description: 'Invalid OTP' } }
        }
      },
      '/api/auth/search': {
        get: {
          tags: ['Auth'],
          summary: 'Search users by name or email',
          parameters: [
            { name: 'q', in: 'query', required: true, schema: { type: 'string' } },
            { name: 'exclude', in: 'query', schema: { type: 'integer' }, description: 'User ID to exclude' },
            { name: 'role', in: 'query', schema: { type: 'string', enum: ['buyer', 'seller', 'admin'] } }
          ],
          responses: { 200: { description: 'List of matching users' } }
        }
      },
      '/api/auth/profile/{userId}': {
        get: {
          tags: ['Auth'],
          summary: 'Get user profile',
          parameters: [{ name: 'userId', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'User profile' }, 404: { description: 'User not found' } }
        },
        put: {
          tags: ['Auth'],
          summary: 'Update user profile',
          parameters: [{ name: 'userId', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    phone: { type: 'string' },
                    currentPassword: { type: 'string' },
                    newPassword: { type: 'string' }
                  }
                }
              }
            }
          },
          responses: { 200: { description: 'Profile updated' } }
        }
      },

      // ── PRODUCTS ──────────────────────────────────────────────────────────────
      '/api/products': {
        get: {
          tags: ['Products'],
          summary: 'Get all products',
          parameters: [
            { name: 'category', in: 'query', schema: { type: 'string' } },
            { name: 'minPrice', in: 'query', schema: { type: 'number' } },
            { name: 'maxPrice', in: 'query', schema: { type: 'number' } },
            { name: 'search', in: 'query', schema: { type: 'string' } }
          ],
          responses: { 200: { description: 'List of products' } }
        },
        post: {
          tags: ['Products'],
          summary: 'Create a new product',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['title', 'description', 'price', 'sellerId'],
                  properties: {
                    title: { type: 'string' },
                    description: { type: 'string' },
                    price: { type: 'number' },
                    category: { type: 'string' },
                    sellerId: { type: 'integer' },
                    image: { type: 'string' },
                    stock: { type: 'integer' }
                  }
                }
              }
            }
          },
          responses: { 201: { description: 'Product created' }, 400: { description: 'Validation error' } }
        }
      },
      '/api/products/{id}': {
        get: {
          tags: ['Products'],
          summary: 'Get a product by ID',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Product details' }, 404: { description: 'Not found' } }
        }
      },

      // ── ORDERS ────────────────────────────────────────────────────────────────
      '/api/orders/user/{userId}': {
        get: {
          tags: ['Orders'],
          summary: 'Get all orders for a user',
          parameters: [{ name: 'userId', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'List of orders with items' } }
        }
      },
      '/api/orders/{id}': {
        get: {
          tags: ['Orders'],
          summary: 'Get single order by ID',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Order details' }, 404: { description: 'Not found' } }
        }
      },
      '/api/orders/checkout': {
        post: {
          tags: ['Orders'],
          summary: 'Create a Stripe checkout session and save order',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['userId', 'items'],
                  properties: {
                    userId: { type: 'integer' },
                    items: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'integer' },
                          title: { type: 'string' },
                          price: { type: 'number' },
                          quantity: { type: 'integer' },
                          image: { type: 'string' }
                        }
                      }
                    },
                    shippingAddress: { type: 'string' }
                  }
                }
              }
            }
          },
          responses: { 200: { description: 'Stripe session URL and order ID returned' } }
        }
      },
      '/api/orders/{id}/confirm': {
        post: {
          tags: ['Orders'],
          summary: 'Confirm order after payment',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Order confirmed and stock updated' } }
        }
      },
      '/api/orders/{id}/status': {
        put: {
          tags: ['Orders'],
          summary: 'Update order status',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['status'],
                  properties: {
                    status: { type: 'string', enum: ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'] }
                  }
                }
              }
            }
          },
          responses: { 200: { description: 'Status updated' } }
        }
      },
      '/api/orders/{id}/cancel': {
        post: {
          tags: ['Orders'],
          summary: 'Cancel an order',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Order cancelled' }, 400: { description: 'Cannot cancel shipped/delivered order' } }
        }
      },
      '/api/orders/check-seller/{buyerId}/{sellerId}': {
        get: {
          tags: ['Orders'],
          summary: 'Check if buyer has transacted with a seller',
          parameters: [
            { name: 'buyerId', in: 'path', required: true, schema: { type: 'integer' } },
            { name: 'sellerId', in: 'path', required: true, schema: { type: 'integer' } }
          ],
          responses: { 200: { description: 'Returns hasTransaction boolean' } }
        }
      },

      // ── REVIEWS ───────────────────────────────────────────────────────────────
      '/api/reviews/product/{productId}': {
        get: {
          tags: ['Reviews'],
          summary: 'Get reviews for a product',
          parameters: [{ name: 'productId', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Reviews with average rating' } }
        }
      },
      '/api/reviews/job/{jobId}': {
        get: {
          tags: ['Reviews'],
          summary: 'Get reviews for a job',
          parameters: [{ name: 'jobId', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Reviews with average rating' } }
        }
      },
      '/api/reviews/seller/{sellerId}': {
        get: {
          tags: ['Reviews'],
          summary: 'Get reviews for a seller',
          parameters: [{ name: 'sellerId', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Reviews with average rating' } }
        }
      },
      '/api/reviews': {
        post: {
          tags: ['Reviews'],
          summary: 'Create a review',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['rating', 'userId', 'type'],
                  properties: {
                    rating: { type: 'integer', minimum: 1, maximum: 5 },
                    comment: { type: 'string' },
                    userId: { type: 'integer' },
                    productId: { type: 'integer' },
                    jobId: { type: 'integer' },
                    type: { type: 'string', enum: ['product', 'job', 'seller', 'employer'] }
                  }
                }
              }
            }
          },
          responses: { 201: { description: 'Review created' } }
        }
      },
      '/api/reviews/{id}': {
        delete: {
          tags: ['Reviews'],
          summary: 'Delete a review (admin)',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Review deleted' }, 404: { description: 'Not found' } }
        }
      },

      // ── PAYMENTS ─────────────────────────────────────────────────────────────
      '/api/payments/config': {
        get: {
          tags: ['Payments'],
          summary: 'Get Stripe publishable key',
          responses: { 200: { description: 'Returns publishableKey' } }
        }
      },
      '/api/payments/create-checkout-session': {
        post: {
          tags: ['Payments'],
          summary: 'Create a Stripe checkout session',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['items'],
                  properties: {
                    items: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          title: { type: 'string' },
                          price: { type: 'number' },
                          quantity: { type: 'integer' },
                          image: { type: 'string' }
                        }
                      }
                    },
                    success_url: { type: 'string' },
                    cancel_url: { type: 'string' }
                  }
                }
              }
            }
          },
          responses: { 200: { description: 'Stripe session ID and URL' } }
        }
      },
      '/api/payments/verify-session/{sessionId}': {
        get: {
          tags: ['Payments'],
          summary: 'Verify a Stripe checkout session',
          parameters: [{ name: 'sessionId', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Session payment status' } }
        }
      },

      // ── HEALTH ────────────────────────────────────────────────────────────────
      '/health': {
        get: {
          tags: ['System'],
          summary: 'Health check',
          responses: { 200: { description: 'Server is running' } }
        }
      }
    }
  },
  apis: [] // paths defined inline above
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;
