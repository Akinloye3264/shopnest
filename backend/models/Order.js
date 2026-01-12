import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  orderNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    field: 'order_number'
  },
  customerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'customer_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  items: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  sellerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'seller_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  storeId: {
    type: DataTypes.INTEGER,
    field: 'store_id',
    references: {
      model: 'stores',
      key: 'id'
    }
  },
  shippingAddressName: {
    type: DataTypes.STRING,
    field: 'shipping_address_name'
  },
  shippingAddressStreet: {
    type: DataTypes.STRING,
    field: 'shipping_address_street'
  },
  shippingAddressCity: {
    type: DataTypes.STRING,
    field: 'shipping_address_city'
  },
  shippingAddressState: {
    type: DataTypes.STRING,
    field: 'shipping_address_state'
  },
  shippingAddressCountry: {
    type: DataTypes.STRING,
    field: 'shipping_address_country'
  },
  shippingAddressZipCode: {
    type: DataTypes.STRING,
    field: 'shipping_address_zip_code'
  },
  shippingAddressPhone: {
    type: DataTypes.STRING,
    field: 'shipping_address_phone'
  },
  billingAddressName: {
    type: DataTypes.STRING,
    field: 'billing_address_name'
  },
  billingAddressStreet: {
    type: DataTypes.STRING,
    field: 'billing_address_street'
  },
  billingAddressCity: {
    type: DataTypes.STRING,
    field: 'billing_address_city'
  },
  billingAddressState: {
    type: DataTypes.STRING,
    field: 'billing_address_state'
  },
  billingAddressCountry: {
    type: DataTypes.STRING,
    field: 'billing_address_country'
  },
  billingAddressZipCode: {
    type: DataTypes.STRING,
    field: 'billing_address_zip_code'
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  shippingCost: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    field: 'shipping_cost',
    validate: {
      min: 0
    }
  },
  discount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  discountCode: {
    type: DataTypes.STRING,
    field: 'discount_code'
  },
  tax: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
    defaultValue: 'pending',
    field: 'payment_status'
  },
  paymentMethod: {
    type: DataTypes.ENUM('card', 'bank_transfer', 'mobile_money', 'other'),
    defaultValue: 'card',
    field: 'payment_method'
  },
  paymentGateway: {
    type: DataTypes.STRING,
    field: 'payment_gateway'
  },
  paymentReference: {
    type: DataTypes.STRING,
    field: 'payment_reference'
  },
  orderStatus: {
    type: DataTypes.ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'),
    defaultValue: 'pending',
    field: 'order_status'
  },
  trackingNumber: {
    type: DataTypes.STRING,
    field: 'tracking_number'
  },
  notes: {
    type: DataTypes.TEXT
  },
  cancelledAt: {
    type: DataTypes.DATE,
    field: 'cancelled_at'
  },
  cancelledReason: {
    type: DataTypes.TEXT,
    field: 'cancelled_reason'
  },
  shippedAt: {
    type: DataTypes.DATE,
    field: 'shipped_at'
  },
  deliveredAt: {
    type: DataTypes.DATE,
    field: 'delivered_at'
  }
}, {
  tableName: 'orders',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['customer_id', 'created_at'] },
    { fields: ['seller_id', 'created_at'] },
    { fields: ['order_number'] }
  ]
});

export default Order;
