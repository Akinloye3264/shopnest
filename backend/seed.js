const { sequelize } = require('./src/config/database.config');
const { User, Product, Job } = require('./src/models');
const bcrypt = require('bcryptjs');

const seedData = async () => {
    try {
        // Sync database (force: true will drop tables and recreate them)
        // Use force: false to just add if not present, but sync() is good for fresh start
        console.log('Syncing database...');
        await sequelize.sync({ force: false });

        // 1. Create Default Users if they don't exist
        console.log('Checking for users...');
        let adminUser = await User.findOne({ where: { email: 'admin@shopnest.com' } });
        if (!adminUser) {
            console.log('Creating admin user...');
            const hashedPassword = await bcrypt.hash('admin123', 10);
            adminUser = await User.create({
                name: 'ShopNest Admin',
                email: 'admin@shopnest.com',
                password: hashedPassword,
                role: 'admin',
                isVerified: true
            });
        }

        let sellerUser = await User.findOne({ where: { email: 'seller@shopnest.com' } });
        if (!sellerUser) {
            console.log('Creating seller user...');
            const hashedPassword = await bcrypt.hash('seller123', 10);
            sellerUser = await User.create({
                name: 'Tech Store Seller',
                email: 'seller@shopnest.com',
                password: hashedPassword,
                role: 'seller',
                isVerified: true
            });
        }

        let buyerUser = await User.findOne({ where: { email: 'buyer@shopnest.com' } });
        if (!buyerUser) {
            console.log('Creating buyer user...');
            const hashedPassword = await bcrypt.hash('buyer123', 10);
            buyerUser = await User.create({
                name: 'John Doe',
                email: 'buyer@shopnest.com',
                password: hashedPassword,
                role: 'buyer',
                isVerified: true
            });
        }

        let employerUser = await User.findOne({ where: { email: 'employer@shopnest.com' } });
        if (!employerUser) {
            console.log('Creating employer user...');
            const hashedPassword = await bcrypt.hash('employer123', 10);
            employerUser = await User.create({
                name: 'Jane Smith (CEO)',
                email: 'employer@shopnest.com',
                password: hashedPassword,
                role: 'employer',
                isVerified: true
            });
        }

        let employeeUser = await User.findOne({ where: { email: 'employee@shopnest.com' } });
        if (!employeeUser) {
            console.log('Creating employee user...');
            const hashedPassword = await bcrypt.hash('employee123', 10);
            employeeUser = await User.create({
                name: 'Alice Cooper',
                email: 'employee@shopnest.com',
                password: hashedPassword,
                role: 'employee',
                isVerified: true
            });
        }

        // 2. Seed Products for the Seller
        console.log('Checking for products...');
        const productCount = await Product.count();
        if (productCount === 0) {
            console.log('Seeding products...');
            await Product.bulkCreate([
                {
                    title: "Premium Graphite Pro Laptop",
                    description: "The ultimate workstation for creative professionals. Features 32GB RAM, 1TB SSD, and the latest high-performance processor.",
                    price: 2499.00,
                    category: "Electronics",
                    stock: 25,
                    sellerId: sellerUser.id,
                    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=800"
                },
                {
                    title: "Quantum Wireless ANC Headphones",
                    description: "Immersive sound with industry-leading noise cancellation. 40-hour battery life and ultra-comfortable cushions.",
                    price: 349.99,
                    category: "Electronics",
                    stock: 50,
                    sellerId: sellerUser.id,
                    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800"
                },
                {
                    title: "Minimalist Oak Desk",
                    description: "Hand-crafted solid oak desk with integrated cable management. Perfect for your minimalist workspace.",
                    price: 850.00,
                    category: "Home",
                    stock: 10,
                    sellerId: adminUser.id,
                    image: "https://unsplash.com/photos/brown-wooden-study-table-9NI6PEGWxEc"
                },
                {
                    title: "Urban Explorer Backpack",
                    description: "Waterproof, durable, and designed for the modern commuter. Features a protected laptop sleeve.",
                    price: 120.00,
                    category: "Fashion",
                    stock: 100,
                    sellerId: sellerUser.id,
                    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800"
                },
                {
                    title: "Mechanical Logic Keyboard",
                    description: "Tactile response for high-speed logic entry and engineering workflows.",
                    price: 159.99,
                    category: "Electronics",
                    stock: 30,
                    sellerId: sellerUser.id,
                    image: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&q=80&w=800"
                }
            ]);
        }

        // 3. Seed Jobs for the Admin/Employer
        console.log('Checking for jobs...');
        const jobCount = await Job.count();
        if (jobCount === 0) {
            console.log('Seeding jobs...');
            await Job.bulkCreate([
                {
                    title: "Senior Full Stack Developer",
                    company: "ShopNest Tech",
                    location: "Remote / New York",
                    description: "Join our core team to scale the next generation e-commerce platform.",
                    requirements: "5+ years Experience with React, Node.js, and MySQL.",
                    salary: "$120k - $160k",
                    type: "Full-time",
                    employerId: employerUser.id
                },
                {
                    title: "Product Designer",
                    company: "ShopNest Creative",
                    location: "San Francisco, CA",
                    description: "Lead the UI/UX design of our marketplace and logistics platform.",
                    requirements: "Strong portfolio in SaaS or E-commerce products.",
                    salary: "$110k - $150k",
                    type: "Full-time",
                    employerId: employerUser.id
                }
            ]);
        }

        console.log('Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedData();
