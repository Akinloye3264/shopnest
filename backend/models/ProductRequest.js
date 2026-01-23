import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ProductRequest = sequelize.define('ProductRequest', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  buyerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'buyer_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  buyerPhone: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'buyer_phone'
  },
  productName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'product_name'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'fulfilled', 'cancelled'),
    defaultValue: 'pending'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  notifiedSellers: {
    type: DataTypes.JSON,
    defaultValue: [],
    field: 'notified_sellers',
    // Track which sellers have been notified
    comment: 'Array of seller IDs who have been notified'
  }
}, {
  tableName: 'product_requests',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['buyer_id'] },
    { fields: ['status'] },
    { fields: ['created_at'] }
  ]
});

export default ProductRequest;
