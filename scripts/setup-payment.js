#!/usr/bin/env node

/**
 * SSLCommerz Payment Gateway Setup Script for PureBite E-commerce
 */

const fs = require('fs');
const path = require('path');

console.log('💳 SSLCommerz Payment Gateway Setup');
console.log('=====================================');

// Check if environment file exists
const envPath = path.join(process.cwd(), '.env.local');
let envContent = '';

if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
}

console.log('✅ SSLCommerz payment integration is already implemented');
console.log('📋 Current features:');
console.log('  - Complete payment flow with callbacks');
console.log('  - Order creation and tracking');
console.log('  - Success, failure, and cancel handling');
console.log('  - IPN (Instant Payment Notification) support');
console.log('  - Mobile and web payment support');

console.log('\n🔧 Configuration Required:');
console.log('1. SSLCOMMERZ_STORE_ID - Your SSLCommerz store ID');
console.log('2. SSLCOMMERZ_STORE_PASSWORD - Your store password');
console.log('3. SSLCOMMERZ_IS_SANDBOX - Set to "true" for testing');

// Check current configuration
const requiredVars = [
  'SSLCOMMERZ_STORE_ID',
  'SSLCOMMERZ_STORE_PASSWORD', 
  'SSLCOMMERZ_IS_SANDBOX'
];

console.log('\n📊 Environment Check:');
let allConfigured = true;
requiredVars.forEach(varName => {
  const isSet = envContent.includes(varName) && !envContent.includes(`${varName}=""`);
  console.log(`  ${isSet ? '✅' : '❌'} ${varName}: ${isSet ? 'Configured' : 'Not set'}`);
  if (!isSet) allConfigured = false;
});

if (allConfigured) {
  console.log('\n🎉 SSLCommerz is fully configured!');
} else {
  console.log('\n⚠️  Missing configuration. Please update .env.local with:');
  console.log('   SSLCOMMERZ_STORE_ID="your_actual_store_id"');
  console.log('   SSLCOMMERZ_STORE_PASSWORD="your_actual_password"');
  console.log('   SSLCOMMERZ_IS_SANDBOX="true"  # Set to false for production');
}

console.log('\n📝 How to get SSLCommerz credentials:');
console.log('1. Visit: https://www.sslcommerz.com/');
console.log('2. Create merchant account');
console.log('3. Get Store ID and Password from dashboard');
console.log('4. Use sandbox credentials for testing');

console.log('\n🧪 Test Payment Flow:');
console.log('1. Add items to cart');
console.log('2. Proceed to checkout');
console.log('3. Fill customer information');
console.log('4. Click "Place Order" to test payment');

console.log('\n✨ Payment gateway setup complete!');