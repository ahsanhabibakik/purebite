// Script to create an admin user
// Run this with: node scripts/create-admin.js

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@purebite.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456';
    const adminName = 'Admin User';

    console.log('🔍 Checking if admin already exists...');
    
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists with email:', adminEmail);
      
      // Update role to ADMIN if not already
      if (existingAdmin.role !== 'ADMIN') {
        await prisma.user.update({
          where: { email: adminEmail },
          data: { role: 'ADMIN' }
        });
        console.log('✅ Updated user role to ADMIN');
      }
      
      console.log('📧 Admin Email:', adminEmail);
      console.log('🔑 Admin Password: [Use your existing password or reset it]');
      return;
    }

    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    console.log('👤 Creating admin user...');
    const admin = await prisma.user.create({
      data: {
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN',
        emailVerified: new Date(),
        isActive: true
      }
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Admin Email:', adminEmail);
    console.log('🔑 Admin Password:', adminPassword);
    console.log('🆔 Admin ID:', admin.id);
    console.log('');
    console.log('⚠️  IMPORTANT: Please change the default password after first login!');
    console.log('🚀 You can now login at /auth/signin');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();