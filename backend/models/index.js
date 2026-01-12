import sequelize from '../config/database.js';
import User from './User.js';
import Store from './Store.js';
import Product from './Product.js';
import Order from './Order.js';
import DiscountCode from './DiscountCode.js';

// Define associations
User.hasOne(Store, { foreignKey: 'ownerId', as: 'store' });
Store.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

Store.hasMany(Product, { foreignKey: 'storeId', as: 'products' });
Product.belongsTo(Store, { foreignKey: 'storeId', as: 'store' });

User.hasMany(Product, { foreignKey: 'sellerId', as: 'products' });
Product.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });

User.hasMany(Order, { foreignKey: 'customerId', as: 'customerOrders' });
Order.belongsTo(User, { foreignKey: 'customerId', as: 'customer' });

User.hasMany(Order, { foreignKey: 'sellerId', as: 'sellerOrders' });
Order.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });

Store.hasMany(Order, { foreignKey: 'storeId', as: 'orders' });
Order.belongsTo(Store, { foreignKey: 'storeId', as: 'store' });

User.hasMany(DiscountCode, { foreignKey: 'sellerId', as: 'discountCodes' });
DiscountCode.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });

Store.hasMany(DiscountCode, { foreignKey: 'storeId', as: 'discountCodes' });
DiscountCode.belongsTo(Store, { foreignKey: 'storeId', as: 'store' });

export { sequelize, User, Store, Product, Order, DiscountCode };

