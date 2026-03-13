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

        // Fix broken image URLs in existing products
        await Product.update(
            { image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&q=80&w=800' },
            { where: { title: 'Minimalist Oak Desk' } }
        );

        const productCount = await Product.count();
        if (productCount < 15) {
            console.log('Seeding products...');
            const existingTitles = (await Product.findAll({ attributes: ['title'] })).map(p => p.title);

            const allProducts = [
                {
                    title: "Premium Graphite Pro Laptop",
                    description: "Powerful laptop with 32GB RAM and 1TB SSD. Great for work, design, and coding.",
                    price: 2499.00, category: "Electronics", stock: 25, sellerId: sellerUser.id,
                    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=800"
                },
                {
                    title: "Wireless ANC Headphones",
                    description: "Noise-cancelling headphones with 40-hour battery. Clear sound, very comfortable.",
                    price: 349.99, category: "Electronics", stock: 50, sellerId: sellerUser.id,
                    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800"
                },
                {
                    title: "Minimalist Oak Desk",
                    description: "Solid oak desk with cable management built in. Clean and modern look for any room.",
                    price: 850.00, category: "Home", stock: 10, sellerId: adminUser.id,
                    image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&q=80&w=800"
                },
                {
                    title: "Urban Explorer Backpack",
                    description: "Waterproof bag with a padded laptop sleeve. Good for school, work, or travel.",
                    price: 120.00, category: "Fashion", stock: 100, sellerId: sellerUser.id,
                    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800"
                },
                {
                    title: "Mechanical Keyboard",
                    description: "Satisfying tactile typing experience. Great for programmers and heavy typists.",
                    price: 159.99, category: "Electronics", stock: 30, sellerId: sellerUser.id,
                    image: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&q=80&w=800"
                },
                {
                    title: "Stainless Steel Watch",
                    description: "Classic and stylish watch for everyday wear. Water resistant up to 50m.",
                    price: 299.00, category: "Fashion", stock: 40, sellerId: sellerUser.id,
                    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800"
                },
                {
                    title: "Portable Bluetooth Speaker",
                    description: "Loud, clear sound in a small package. Waterproof and 12-hour battery life.",
                    price: 89.99, category: "Electronics", stock: 75, sellerId: sellerUser.id,
                    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&q=80&w=800"
                },
                {
                    title: "Running Shoes",
                    description: "Lightweight and breathable shoes. Good cushioning for long runs or everyday use.",
                    price: 110.00, category: "Fashion", stock: 60, sellerId: sellerUser.id,
                    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800"
                },
                {
                    title: "4K Mirrorless Camera",
                    description: "Take sharp photos and 4K videos. Compact body, swappable lenses, easy to carry.",
                    price: 1199.00, category: "Electronics", stock: 15, sellerId: sellerUser.id,
                    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800"
                },
                {
                    title: "Ergonomic Office Chair",
                    description: "Adjustable lumbar support and armrests. Sit comfortably for hours without back pain.",
                    price: 450.00, category: "Home", stock: 20, sellerId: adminUser.id,
                    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800"
                },
                {
                    title: "Coffee Maker",
                    description: "Brews a fresh pot in under 10 minutes. Simple to use, easy to clean.",
                    price: 79.99, category: "Home", stock: 45, sellerId: adminUser.id,
                    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=800"
                },
                {
                    title: "Polarised Sunglasses",
                    description: "UV400 protection with polarised lenses. Reduces glare, great for driving or outdoors.",
                    price: 65.00, category: "Fashion", stock: 80, sellerId: sellerUser.id,
                    image: "https://images.unsplash.com/photo-1473496169904-658ba7574b0d?auto=format&fit=crop&q=80&w=800"
                },
                {
                    title: "Leather Wallet",
                    description: "Slim genuine leather wallet. Fits cards and cash without the bulk.",
                    price: 45.00, category: "Fashion", stock: 120, sellerId: sellerUser.id,
                    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=800"
                },
                {
                    title: "Wireless Charging Pad",
                    description: "Fast wireless charging for any Qi-compatible phone. No cables needed.",
                    price: 35.00, category: "Electronics", stock: 90, sellerId: sellerUser.id,
                    image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&q=80&w=800"
                },
                {
                    title: "Indoor Plant Set",
                    description: "Set of 3 easy-to-care-for plants. Makes any room feel fresh and lively.",
                    price: 55.00, category: "Home", stock: 35, sellerId: adminUser.id,
                    image: "https://images.unsplash.com/photo-1490750967868-88df5691cc9e?auto=format&fit=crop&q=80&w=800"
                },
            ];

            const toCreate = allProducts.filter(p => !existingTitles.includes(p.title));
            if (toCreate.length > 0) await Product.bulkCreate(toCreate);
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
