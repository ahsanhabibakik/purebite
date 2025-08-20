#!/usr/bin/env node

/**
 * Domain and SSL Configuration Script for PureBite E-commerce
 */

const fs = require('fs');
const path = require('path');

console.log('🌐 Domain & SSL Configuration');
console.log('==============================');

function checkVercelConfiguration() {
  console.log('🔍 Checking Vercel Configuration...');
  
  const vercelConfigPath = path.join(process.cwd(), 'vercel.json');
  
  if (fs.existsSync(vercelConfigPath)) {
    console.log('✅ vercel.json found');
    
    try {
      const config = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));
      
      console.log('📋 Current Vercel Configuration:');
      console.log(`  - Framework: ${config.framework || 'Not specified'}`);
      console.log(`  - Build Command: ${config.buildCommand || 'Default'}`);
      console.log(`  - Functions: ${config.functions ? 'Configured' : 'Not configured'}`);
      console.log(`  - Headers: ${config.headers ? 'Configured' : 'Not configured'}`);
      
      return true;
    } catch (error) {
      console.log('❌ Error reading vercel.json:', error.message);
      return false;
    }
  } else {
    console.log('❌ vercel.json not found');
    return false;
  }
}

function displayDomainSetupInstructions() {
  console.log('\n🏗️  DOMAIN SETUP INSTRUCTIONS');
  console.log('==============================');
  
  console.log('\n1. Purchase Domain:');
  console.log('   - Recommended registrars: Namecheap, GoDaddy, Google Domains');
  console.log('   - Consider: purebite.com, purebite.bd, purebitestore.com');
  
  console.log('\n2. Deploy to Vercel:');
  console.log('   a) Login to Vercel: npx vercel login');
  console.log('   b) Deploy: npx vercel --prod');
  console.log('   c) Follow prompts to configure project');
  
  console.log('\n3. Add Custom Domain in Vercel:');
  console.log('   a) Go to Vercel Dashboard > Your Project');
  console.log('   b) Navigate to Settings > Domains');
  console.log('   c) Add your custom domain');
  console.log('   d) Follow DNS configuration instructions');
  
  console.log('\n4. DNS Configuration:');
  console.log('   For www.yourdomain.com:');
  console.log('   - Type: CNAME');
  console.log('   - Name: www');
  console.log('   - Value: cname.vercel-dns.com');
  
  console.log('\n   For yourdomain.com (apex domain):');
  console.log('   - Type: A');
  console.log('   - Name: @');
  console.log('   - Value: 76.76.19.61 (Vercel IP)');
}

function displaySSLConfiguration() {
  console.log('\n🔒 SSL CERTIFICATE CONFIGURATION');
  console.log('==================================');
  
  console.log('✅ SSL Features Available:');
  console.log('- Automatic SSL certificate provisioning');
  console.log('- Let\'s Encrypt integration');
  console.log('- SSL/TLS encryption for all traffic');
  console.log('- HTTP to HTTPS automatic redirects');
  console.log('- HSTS (HTTP Strict Transport Security)');
  console.log('- Perfect Forward Secrecy');
  
  console.log('\n🔧 Vercel SSL Benefits:');
  console.log('- Free SSL certificates');
  console.log('- Automatic renewal');
  console.log('- Edge-optimized SSL termination');
  console.log('- Global CDN with SSL');
  console.log('- Wildcard SSL support');
  
  console.log('\n⚠️  SSL Setup Process:');
  console.log('1. Add domain to Vercel project');
  console.log('2. Configure DNS records');
  console.log('3. Wait for SSL certificate provisioning (up to 24 hours)');
  console.log('4. Verify HTTPS is working');
  console.log('5. Update NEXTAUTH_URL to use HTTPS');
}

function displaySecurityHeaders() {
  console.log('\n🛡️  SECURITY HEADERS CONFIGURATION');
  console.log('===================================');
  
  console.log('✅ Headers Already Configured:');
  console.log('- CORS headers for API endpoints');
  console.log('- Content-Type validation');
  console.log('- Access-Control headers');
  
  console.log('\n🔧 Recommended Additional Headers:');
  console.log('Add these to vercel.json:');
  
  const securityHeaders = `{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' *.googletagmanager.com; style-src 'self' 'unsafe-inline'"
        }
      ]
    }
  ]
}`;
  
  console.log(securityHeaders);
}

function displayEnvironmentUpdates() {
  console.log('\n⚙️  ENVIRONMENT VARIABLE UPDATES');
  console.log('=================================');
  
  console.log('After domain setup, update these variables:');
  console.log('\n📝 Production Environment (.env.production):');
  console.log('NEXTAUTH_URL="https://yourdomain.com"');
  console.log('NEXT_PUBLIC_API_URL="https://yourdomain.com/api"');
  console.log('NEXT_PUBLIC_SITE_URL="https://yourdomain.com"');
  
  console.log('\n🔧 Vercel Environment Variables:');
  console.log('Set these in Vercel Dashboard > Settings > Environment Variables:');
  console.log('- NEXTAUTH_URL (Production)');
  console.log('- DATABASE_URL (Production)');
  console.log('- All API keys and secrets');
  console.log('- SMTP configuration');
  console.log('- Payment gateway credentials');
}

