import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const LearningResource = sequelize.define('LearningResource', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'content'
  },
  category: {
    type: DataTypes.ENUM(
      'entrepreneurship',
      'ecommerce',
      'digital_skills',
      'financial_literacy',
      'marketing',
      'sales',
      'customer_service',
      'business_management'
    ),
    allowNull: false,
    field: 'category'
  },
  resourceType: {
    type: DataTypes.ENUM('article', 'video', 'course', 'guide', 'tool', 'template'),
    defaultValue: 'article',
    field: 'resource_type'
  },
  url: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'url'
  },
  thumbnail: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'thumbnail'
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Duration in minutes',
    field: 'duration'
  },
  difficulty: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
    defaultValue: 'beginner',
    field: 'difficulty'
  },
  tags: {
    type: DataTypes.JSON,
    defaultValue: [],
    field: 'tags'
  },
  viewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'view_count'
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_published'
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'created_by',
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'learning_resources',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default LearningResource;
