

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env FIRST (before importing sequelize/models)
dotenv.config({ path: resolve(__dirname, '../.env') });     // backend/.env
dotenv.config({ path: resolve(__dirname, '../../.env') });  // root/.env (optional fallback)


// Now import AFTER dotenv has populated process.env
const { default: sequelize } = await import('../config/database.js');
const { User, Store, Product, Order, DiscountCode } = await import('../models/index.js');

// Sample data
const sampleUsers = [
  {
    name: 'Admin User',
    email: 'admin@shopnest.com',
    password: 'admin123',
    role: 'admin',
    phone: '+2348012345678'
  },
  {
    name: 'John Seller',
    email: 'seller@shopnest.com',
    password: 'seller123',
    role: 'seller',
    phone: '+2348023456789',
    storeName: 'TechHub Store',
    isApproved: true
  },
  {
    name: 'Jane Seller',
    email: 'jane@shopnest.com',
    password: 'seller123',
    role: 'seller',
    phone: '+2348034567890',
    storeName: 'Fashion Paradise',
    isApproved: true
  },
  {
    name: 'Mike Customer',
    email: 'customer@shopnest.com',
    password: 'customer123',
    role: 'customer',
    phone: '+2348045678901',
    addressStreet: '123 Main Street',
    addressCity: 'Lagos',
    addressState: 'Lagos',
    addressCountry: 'Nigeria',
    addressZipCode: '100001'
  },
  {
    name: 'Sarah Customer',
    email: 'sarah@shopnest.com',
    password: 'customer123',
    role: 'customer',
    phone: '+2348056789012',
    addressStreet: '456 Oak Avenue',
    addressCity: 'Abuja',
    addressState: 'FCT',
    addressCountry: 'Nigeria',
    addressZipCode: '900001'
  }
];

const sampleProducts = [
  {
    name: 'Wireless Bluetooth Headphones',
    description: 'Premium wireless headphones with noise cancellation and 30-hour battery life. Perfect for music lovers and professionals.',
    price: 25000,
    compareAtPrice: 35000,
    category: 'Electronics',
    stock: 50,
    tags: ['wireless', 'bluetooth', 'audio', 'premium'],
    isFeatured: true
  },
  {
    name: 'Smart Watch Series 5',
    description: 'Feature-rich smartwatch with fitness tracking, heart rate monitor, and smartphone notifications.',
    price: 45000,
    compareAtPrice: 60000,
    category: 'Electronics',
    stock: 30,
    tags: ['smartwatch', 'fitness', 'wearable'],
    isFeatured: true
  },
  {
    name: 'Men\'s Casual T-Shirt',
    description: 'Comfortable cotton t-shirt available in multiple colors. Perfect for everyday wear.',
    price: 3500,
    compareAtPrice: 5000,
    category: 'Fashion',
    stock: 100,
    tags: ['clothing', 'men', 'casual', 'cotton']
  },
  {
    name: 'Women\'s Summer Dress',
    description: 'Elegant summer dress with floral print. Lightweight and breathable fabric.',
    price: 8500,
    compareAtPrice: 12000,
    category: 'Fashion',
    stock: 60,
    tags: ['clothing', 'women', 'dress', 'summer'],
    isFeatured: true
  },
  {
    name: 'Gaming Laptop',
    description: 'High-performance gaming laptop with RGB keyboard, 16GB RAM, and dedicated graphics card.',
    price: 350000,
    compareAtPrice: 450000,
    category: 'Electronics',
    stock: 15,
    tags: ['laptop', 'gaming', 'computer', 'tech']
  },
  {
    name: 'Stainless Steel Cookware Set',
    description: '10-piece cookware set including pots, pans, and lids. Durable and easy to clean.',
    price: 25000,
    compareAtPrice: 35000,
    category: 'Home & Garden',
    stock: 40,
    tags: ['kitchen', 'cookware', 'stainless steel']
  },
  {
    name: 'Yoga Mat Premium',
    description: 'Non-slip yoga mat with carrying strap. Extra thick for comfort during exercises.',
    price: 5500,
    compareAtPrice: 8000,
    category: 'Sports & Outdoors',
    stock: 80,
    tags: ['yoga', 'fitness', 'exercise', 'wellness']
  },
  {
    name: 'Designer Handbag',
    description: 'Luxury leather handbag with multiple compartments. Perfect for work or evening events.',
    price: 45000,
    compareAtPrice: 65000,
    category: 'Fashion',
    stock: 25,
    tags: ['handbag', 'leather', 'designer', 'women']
  },
  {
    name: 'Smartphone Case & Screen Protector',
    description: 'Protective case with tempered glass screen protector. Compatible with latest smartphone models.',
    price: 3500,
    compareAtPrice: 5000,
    category: 'Electronics',
    stock: 150,
    tags: ['phone', 'accessories', 'protection']
  },
  {
    name: 'Running Shoes',
    description: 'Comfortable running shoes with cushioned sole and breathable mesh upper.',
    price: 12000,
    compareAtPrice: 18000,
    category: 'Sports & Outdoors',
    stock: 70,
    tags: ['shoes', 'running', 'sports', 'fitness'],
    isFeatured: true
  }
];

