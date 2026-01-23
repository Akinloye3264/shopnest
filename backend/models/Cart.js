import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Cart = sequelize.define('Cart', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    },
    unique: true // One cart per user
  },
  items: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
    // Structure: [{ productId, name, price, quantity, image, sellerId }]
    validate: {
      isArray(value) {
        if (!Array.isArray(value)) {
          throw new Error('Items must be an array');
        }
      }
    }
  }
}, {
  tableName: 'carts',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['user_id'] }
  ]
});

export default Cart;
