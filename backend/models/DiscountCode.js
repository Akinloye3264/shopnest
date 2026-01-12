import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const DiscountCode = sequelize.define('DiscountCode', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  type: {
    type: DataTypes.ENUM('percentage', 'fixed'),
    allowNull: false
  },
  value: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
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
  minPurchaseAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    field: 'min_purchase_amount',
    validate: {
      min: 0
    }
  },
  maxDiscountAmount: {
    type: DataTypes.DECIMAL(10, 2),
    field: 'max_discount_amount'
  },
  usageLimit: {
    type: DataTypes.INTEGER,
    field: 'usage_limit'
  },
  usedCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'used_count'
  },
  validFrom: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'valid_from'
  },
  validUntil: {
    type: DataTypes.DATE,
    field: 'valid_until'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  applicableProducts: {
    type: DataTypes.JSON,
    field: 'applicable_products',
    defaultValue: []
  }
}, {
  tableName: 'discount_codes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['code'] },
    { fields: ['seller_id', 'is_active'] }
  ]
});

export default DiscountCode;
