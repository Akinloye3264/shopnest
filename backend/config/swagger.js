import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ShopNest API',
      version: '1.0.0',
      description: 'API documentation for ShopNest - E-commerce platform for small businesses',
      contact: {
        name: 'ShopNest Support',
        email: 'support@shopnest.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development server'
      },
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
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'User ID'
            },
            name: {
              type: 'string',
              description: 'User full name'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            role: {
              type: 'string',
              enum: ['customer', 'seller', 'admin', 'employee', 'employer'],
              description: 'User role'
            },
            phone: {
              type: 'string',
              description: 'User phone number'
            },
            storeName: {
              type: 'string',
              description: 'Store name (for sellers)'
            },
            isApproved: {
              type: 'boolean',
              description: 'Approval status (for sellers)'
            },
            isSuspended: {
              type: 'boolean',
              description: 'Suspension status'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Product: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Product ID'
            },
            name: {
              type: 'string',
              description: 'Product name'
            },
            slug: {
              type: 'string',
              description: 'Product URL slug'
            },
            description: {
              type: 'string',
              description: 'Product description'
            },
            price: {
              type: 'number',
              format: 'decimal',
              description: 'Product price'
            },
            compareAtPrice: {
              type: 'number',
              format: 'decimal',
              description: 'Compare at price (original price)'
            },
            category: {
              type: 'string',
              description: 'Product category'
            },
            stock: {
              type: 'integer',
              description: 'Stock quantity'
            },
            images: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  url: { type: 'string' },
                  alt: { type: 'string' }
                }
              }
            },
            tags: {
              type: 'array',
              items: { type: 'string' }
            },
            isActive: {
              type: 'boolean',
              description: 'Product active status'
            },
            isFeatured: {
              type: 'boolean',
              description: 'Featured product status'
            },
            sellerId: {
              type: 'integer',
              description: 'Seller user ID'
            },
            storeId: {
              type: 'integer',
              description: 'Store ID'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Order: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Order ID'
            },
            orderNumber: {
              type: 'string',
              description: 'Unique order number'
            },
            customerId: {
              type: 'integer',
              description: 'Customer user ID'
            },
            sellerId: {
              type: 'integer',
              description: 'Seller user ID'
            },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  product: { type: 'integer' },
                  name: { type: 'string' },
                  price: { type: 'number' },
                  quantity: { type: 'integer' },
                  image: { type: 'string' }
                }
              }
            },
            subtotal: {
              type: 'number',
              format: 'decimal'
            },
            shippingCost: {
              type: 'number',
              format: 'decimal'
            },
            tax: {
              type: 'number',
              format: 'decimal'
            },
            discount: {
              type: 'number',
              format: 'decimal'
            },
            total: {
              type: 'number',
              format: 'decimal'
            },
            paymentStatus: {
              type: 'string',
              enum: ['pending', 'paid', 'failed', 'refunded']
            },
            orderStatus: {
              type: 'string',
              enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              description: 'Error message'
            },
            error: {
              type: 'string',
              description: 'Detailed error information'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              description: 'Success message'
            },
            data: {
              type: 'object',
              description: 'Response data'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [path.join(__dirname, '..', 'routes', '*.js')]
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;

