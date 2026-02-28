const { Product, User } = require('./src/models');
const { sequelize } = require('./src/config/database.config');

const seedProducts = [
    {
        title: "Premium Graphite Pro Laptop",
        description: "The ultimate workstation for creative professionals. Features 32GB RAM, 1TB SSD, and the latest high-performance processor. Sleek metal finish and 10-hour battery life.",
        price: 2499.00,
        category: "Electronics",
        stock: 25,
        image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=800"
    },
    {
        title: "Quantum Wireless ANC Headphones",
        description: "Immersive sound with industry-leading noise cancellation. 40-hour battery life and ultra-comfortable memory foam ear cushions.",
        price: 349.99,
        category: "Electronics",
        stock: 50,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800"
    },
    {
        title: "Minimalist Oak Desk",
        description: "Hand-crafted solid oak desk with integrated cable management. The perfect foundation for your minimalist workspace.",
        price: 850.00,
        category: "Home",
        stock: 10,
        image: "https://images.unsplash.com/photo-1518455027359-f3f816b1a23a?auto=format&fit=crop&q=80&w=800"
    },
    {
        title: "Urban Explorer Backpack",
        description: "Waterproof, durable, and designed for the modern commuter. Features a protected laptop sleeve and 15 storage compartments.",
        price: 120.00,
        category: "Fashion",
        stock: 100,
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800"
    },
    {
        title: "Strategic Business Toolkit",
        description: "A comprehensive digital suite for small business owners. Includes CRM templates, financial trackers, and marketing automation scripts.",
        price: 49.00,
        category: "Business Tools",
        stock: 999,
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800"
    }
];

async function seed() {
    try {
        await sequelize.sync();

        // Find first user to be the owner
        const user = await User.findOne();
        if (!user) {
            console.log('❌ No user found in DB. Please register at least one user first!');
            return;
        }

        console.log(`Using user ${user.email} as the seller...`);

        for (const p of seedProducts) {
            await Product.create({
                ...p,
                sellerId: user.id
            });
        }

        console.log('✅ Marketplace populated successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seed();
