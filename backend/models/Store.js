import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Store = sequelize.define('Store', {
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
    type: DataTypes.TEXT
  },
  ownerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    field: 'owner_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  logo: {
    type: DataTypes.STRING
  },
  banner: {
    type: DataTypes.STRING
  },
  contactEmail: {
    type: DataTypes.STRING,
    field: 'contact_email'
  },
  contactPhone: {
    type: DataTypes.STRING,
    field: 'contact_phone'
  },
  addressStreet: {
    type: DataTypes.STRING,
    field: 'address_street'
  },
  addressCity: {
    type: DataTypes.STRING,
    field: 'address_city'
  },
  addressState: {
    type: DataTypes.STRING,
    field: 'address_state'
  },
  addressCountry: {
    type: DataTypes.STRING,
    field: 'address_country'
  },
  addressZipCode: {
    type: DataTypes.STRING,
    field: 'address_zip_code'
  },
  socialMediaFacebook: {
    type: DataTypes.STRING,
    field: 'social_media_facebook'
  },
  socialMediaTwitter: {
    type: DataTypes.STRING,
    field: 'social_media_twitter'
  },
  socialMediaInstagram: {
    type: DataTypes.STRING,
    field: 'social_media_instagram'
  },
  socialMediaWebsite: {
    type: DataTypes.STRING,
    field: 'social_media_website'
  },
  themePrimaryColor: {
    type: DataTypes.STRING,
    defaultValue: '#3B82F6',
    field: 'theme_primary_color'
  },
  themeSecondaryColor: {
    type: DataTypes.STRING,
    defaultValue: '#10B981',
    field: 'theme_secondary_color'
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'NGN'
  },
  language: {
    type: DataTypes.STRING,
    defaultValue: 'en'
  },
  allowReviews: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'allow_reviews'
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
  totalProducts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'total_products'
  },
  totalSales: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'total_sales'
  },
  totalOrders: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'total_orders'
  },
  totalRevenue: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    field: 'total_revenue'
  }
}, {
  tableName: 'stores',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Store;
