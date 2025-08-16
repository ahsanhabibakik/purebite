#!/usr/bin/env node

/**
 * Script to fix Prisma client issues including Windows permission problems
 * Run this script when you encounter Prisma generation or build errors
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('🔧 Fixing Prisma client issues...\n');

const isWindows = os.platform() === 'win32';

// Helper function to safely remove directories
function safeRemoveDir(dirPath, description) {
  try {
    if (fs.existsSync(dirPath)) {
      if (isWindows) {
        // Use Windows commands for better file handling
        execSync(`rmdir /s /q "${dirPath}"`, { stdio: 'inherit', shell: true });
      } else {
        execSync(`rm -rf "${dirPath}"`, { stdio: 'inherit' });
      }
      console.log(`   ✅ Removed ${description}`);
      return true;
    }
  } catch (error) {
    console.log(`   ⚠️  Could not remove ${description}, trying alternative method...`);
    
    // Try alternative removal method
    try {
      if (fs.existsSync(dirPath)) {
        fs.rmSync(dirPath, { recursive: true, force: true });
        console.log(`   ✅ Removed ${description} (alternative method)`);
        return true;
      }
    } catch (altError) {
      console.log(`   ❌ Failed to remove ${description}: ${altError.message}`);
      return false;
    }
  }
  return true;
}

// Step 1: Kill any processes that might lock files
console.log('1. Stopping potentially interfering processes...');
if (isWindows) {
  try {
    execSync('taskkill /f /im node.exe', { stdio: 'ignore' });
    console.log('   ✅ Stopped Node.js processes');
  } catch (error) {
    console.log('   ℹ️  No Node.js processes to stop');
  }
}

// Step 2: Clean caches
console.log('\n2. Cleaning caches...');
const cleanupPaths = [
  { path: '.next', desc: '.next cache' },
  { path: 'node_modules/.pnpm/@prisma+client*', desc: 'Prisma client cache' },
  { path: 'node_modules/.prisma', desc: 'Prisma generated files' }
];

cleanupPaths.forEach(({ path: cleanPath, desc }) => {
  if (cleanPath.includes('*')) {
    // Handle glob patterns
    try {
      if (isWindows) {
        execSync(`for /d %i in ("${cleanPath}") do rmdir /s /q "%i"`, { stdio: 'ignore', shell: true });
      } else {
        execSync(`rm -rf ${cleanPath}`, { stdio: 'ignore' });
      }
      console.log(`   ✅ Removed ${desc}`);
    } catch (error) {
      console.log(`   ⚠️  Could not remove ${desc}`);
    }
  } else {
    safeRemoveDir(cleanPath, desc);
  }
});

// Step 3: Regenerate Prisma client with retry logic
console.log('\n3. Regenerating Prisma client...');

async function generatePrismaWithRetry(maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`   Attempt ${attempt}/${maxRetries}...`);
      
      // Wait a bit between attempts to allow file system to settle
      if (attempt > 1) {
        console.log('   Waiting for file system to settle...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      // Try different generation methods
      if (isWindows && attempt > 1) {
        // Try with pnpm for Windows
        execSync('pnpm exec prisma generate', { stdio: 'inherit', timeout: 60000 });
      } else {
        execSync('npx prisma generate', { stdio: 'inherit', timeout: 60000 });
      }
      
      console.log('   ✅ Prisma client regenerated');
      return true;
    } catch (error) {
      console.log(`   ❌ Attempt ${attempt} failed: ${error.message}`);
      
      if (attempt === maxRetries) {
        console.error('\n💥 All attempts to generate Prisma client failed!');
        console.log('\n🔧 Manual fix suggestions:');
        console.log('   1. Run this script as Administrator');
        console.log('   2. Close all editors/IDEs and retry');
        console.log('   3. Restart your computer and retry');
        console.log('   4. Try: pnpm remove @prisma/client && pnpm add @prisma/client');
        return false;
      }
    }
  }
}

// Use async wrapper to handle retries
(async () => {
  const success = await generatePrismaWithRetry();
  
  if (!success) {
    process.exit(1);
  }
  
  // Step 4: Verify installation
  console.log('\n4. Verifying installation...');
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
  console.log('   • Run "pnpm run fix:prisma" when encountering build issues');
})();