import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || process.env.STRIPE_PUBLISHABLE_KEY;
    
    if (!key) {
      throw new Error('Stripe publishable key is not defined');
    }
    
    stripePromise = loadStripe(key);
  }
  
  return stripePromise;
};

export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const STRIPE_TEST_CARDS = {
  VISA_SUCCESS: '4242424242424242',
  VISA_DECLINED: '4000000000000002',
  MASTERCARD_SUCCESS: '5555555555554444',
  AMEX_SUCCESS: '378282246310005',
  VISA_3D_SECURE: '4000000000003220',
  INSUFFICIENT_FUNDS: '4000000000009995',
  EXPIRED_CARD: '4000000000000069',
  INCORRECT_CVC: '4000000000000127',
  PROCESSING_ERROR: '4000000000000119',
} as const;

export const SANDBOX_CONFIG = {
  testMode: true,
  webhookEndpoint: '/api/webhooks/stripe',
  successUrl: '/orders?success=true',
  cancelUrl: '/checkout?canceled=true',
} as const;