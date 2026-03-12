const User = require('./User.model');
const Product = require('./Product.model');
const Job = require('./Job.model');
const Application = require('./Application.model');
const Review = require('./Review.model');
const Message = require('./Message.model');
const OTP = require('./OTP.model');
const { Order, OrderItem } = require('./Order.model');

// User - Product (Seller can have many products)
User.hasMany(Product, { foreignKey: 'sellerId', as: 'products' });
Product.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });

// User - Job (Employer can have many jobs)
User.hasMany(Job, { foreignKey: 'employerId', as: 'jobs' });
Job.belongsTo(User, { foreignKey: 'employerId', as: 'employer' });

// User - Application (Job Seeker can have many applications)
User.hasMany(Application, { foreignKey: 'userId', as: 'applications' });
Application.belongsTo(User, { foreignKey: 'userId', as: 'applicant' });

// Job - Application (Job can have many applications)
Job.hasMany(Application, { foreignKey: 'jobId', as: 'jobApplications' });
Application.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });

// Review Associations
User.hasMany(Review, { foreignKey: 'userId', as: 'reviewsGiven' });
Review.belongsTo(User, { foreignKey: 'userId', as: 'reviewer' });

Product.hasMany(Review, { foreignKey: 'productId', as: 'productReviews' });
Review.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

Job.hasMany(Review, { foreignKey: 'jobId', as: 'jobReviews' });
Review.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });

// Message Associations
User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

User.hasMany(Message, { foreignKey: 'receiverId', as: 'receivedMessages' });
Message.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });

// Order Associations
User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'buyer' });

Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

Product.hasMany(OrderItem, { foreignKey: 'productId', as: 'orderItems' });
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

module.exports = {
    User,
    Product,
    Job,
    Application,
    Review,
    Message,
    OTP,
    Order,
    OrderItem
};
