const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database.config');

const OTP = sequelize.define('OTP', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  identifier: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Email or phone number'
  },
  otp: {
    type: DataTypes.STRING(6),
    allowNull: false
  },
  userData: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Temporary user data for registration'
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'otps',
  timestamps: true,
  indexes: [
    {
      fields: ['identifier']
    },
    {
      fields: ['expiresAt']
    }
  ]
});

module.exports = OTP;
