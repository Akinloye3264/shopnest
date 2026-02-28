const User = require('./User.model');
const Product = require('./Product.model');
const Job = require('./Job.model');
const Application = require('./Application.model');

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

module.exports = {
    User,
    Product,
    Job,
    Application
};
