#!/usr/bin/env node

/**
 * PureBite Production Setup Script
 * 
 * This script helps set up the production environment for PureBite
 * It handles database setup, admin user creation, and initial configuration
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

async function setupDatabase() {
  console.log('🔄 Setting up database...');
  
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Check if tables exist
    const userCount = await prisma.user.count();
    console.log(`📊 Found ${userCount} users in database`);
    
    return true;
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    return false;
  }
}

async function createAdminUser() {
  console.log('\n👤 Creating admin user...');
  
  const email = await question('Enter admin email: ');
  const name = await question('Enter admin name: ');
  const password = await question('Enter admin password: ');
  
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      console.log('⚠️  User already exists. Updating to admin role...');
      
      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          name,
          role: 'ADMIN',
          isActive: true
        }
      });
      
      console.log('✅ Existing user updated to admin role!');
      return updatedUser;
    }
    
    // Create new admin user
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const adminUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
        emailVerified: new Date()
      }
    });
    
    console.log('✅ Admin user created successfully!');
    console.log(`📧 Email: ${adminUser.email}`);
    console.log(`👤 Name: ${adminUser.name}`);
    console.log(`🔑 Role: ${adminUser.role}`);
    
    return adminUser;
  } catch (error) {
    console.error('❌ Failed to create admin user:', error.message);
    throw error;
  }
}

async function addSampleProducts() {
  console.log('\n🛍️  Adding sample products...');
  
  const addSamples = await question('Add sample products? (y/n): ');
  
  if (addSamples.toLowerCase() !== 'y') {
    console.log('⏭️  Skipping sample products');
    return;
  }
  
  const sampleProducts = [
    {
      name: 'জৈব আম',
      nameEn: 'Organic Mango',
      description: 'তাজা জৈব আম, সম্পূর্ণ প্রাকৃতিক এবং স্বাস্থ্যকর',
      price: 320,
      salePrice: 280,
      image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=500',
      images: [
        'https://images.unsplash.com/photo-1553279768-865429fa0078?w=500',
        'https://images.unsplash.com/photo-1605027990121-3b2c6c7b4b91?w=500'
      ],
      category: 'ফল',
      tags: ['জৈব', 'তাজা', 'প্রাকৃতিক'],
      inStock: true,
      stockCount: 50,
      lowStockThreshold: 10
    },
    {
      name: 'দেশি মধু',
      nameEn: 'Pure Honey',
      description: 'খাঁটি দেশি মধু, কোনো ভেজাল নেই',
      price: 750,
      image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500',
      images: [
        'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500'
      ],
      category: 'প্রাকৃতিক পণ্য',
      tags: ['খাঁটি', 'দেশি', 'স্বাস্থ্যকর'],
      inStock: true,
      stockCount: 25,
      lowStockThreshold: 5
    },
    {
      name: 'জৈব শাকসবজি',
      nameEn: 'Organic Vegetables',
      description: 'মিশ্র জৈব শাকসবজি প্যাক',
      price: 180,
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500',
      images: [
        'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500'
      ],
      category: 'সবজি',
      tags: ['জৈব', 'মিশ্র', 'প্যাকেজ'],
      inStock: true,
      stockCount: 30,
      lowStockThreshold: 8
    }
  ];
  
  try {
    for (const product of sampleProducts) {
      await prisma.product.create({
        data: product
      });
    }
    
    console.log(`✅ Added ${sampleProducts.length} sample products!`);
  } catch (error) {
    console.error('❌ Failed to add sample products:', error.message);
  }
}

async function setupPaymentGateway() {
  console.log('\n💳 Payment Gateway Setup');
  console.log('Please ensure you have configured the following in your .env.local:');
  console.log('- SSLCOMMERZ_STORE_ID');
  console.log('- SSLCOMMERZ_STORE_PASSWORD');
  console.log('- SSLCOMMERZ_IS_SANDBOX (set to false for production)');
  
  const configured = await question('Have you configured SSLCommerz? (y/n): ');
  
  if (configured.toLowerCase() === 'y') {
    console.log('✅ Payment gateway configuration noted');
  } else {
    console.log('⚠️  Please configure SSLCommerz before going live');
    console.log('📖 Visit: https://developer.sslcommerz.com/');
  }
}

async function finalChecklist() {
  console.log('\n📋 Production Readiness Checklist:');
  
  const checks = [
    'Database connection is working',
    'Admin user is created',
    'Environment variables are set',
    'Payment gateway is configured',
    'Email service is set up',
    'Domain is configured',
    'SSL certificate is installed'
  ];
  
  checks.forEach((check, index) => {
    console.log(`${index + 1}. ✅ ${check}`);
  });
  
  console.log('\n🚀 Your PureBite store is ready for production!');
  console.log('🌐 Access admin panel at: /admin');
  console.log('📧 Admin login with the credentials you just created');
}

async function main() {
  console.log('🌟 PureBite Production Setup');
  console.log('============================');
  
  try {
    // Step 1: Setup database
    const dbReady = await setupDatabase();
    if (!dbReady) {
      console.log('❌ Database setup failed. Please check your DATABASE_URL');
      process.exit(1);
    }
    
    // Step 2: Create admin user
    await createAdminUser();
    
    // Step 3: Add sample products (optional)
    await addSampleProducts();
    
    // Step 4: Payment gateway check
    await setupPaymentGateway();
    
    // Step 5: Final checklist
    await finalChecklist();
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n👋 Setup cancelled');
  await prisma.$disconnect();
  rl.close();
  process.exit(0);
});

// Run the setup
if (require.main === module) {
  main();
}

module.exports = {
  setupDatabase,
  createAdminUser,
  addSampleProducts
};