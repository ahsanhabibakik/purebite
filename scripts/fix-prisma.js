#!/usr/bin/env node

/**
 * Script to fix Prisma client browser bundle issues
 * Run this script when you encounter "Module not found: Can't resolve '.prisma/client/index-browser'" errors
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Prisma client browser bundle issues...\n');

// Step 1: Clean caches
console.log('1. Cleaning caches...');
try {
  // Remove Next.js build cache
  if (fs.existsSync('.next')) {
    execSync('rm -rf .next', { stdio: 'inherit' });
    console.log('   ✅ Removed .next cache');
  }
  
  // Remove Prisma client cache
  execSync('rm -rf node_modules/.pnpm/@prisma+client*', { stdio: 'inherit' });
  console.log('   ✅ Removed Prisma client cache');
} catch (error) {
  console.log('   ⚠️  Cache cleanup had some issues, continuing...');
}

// Step 2: Regenerate Prisma client
console.log('\n2. Regenerating Prisma client...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('   ✅ Prisma client regenerated');
} catch (error) {
  console.error('   ❌ Failed to regenerate Prisma client:', error.message);
  process.exit(1);
}

// Step 3: Verify installation
console.log('\n3. Verifying installation...');
const prismaClientPath = path.join(process.cwd(), 'node_modules', '.pnpm');
const hasPrismaClient = fs.existsSync(prismaClientPath) && 
  fs.readdirSync(prismaClientPath).some(dir => dir.includes('@prisma+client'));

if (hasPrismaClient) {
  console.log('   ✅ Prisma client properly installed');
} else {
  console.log('   ⚠️  Prisma client installation verification failed');
}

console.log('\n🎉 Prisma client fix completed!');
console.log('\n📋 Next steps:');
console.log('   • Run "pnpm run build" to test the build');
console.log('   • Run "pnpm run dev" to start development');
console.log('\n💡 To prevent future issues:');
console.log('   • Always run "prisma generate" after schema changes');
console.log('   • Use "pnpm run build:clean" for clean builds');