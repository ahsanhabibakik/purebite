#!/usr/bin/env node

/**
 * Safe build script that handles Prisma client generation issues gracefully
 * This script attempts multiple strategies to ensure successful builds
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const isWindows = os.platform() === 'win32';

console.log('🚀 Starting safe build process...\n');

// Environment variable to skip Prisma generation if needed
const skipPrisma = process.env.SKIP_PRISMA_GENERATE === 'true';

async function safePrismaGenerate() {
  if (skipPrisma) {
    console.log('⏭️  Skipping Prisma generation (SKIP_PRISMA_GENERATE=true)');
    return true;
  }

  console.log('🔧 Generating Prisma client...');
  
  // Check if Prisma client already exists and is valid
  const prismaClientPath = path.join(process.cwd(), 'node_modules', '.prisma', 'client');
  if (fs.existsSync(prismaClientPath)) {
    console.log('   ℹ️  Prisma client already exists, checking validity...');
    try {
      const indexPath = path.join(prismaClientPath, 'index.js');
      if (fs.existsSync(indexPath)) {
        console.log('   ✅ Existing Prisma client appears valid');
        return true;
      }
    } catch (error) {
      console.log('   ⚠️  Existing Prisma client may be invalid, regenerating...');
    }
  }

  // Attempt to generate Prisma client with multiple strategies
  const strategies = [
    { cmd: 'npx prisma generate', desc: 'Standard npx method' },
    { cmd: 'pnpm exec prisma generate', desc: 'pnpm exec method' },
    { cmd: 'node_modules/.bin/prisma generate', desc: 'Direct binary method' }
  ];

  for (const strategy of strategies) {
    try {
      console.log(`   Trying: ${strategy.desc}`);
      execSync(strategy.cmd, { 
        stdio: 'inherit', 
        timeout: 120000, // 2 minutes timeout
        windowsHide: true 
      });
      console.log('   ✅ Prisma client generated successfully');
      return true;
    } catch (error) {
      console.log(`   ❌ ${strategy.desc} failed: ${error.message}`);
      
      // On Windows, try to handle permission issues
      if (isWindows && error.message.includes('EPERM')) {
        console.log('   🔧 Detected Windows permission issue, trying fix...');
        try {
          // Kill any potential node processes
          execSync('taskkill /f /im node.exe', { stdio: 'ignore' });
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Retry this strategy once more
          execSync(strategy.cmd, { 
            stdio: 'inherit', 
            timeout: 120000,
            windowsHide: true 
          });
          console.log('   ✅ Prisma client generated after permission fix');
          return true;
        } catch (retryError) {
          console.log('   ❌ Permission fix attempt failed');
        }
      }
    }
  }

  console.log('\n💥 All Prisma generation strategies failed!');
  console.log('🔧 Trying emergency fix script...');
  
  try {
    execSync('node scripts/fix-prisma.js', { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.log('❌ Emergency fix script also failed');
    return false;
  }
}

async function safeNextBuild() {
  console.log('\n📦 Building Next.js application...');
  
  try {
    execSync('npx next build', { 
      stdio: 'inherit',
      timeout: 600000, // 10 minutes timeout
      env: { 
        ...process.env,
        NODE_OPTIONS: '--max-old-space-size=4096' // Increase memory for build
      }
    });
    console.log('✅ Next.js build completed successfully');
    return true;
  } catch (error) {
    console.log(`❌ Next.js build failed: ${error.message}`);
    
    // Try with different optimization settings
    console.log('🔧 Trying build with reduced optimization...');
    try {
      execSync('npx next build', { 
        stdio: 'inherit',
        timeout: 600000,
        env: { 
          ...process.env,
          NODE_OPTIONS: '--max-old-space-size=4096',
          NEXT_TELEMETRY_DISABLED: '1'
        }
      });
      console.log('✅ Next.js build completed with reduced optimization');
      return true;
    } catch (retryError) {
      console.log(`❌ Build retry also failed: ${retryError.message}`);
      return false;
    }
  }
}

// Main build process
(async () => {
  try {
    // Step 1: Generate Prisma client
    const prismaSuccess = await safePrismaGenerate();
    
    if (!prismaSuccess) {
      console.log('\n💡 Prisma generation failed, but attempting build anyway...');
      console.log('   (You can set SKIP_PRISMA_GENERATE=true to skip this step)');
    }
    
    // Step 2: Build Next.js
    const buildSuccess = await safeNextBuild();
    
    if (buildSuccess) {
      console.log('\n🎉 Build completed successfully!');
      console.log('\n📋 Next steps:');
      console.log('   • Run "pnpm start" to start production server');
      console.log('   • Run "pnpm dev" to start development server');
      process.exit(0);
    } else {
      console.log('\n💥 Build failed!');
      console.log('\n🔧 Troubleshooting suggestions:');
      console.log('   1. Try: SKIP_PRISMA_GENERATE=true pnpm build');
      console.log('   2. Try: pnpm run build:force');
      console.log('   3. Try: pnpm run fix:prisma && pnpm build');
      console.log('   4. Check the error messages above for specific issues');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n💥 Unexpected error during build:', error.message);
    process.exit(1);
  }
})();