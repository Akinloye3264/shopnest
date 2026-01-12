import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import bcrypt from 'bcryptjs';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      notEmpty: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [6, 255]
    }
  },
  role: {
    type: DataTypes.ENUM('customer', 'seller', 'admin'),
    defaultValue: 'customer'
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
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
  storeName: {
    type: DataTypes.STRING,
    field: 'store_name'
  },
  storeSlug: {
    type: DataTypes.STRING,
    unique: true,
    field: 'store_slug'
  },
  storeDescription: {
    type: DataTypes.TEXT,
    field: 'store_description'
  },
  storeLogo: {
    type: DataTypes.STRING,
    field: 'store_logo'
  },
  isApproved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_approved'
  },
  isSuspended: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_suspended'
  },
  resetPasswordToken: {
    type: DataTypes.STRING,
    field: 'reset_password_token'
  },
  resetPasswordExpire: {
    type: DataTypes.DATE,
    field: 'reset_password_expire'
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    }
  }
});

User.prototype.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default User;
