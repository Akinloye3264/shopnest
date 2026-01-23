import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Notification = sequelize.define('Notification', {
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
    }
  },
  type: {
    type: DataTypes.ENUM(
      'job_posted',
      'job_application',
      'job_application_status',
      'new_message',
      'order_update',
      'product_update',
      'system_announcement',
      'task_assigned',
      'payment_received',
      'earning_update'
    ),
    allowNull: false,
    field: 'type'
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'title'
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'message'
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_read'
  },
  readAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'read_at'
  },
  relatedJobId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'related_job_id',
    references: {
      model: 'jobs',
      key: 'id'
    }
  },
  relatedApplicationId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'related_application_id',
    references: {
      model: 'job_applications',
      key: 'id'
    }
  },
  relatedOrderId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'related_order_id',
    references: {
      model: 'orders',
      key: 'id'
    }
  },
  actionUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'action_url'
  }
}, {
  tableName: 'notifications',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['user_id', 'is_read'],
      name: 'user_notifications'
    }
  ]
});

export default Notification;