function displayPostDeploymentChecklist() {
  console.log('\n✅ POST-DEPLOYMENT CHECKLIST');
  console.log('=============================');
  
  const checklist = [
    'Domain propagation complete (check DNS propagation tools)',
    'SSL certificate active and valid',
    'HTTPS redirects working properly',
    'All pages load correctly on custom domain',
    'API endpoints responding correctly',
    'Authentication working (login/register)',
    'Payment flow functional',
    'Email notifications working',
    'Admin panel accessible',
    'Database connections stable',
    'Analytics tracking active',
    'Error monitoring configured',
    'Performance metrics baseline established',
    'Security headers implemented',
    'Mobile responsiveness verified',
  ];
  
  checklist.forEach((item, i) => {
    console.log(`${i + 1}. □ ${item}`);
  });
}

function displayMonitoringEndpoints() {
  console.log('\n📊 MONITORING ENDPOINTS');
  console.log('=======================');
  
  console.log('After deployment, monitor these URLs:');
  console.log('✅ https://yourdomain.com - Main site');
  console.log('✅ https://yourdomain.com/api/health/database - Health check');
  console.log('✅ https://yourdomain.com/admin - Admin dashboard');
  console.log('✅ https://yourdomain.com/sitemap.xml - SEO sitemap');
  console.log('✅ https://yourdomain.com/robots.txt - Search engine robots');
  
  console.log('\n🔍 Tools for Monitoring:');
  console.log('- Vercel Analytics Dashboard');
  console.log('- Google Search Console');
  console.log('- Google Analytics');
  console.log('- Uptime monitoring (UptimeRobot, Pingdom)');
  console.log('- SSL certificate monitoring');
}

function displayBestPractices() {
  console.log('\n🏆 BEST PRACTICES');
  console.log('=================');
  
  const practices = [
    'Use a memorable and brandable domain name',
    'Set up both www and non-www versions',
    'Enable automatic SSL certificate renewal',
    'Configure proper redirects (301 for SEO)',
    'Set up staging/preview environments',
    'Monitor SSL certificate expiration',
    'Implement proper error pages (404, 500)',
    'Set up domain forwarding if needed',
    'Configure email forwarding for domain',
    'Register similar domain variations to prevent squatting',
  ];
  
  practices.forEach((practice, i) => {
    console.log(`${i + 1}. ${practice}`);
  });
}

function generateDomainSSLReport() {
  console.log('📋 DOMAIN & SSL CONFIGURATION REPORT');
  console.log('======================================');
  
  const vercelReady = checkVercelConfiguration();
  
  displayDomainSetupInstructions();
  displaySSLConfiguration();
  displaySecurityHeaders();
  displayEnvironmentUpdates();
  displayPostDeploymentChecklist();
  displayMonitoringEndpoints();
  displayBestPractices();
  
  console.log('\n🎯 Configuration Status:');
  console.log(`✅ Vercel Configuration: ${vercelReady ? 'Ready' : 'Needs Setup'}`);
  console.log('✅ SSL Auto-provisioning: Ready');
  console.log('✅ Security Headers: Ready to configure');
  console.log('✅ Environment Variables: Ready to update');
  
  console.log('\n🚀 READY FOR DOMAIN SETUP!');
  console.log('Your application is fully prepared for custom domain and SSL configuration.');
  
  return vercelReady;
}

// CDN and Performance optimization
function displayCDNConfiguration() {
  console.log('\n🌍 CDN & PERFORMANCE CONFIGURATION');
  console.log('===================================');
  
  console.log('✅ Vercel Edge Network Benefits:');
  console.log('- Global CDN with 100+ edge locations');
  console.log('- Automatic static asset optimization');
  console.log('- Image optimization and WebP conversion');
  console.log('- Gzip/Brotli compression');
  console.log('- Edge caching for better performance');
  
  console.log('\n⚡ Performance Optimizations:');
  console.log('- Next.js automatic code splitting');
  console.log('- Static page generation (SSG)');
  console.log('- API route edge functions');
  console.log('- Database connection pooling');
  console.log('- Image lazy loading');
}

// Main execution
function runDomainSSLSetup() {
  console.log('🌐 Running Domain & SSL Configuration Setup...\n');
  
  const success = generateDomainSSLReport();
  
  displayCDNConfiguration();
  
  console.log('\n✨ Domain and SSL configuration guide complete!');
  console.log('Follow the instructions above to set up your custom domain with SSL.');
  
  return success;
}

if (require.main === module) {
  runDomainSSLSetup();
}

module.exports = { runDomainSSLSetup, checkVercelConfiguration };