# Payment Integration Guide - PureBite E-commerce

## Overview

This document outlines the comprehensive payment integration setup for PureBite, including SSL configuration, Stripe sandbox testing, and commerce functionality.

## 🔐 SSL & Security Configuration

### Security Headers
The application includes comprehensive security headers configured in `next.config.ts`:

- **HSTS**: Enforces HTTPS connections
- **CSP**: Content Security Policy with Stripe-specific allowances
- **X-Frame-Options**: Prevents clickjacking
- **X-Content-Type-Options**: Prevents MIME sniffing

### Environment Variables
Copy `.env.example` to `.env.local` and configure:

```env
# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret
STRIPE_SANDBOX_MODE=true

# SSL Configuration (optional for local HTTPS)
SSL_CERT_PATH=/path/to/ssl/cert.pem
SSL_KEY_PATH=/path/to/ssl/key.pem
```

## 💳 Payment Gateway Integration

### Stripe Sandbox Mode
- Automatically enabled in development environment
- Supports test card numbers for various scenarios
- Prevents actual stock deduction during testing

### Supported Payment Methods
1. **Credit/Debit Cards** (via Stripe)
2. **Cash on Delivery**
3. **Mobile Banking** (bKash, Nagad, Rocket)
4. **Bank Transfer**

### Test Card Numbers
```javascript
// Success
4242424242424242

// Declined
4000000000000002

// Insufficient Funds
4000000000009995

// Expired Card
4000000000000069
```

## 🛒 Commerce Features

### Order Management
- Order creation and tracking
- Status updates (Pending → Confirmed → Processing → Shipped → Delivered)
- Payment status tracking
- Sandbox order identification

### Database Schema Updates
Added new fields to the Order model:
- `paymentIntentId`: Stripe payment intent reference
- `currency`: Payment currency
- `isSandbox`: Sandbox mode flag

## 🧪 Testing Framework

### Payment Testing Dashboard
Access `/test-payments` to:
- Test various payment scenarios
- View test results in real-time
- Access test card references
- Monitor payment intent statuses

### API Testing Endpoint
- **URL**: `/api/test-payment`
- **Methods**: GET (info), POST (test execution)
- **Test Types**: success, declined, insufficient_funds, expired

## 🔄 Webhook Configuration

### Stripe Webhooks
Configured to handle:
- `checkout.session.completed`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `invoice.payment_succeeded`

### Webhook Security
- Signature verification using Stripe webhook secret
- Error handling and logging
- Sandbox mode detection

## 📋 Setup Instructions

### 1. Environment Setup
```bash
# Copy environment file
cp .env.example .env.local

# Install dependencies (if not already done)
npm install
# or
pnpm install
```

### 2. Database Migration
```bash
# Generate Prisma client
npm run db:generate

# Push schema changes
npm run db:push
```

### 3. Stripe Configuration
1. Create a Stripe account
2. Get test API keys from Stripe Dashboard
3. Configure webhook endpoint: `your-domain.com/api/webhooks/stripe`
4. Update environment variables

### 4. Testing
```bash
# Start development server
npm run dev

# Visit testing dashboard
http://localhost:3000/test-payments
```

## 🔧 Development Workflow

### Adding New Payment Methods
1. Update checkout form validation schema
2. Add payment method handling in checkout API
3. Update webhook handlers if needed
4. Test with sandbox mode

### Production Deployment
1. Switch to live Stripe keys
2. Set `STRIPE_SANDBOX_MODE=false`
3. Configure production webhook endpoints
4. Enable HTTPS/SSL certificates
5. Test with small real transactions

## 📊 Monitoring & Analytics

### Payment Events
All payment events are logged with:
- Timestamp
- Event type
- Success/failure status
- Sandbox mode indicator

### Error Handling
- Comprehensive error logging
- User-friendly error messages
- Webhook failure recovery

## 🚀 Advanced Features

### Multi-Currency Support
- Configurable currency in checkout
- Currency formatting utilities
- Regional payment method support

### Fraud Prevention
- Stripe Radar integration ready
- Transaction monitoring
- Risk assessment capabilities

## 📖 API Reference

### Checkout API
```javascript
POST /api/checkout
{
  "items": [...],
  "shippingAddress": {...},
  "subtotal": 100.00,
  "tax": 8.00,
  "shipping": 10.00,
  "total": 118.00
}
```

### Test Payment API
```javascript
POST /api/test-payment
{
  "testType": "success|declined|insufficient_funds|expired",
  "amount": 2000  // in cents
}
```

### Webhook API
```javascript
POST /api/webhooks/stripe
// Stripe webhook payload with signature verification
```

## 🔍 Troubleshooting

### Common Issues
1. **Webhook signature verification failed**
   - Check webhook secret in environment variables
   - Verify webhook endpoint URL

2. **Payment tests failing**
   - Ensure sandbox mode is enabled
   - Check test card numbers
   - Verify API keys

3. **SSL/HTTPS issues**
   - Use ngrok for local HTTPS testing
   - Configure proper SSL certificates for production

### Debug Mode
Enable debug logging by setting `DEBUG=true` in environment variables.

## 📞 Support

For payment integration support:
- Check Stripe documentation
- Review application logs
- Test in sandbox mode first
- Contact development team for custom payment flows

---

**Note**: Always test payment integrations thoroughly in sandbox mode before going live with real payments.