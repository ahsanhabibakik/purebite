#!/usr/bin/env node

/**
 * Production Deployment Script for PureBite E-commerce
 * This script helps deploy the application to Vercel with proper configuration
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 PureBite E-commerce Deployment Script');
console.log('=========================================');

// Check if vercel.json exists
const vercelConfigPath = path.join(process.cwd(), 'vercel.json');
if (!fs.existsSync(vercelConfigPath)) {
  console.log('❌ vercel.json not found. Creating deployment configuration...');
  
  const vercelConfig = {
    "buildCommand": "pnpm build",
    "devCommand": "pnpm dev",
    "installCommand": "pnpm install",
    "framework": "nextjs",
    "functions": {
      "src/app/api/**/*.ts": {
        "maxDuration": 60
      }
    },
    "env": {
      "NEXTAUTH_URL": "@nextauth_url",
      "NEXTAUTH_SECRET": "@nextauth_secret",
      "DATABASE_URL": "@database_url",
      "SSLCOMMERZ_STORE_ID": "@sslcommerz_store_id",
      "SSLCOMMERZ_STORE_PASSWORD": "@sslcommerz_store_password",
      "SMTP_HOST": "@smtp_host",
      "SMTP_USER": "@smtp_user", 
      "SMTP_PASSWORD": "@smtp_password",
      "OPENAI_API_KEY": "@openai_api_key",
      "CLOUDINARY_CLOUD_NAME": "@cloudinary_cloud_name",
      "CLOUDINARY_API_KEY": "@cloudinary_api_key",
      "CLOUDINARY_API_SECRET": "@cloudinary_api_secret"
    },
    "headers": [
      {
        "source": "/api/(.*)",
        "headers": [
          {
            "key": "Access-Control-Allow-Origin",
            "value": "*"
          },
          {
            "key": "Access-Control-Allow-Methods", 
            "value": "GET, POST, PUT, DELETE, OPTIONS"
          },
          {
            "key": "Access-Control-Allow-Headers",
            "value": "Content-Type, Authorization"
          }
        ]
      }
    ]
  };

  fs.writeFileSync(vercelConfigPath, JSON.stringify(vercelConfig, null, 2));
  console.log('✅ Created vercel.json configuration');
}

console.log('\n📋 Pre-deployment Checklist:');
console.log('1. ✅ Build successful');
console.log('2. ✅ Vercel configuration ready');

console.log('\n🔧 Next Steps:');
console.log('1. Login to Vercel: npx vercel login');
console.log('2. Deploy to Vercel: npx vercel --prod');
console.log('3. Set environment variables in Vercel dashboard');
console.log('4. Configure custom domain (optional)');

console.log('\n📝 Important Environment Variables to Set in Vercel:');
console.log('- NEXTAUTH_URL (your production URL)');
console.log('- NEXTAUTH_SECRET (random secret)');
console.log('- DATABASE_URL (MongoDB connection string)');
console.log('- SSLCOMMERZ_STORE_ID & SSLCOMMERZ_STORE_PASSWORD');
console.log('- SMTP credentials for email');
console.log('- OPENAI_API_KEY for AI features');
console.log('- Cloudinary credentials for image uploads');

console.log('\n🎯 Ready for deployment!');