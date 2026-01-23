import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'sender_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  receiverId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'receiver_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'subject'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'content'
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
  relatedOrderId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'related_order_id',
    references: {
      model: 'orders',
      key: 'id'
    }
  }
}, {
  tableName: 'messages',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['sender_id', 'receiver_id'],
      name: 'message_participants'
    },
    {
      fields: ['receiver_id', 'is_read'],
      name: 'unread_messages'
    }
  ]
});

export default Message;
