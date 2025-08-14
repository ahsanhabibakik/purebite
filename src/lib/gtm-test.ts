// GTM Testing Utilities
// Use these functions to test Google Tag Manager integration

declare global {
  interface Window {
    dataLayer: any[];
  }
}

export const testGTMIntegration = () => {
  if (typeof window === 'undefined') {
    console.log('GTM Test: Running on server side, skipping test');
    return false;
  }

  // Check if dataLayer exists
  const hasDataLayer = typeof window.dataLayer !== 'undefined';
  console.log('GTM Test: dataLayer exists:', hasDataLayer);

  // Check if GTM container is loaded
  const gtmLoaded = document.querySelector('script[src*="googletagmanager.com/gtm.js"]') !== null;
  console.log('GTM Test: GTM script loaded:', gtmLoaded);

  // Check for noscript iframe
  const hasNoScript = document.querySelector('iframe[src*="googletagmanager.com/ns.html"]') !== null;
  console.log('GTM Test: NoScript iframe present:', hasNoScript);

  // Test dataLayer push
  if (hasDataLayer) {
    window.dataLayer.push({
      event: 'test_event',
      custom_parameter: 'test_value',
      timestamp: new Date().toISOString()
    });
    console.log('GTM Test: Test event pushed to dataLayer');
  }

  return hasDataLayer && (gtmLoaded || hasNoScript);
};

// Test ecommerce events
export const testEcommerceEvent = () => {
  if (typeof window === 'undefined' || !window.dataLayer) {
    console.log('GTM Test: dataLayer not available');
    return;
  }

  // Test purchase event
  window.dataLayer.push({
    event: 'purchase',
    ecommerce: {
      transaction_id: 'test_' + Date.now(),
      value: 25.99,
      currency: 'USD',
      items: [
        {
          item_id: 'test_product_1',
          item_name: 'Test Product',
          category: 'Test Category',
          quantity: 1,
          price: 25.99
        }
      ]
    }
  });

  console.log('GTM Test: Ecommerce test event sent');
};

// Debug GTM status
export const debugGTM = () => {
  console.log('=== GTM Debug Information ===');
  console.log('GTM ID from env:', process.env.NEXT_PUBLIC_GTM_ID);
  console.log('Current URL:', typeof window !== 'undefined' ? window.location.href : 'Server side');
  
  if (typeof window !== 'undefined') {
    console.log('dataLayer:', window.dataLayer);
    console.log('dataLayer length:', window.dataLayer?.length || 0);
    
    // List all GTM related scripts
    const gtmScripts = Array.from(document.querySelectorAll('script'))
      .filter(script => script.src.includes('googletagmanager.com'))
      .map(script => script.src);
    console.log('GTM scripts found:', gtmScripts);
    
    // Check for GTM containers
    const gtmContainers = Array.from(document.querySelectorAll('[id*="GTM-"]'));
    console.log('GTM containers:', gtmContainers.length);
  }
  console.log('=== End GTM Debug ===');
};