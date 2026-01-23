import sequelize from '../config/database.js';
import User from './User.js';
import Store from './Store.js';
import Product from './Product.js';
import Order from './Order.js';
import DiscountCode from './DiscountCode.js';
import Cart from './Cart.js';
import ProductRequest from './ProductRequest.js';
import Job from './Job.js';
import JobApplication from './JobApplication.js';
import Message from './Message.js';
import Notification from './Notification.js';
import LearningResource from './LearningResource.js';

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

// Cart associations
User.hasOne(Cart, { foreignKey: 'userId', as: 'cart' });
Cart.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// ProductRequest associations
User.hasMany(ProductRequest, { foreignKey: 'buyerId', as: 'productRequests' });
ProductRequest.belongsTo(User, { foreignKey: 'buyerId', as: 'buyer' });

// Job associations
User.hasMany(Job, { foreignKey: 'employerId', as: 'postedJobs' });
Job.belongsTo(User, { foreignKey: 'employerId', as: 'employer' });

// JobApplication associations
Job.hasMany(JobApplication, { foreignKey: 'jobId', as: 'applications' });
JobApplication.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });
User.hasMany(JobApplication, { foreignKey: 'applicantId', as: 'jobApplications' });
JobApplication.belongsTo(User, { foreignKey: 'applicantId', as: 'applicant' });

// Message associations
User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
User.hasMany(Message, { foreignKey: 'receiverId', as: 'receivedMessages' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });
Message.belongsTo(Job, { foreignKey: 'relatedJobId', as: 'relatedJob' });
Message.belongsTo(Order, { foreignKey: 'relatedOrderId', as: 'relatedOrder' });

// Notification associations
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Notification.belongsTo(Job, { foreignKey: 'relatedJobId', as: 'relatedJob' });
Notification.belongsTo(JobApplication, { foreignKey: 'relatedApplicationId', as: 'relatedApplication' });
Notification.belongsTo(Order, { foreignKey: 'relatedOrderId', as: 'relatedOrder' });

// LearningResource associations
User.hasMany(LearningResource, { foreignKey: 'createdBy', as: 'createdResources' });
LearningResource.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

export { 
  sequelize, 
  User, 
  Store, 
  Product, 
  Order, 
  DiscountCode, 
  Cart, 
  ProductRequest,
  Job,
  JobApplication,
  Message,
  Notification,
  LearningResource
};

