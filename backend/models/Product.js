import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  compareAtPrice: {
    type: DataTypes.DECIMAL(10, 2),
    field: 'compare_at_price',
    validate: {
      min: 0
    }
  },
  images: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  tags: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  sku: {
    type: DataTypes.STRING
  },
  weight: {
    type: DataTypes.DECIMAL(8, 2)
  },
  dimensionsLength: {
    type: DataTypes.DECIMAL(8, 2),
    field: 'dimensions_length'
  },
  dimensionsWidth: {
    type: DataTypes.DECIMAL(8, 2),
    field: 'dimensions_width'
  },
  dimensionsHeight: {
    type: DataTypes.DECIMAL(8, 2),
    field: 'dimensions_height'
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
    allowNull: false,
    field: 'store_id',
    references: {
      model: 'stores',
      key: 'id'
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_featured'
  },
  metaTitle: {
    type: DataTypes.STRING,
    field: 'meta_title'
  },
  metaDescription: {
    type: DataTypes.TEXT,
    field: 'meta_description'
  },
  ratingAverage: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0,
    field: 'rating_average',
    validate: {
      min: 0,
      max: 5
    }
  },
  ratingCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'rating_count'
  },
  salesCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'sales_count'
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'products',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['seller_id', 'is_active'] },
    { fields: ['category', 'is_active'] },
    { fields: ['slug'] }
  ]
});

export default Product;