async function seedDatabase() {
  try {
    console.log(' Connecting to database...');
    await sequelize.authenticate();
    console.log('Connected to database');

    // Sync database (create tables)
    console.log('Syncing database...');
    await sequelize.sync({ force: false });
    console.log(' Database synced');

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('  Clearing existing data...');

    await Order.destroy({ where: {}, force: true });
    await DiscountCode.destroy({ where: {}, force: true });
    await Product.destroy({ where: {}, force: true });
    
    // Now that children are gone, delete parents
    await Store.destroy({ where: {}, force: true });
    await User.destroy({ where: {}, force: true });
    
    console.log(' Database cleared');
    

    // Create users
    console.log('👥 Creating users...');
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const user = await User.create(userData);
      createdUsers.push(user);
      console.log(`   Created user: ${user.email}`);
    }

    // Create stores for sellers
    // Create stores for sellers
console.log(' Creating stores...');
const stores = [];
const sellers = createdUsers.filter(u => u.role === 'seller');

for (const seller of sellers) {
  const baseSlug = seller.storeName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // spaces -> hyphen
    .replace(/[^a-z0-9-]/g, ''); // remove special chars

  // make it unique (safe even if two stores share same name)
  const slug = `${baseSlug}-${seller.id}`;

  const store = await Store.create({
    name: seller.storeName,
    slug,
    ownerId: seller.id,
    contactEmail: seller.email,
    description: `Welcome to ${seller.storeName}! We offer quality products at great prices.`,
    isActive: true,
    isFeatured: seller.storeName === 'TechHub Store'
  });

  stores.push(store);
  console.log(`   Created store: ${store.name} (${store.slug})`);
}


    // Create products
    console.log('Creating products...');
    const products = [];
    const techHubStore = stores.find(s => s.name === 'TechHub Store');
    const fashionStore = stores.find(s => s.name === 'Fashion Paradise');
    
    for (let i = 0; i < sampleProducts.length; i++) {
      const productData = sampleProducts[i];
      const seller = i < 5 ? sellers[0] : sellers[1];
      const store = i < 5 ? techHubStore : fashionStore;
      
      const slug = productData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now() + i;
      
      const product = await Product.create({
        ...productData,
        slug,
        sellerId: seller.id,
        storeId: store.id,
        images: [{
          url: `https://picsum.photos/800/600?random=${i + 1}`,
          alt: productData.name
        }],
        sku: `SKU-${String(i + 1).padStart(4, '0')}`
      });
      products.push(product);
      console.log(`    Created product: ${product.name}`);
    }

    // Create discount codes
    console.log(' Creating discount codes...');
    const discountCodes = [
      {
        code: 'WELCOME10',
        type: 'percentage',
        value: 10,
        minPurchaseAmount: 5000,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      {
        code: 'SAVE5000',
        type: 'fixed',
        value: 5000,
        minPurchaseAmount: 25000,
        validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
      }
    ];

    for (const codeData of discountCodes) {
      const discountCode = await DiscountCode.create({
        ...codeData,
        sellerId: sellers[0].id,
        storeId: techHubStore.id
      });
      console.log(`    Created discount code: ${discountCode.code}`);
    }

    // Create sample orders
    console.log('Creating sample orders...');
    const customers = createdUsers.filter(u => u.role === 'customer');
    
    for (let i = 0; i < 5; i++) {
      const customer = customers[i % customers.length];
      const product = products[i % products.length];
      const quantity = Math.floor(Math.random() * 3) + 1;
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      const subtotal = parseFloat(product.price) * quantity;
      const total = subtotal;

      const order = await Order.create({
        orderNumber,
        customerId: customer.id,
        items: [{
          product: product.id,
          name: product.name,
          price: product.price,
          quantity: quantity,
          image: product.images && product.images[0] ? product.images[0].url : ''
        }],
        sellerId: product.sellerId,
        storeId: product.storeId,
        shippingAddressName: customer.name,
        shippingAddressStreet: customer.addressStreet || 'Sample Street',
        shippingAddressCity: customer.addressCity || 'Lagos',
        shippingAddressState: customer.addressState || 'Lagos',
        shippingAddressCountry: customer.addressCountry || 'Nigeria',
        shippingAddressZipCode: customer.addressZipCode || '100001',
        shippingAddressPhone: customer.phone,
        billingAddressName: customer.name,
        billingAddressStreet: customer.addressStreet || 'Sample Street',
        billingAddressCity: customer.addressCity || 'Lagos',
        billingAddressState: customer.addressState || 'Lagos',
        billingAddressCountry: customer.addressCountry || 'Nigeria',
        billingAddressZipCode: customer.addressZipCode || '100001',
        subtotal,
        total,
        paymentStatus: i < 3 ? 'paid' : 'pending',
        orderStatus: i === 0 ? 'delivered' : i === 1 ? 'shipped' : i === 2 ? 'confirmed' : 'pending',
        paymentMethod: 'card'
      });
      console.log(`    Created order: ${order.orderNumber}`);
    }

    console.log('\nDatabase seeding completed successfully!');
    console.log('\nSummary:');
    console.log(`   Users: ${createdUsers.length}`);
    console.log(`   Stores: ${stores.length}`);
    console.log(`   Products: ${products.length}`);
    console.log(`   Discount Codes: ${discountCodes.length}`);
    console.log(`   Orders: 5`);
    console.log('\nLogin Credentials:');
    console.log('   Admin: admin@shopnest.com / admin123');
    console.log('   Seller: seller@shopnest.com / seller123');
    console.log('   Customer: customer@shopnest.com / customer123');
    console.log('\n');

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    await sequelize.close();
    process.exit(1);
  }
}



seedDatabase();
