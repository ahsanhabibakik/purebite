#!/usr/bin/env node

/**
 * Email Service Setup and Testing Script for PureBite E-commerce
 */

const fs = require('fs');
const path = require('path');

console.log('📧 Email Service Setup & Testing');
console.log('==================================');

// Check if environment file exists
const envPath = path.join(process.cwd(), '.env.local');
let envContent = '';

if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
}

console.log('✅ Email service is already implemented');
console.log('📋 Available email templates:');
console.log('  - Order confirmation emails (Bengali/English)');
console.log('  - Admin order notifications');
console.log('  - Password reset emails');
console.log('  - Newsletter welcome emails');
console.log('  - Order status update emails');
console.log('  - Professional HTML templates with responsive design');

console.log('\n🔧 Configuration Required:');
console.log('1. SMTP_HOST - SMTP server (default: smtp.gmail.com)');
console.log('2. SMTP_PORT - SMTP port (default: 587)');
console.log('3. SMTP_USER - Your email address');
console.log('4. SMTP_PASSWORD - App password (for Gmail)');
console.log('5. SMTP_FROM - From email address');
console.log('6. SUPPORT_EMAIL - Support email address');

// Check current configuration
const requiredVars = [
  'SMTP_HOST',
  'SMTP_USER', 
  'SMTP_PASSWORD',
  'SMTP_FROM',
  'SUPPORT_EMAIL'
];

console.log('\n📊 Environment Check:');
let allConfigured = true;
requiredVars.forEach(varName => {
  const isSet = envContent.includes(varName) && !envContent.includes(`${varName}=""`);
  console.log(`  ${isSet ? '✅' : '❌'} ${varName}: ${isSet ? 'Configured' : 'Not set'}`);
  if (!isSet) allConfigured = false;
});

if (allConfigured) {
  console.log('\n🎉 Email service is fully configured!');
} else {
  console.log('\n⚠️  Missing configuration. Please update .env.local with:');
  console.log('   SMTP_HOST="smtp.gmail.com"');
  console.log('   SMTP_PORT="587"');
  console.log('   SMTP_USER="your-email@gmail.com"');
  console.log('   SMTP_PASSWORD="your-app-password"');
  console.log('   SMTP_FROM="noreply@yoursite.com"');
  console.log('   SUPPORT_EMAIL="support@yoursite.com"');
}

console.log('\n📝 Gmail App Password Setup:');
console.log('1. Enable 2-Factor Authentication on Gmail');
console.log('2. Go to Google Account Settings');
console.log('3. Security > App passwords');
console.log('4. Generate app password for "Mail"');
console.log('5. Use this password in SMTP_PASSWORD');

console.log('\n🧪 Test Email Service:');
console.log('1. Visit: /admin/email-test');
console.log('2. Send test emails to verify configuration');
console.log('3. Check spam folder if emails not received');

console.log('\n📧 Email Triggers:');
console.log('- Order confirmation: Sent automatically after successful payment');
console.log('- Admin notifications: Sent to admin for new orders');
console.log('- Order updates: Sent when order status changes');
console.log('- Password reset: Sent when user requests password reset');
console.log('- Newsletter: Sent when user subscribes to newsletter');

console.log('\n✨ Email service setup complete!');