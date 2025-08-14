// Google Analytics Testing Utilities
// Use these functions to test Google Analytics 4 integration

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export const testGAIntegration = () => {
  if (typeof window === 'undefined') {
    console.log('GA Test: Running on server side, skipping test');
    return false;
  }

  // Check if gtag function exists
  const hasGtag = typeof window.gtag === 'function';
  console.log('GA Test: gtag function exists:', hasGtag);

  // Check if dataLayer exists
  const hasDataLayer = typeof window.dataLayer !== 'undefined';
  console.log('GA Test: dataLayer exists:', hasDataLayer);

  // Check if GA4 script is loaded
  const gaScriptLoaded = document.querySelector('script[src*="gtag/js?id=G-"]') !== null;
  console.log('GA Test: GA4 script loaded:', gaScriptLoaded);

  // Test gtag function
  if (hasGtag) {
    window.gtag('event', 'test_event', {
      custom_parameter: 'test_value',
      test_timestamp: new Date().toISOString()
    });
    console.log('GA Test: Test event sent via gtag');
  }

  return hasGtag && hasDataLayer && gaScriptLoaded;
};

// Test page view tracking
export const testPageView = (page_path: string = '/test-page') => {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
    console.log('GA Test: gtag not available for page view test');
    return;
  }

  window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-D7CKE6Z48J', {
    page_path: page_path,
    page_title: 'Test Page View',
    page_location: window.location.href
  });

  console.log('GA Test: Page view sent for:', page_path);
};

// Test ecommerce events for GA4
export const testGA4EcommerceEvent = () => {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
    console.log('GA Test: gtag not available for ecommerce test');
    return;
  }

  // Test purchase event (GA4 format)
  window.gtag('event', 'purchase', {
    transaction_id: 'test_transaction_' + Date.now(),
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
  });

  console.log('GA Test: Purchase event sent');

  // Test add_to_cart event
  window.gtag('event', 'add_to_cart', {
    currency: 'USD',
    value: 15.99,
    items: [
      {
        item_id: 'test_product_2',
        item_name: 'Test Product 2',
        category: 'Test Category',
        quantity: 1,
        price: 15.99
      }
    ]
  });

  console.log('GA Test: Add to cart event sent');
};

// Test custom events
export const testCustomEvents = () => {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
    console.log('GA Test: gtag not available for custom events test');
    return;
  }

  // Test search event
  window.gtag('event', 'search', {
    search_term: 'test search query'
  });

  // Test login event
  window.gtag('event', 'login', {
    method: 'Google'
  });

  // Test sign_up event
  window.gtag('event', 'sign_up', {
    method: 'Email'
  });

  console.log('GA Test: Custom events sent (search, login, sign_up)');
};

// Debug GA4 status
export const debugGA4 = () => {
  console.log('=== Google Analytics 4 Debug Information ===');
  console.log('GA4 ID from env:', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID);
  console.log('Current URL:', typeof window !== 'undefined' ? window.location.href : 'Server side');
  
  if (typeof window !== 'undefined') {
    console.log('gtag function:', typeof window.gtag);
    console.log('dataLayer:', window.dataLayer);
    console.log('dataLayer length:', window.dataLayer?.length || 0);
    
    // List all GA4 related scripts
    const gaScripts = Array.from(document.querySelectorAll('script'))
      .filter(script => script.src.includes('gtag/js') || script.src.includes('googletagmanager.com'))
      .map(script => script.src);
    console.log('GA4 scripts found:', gaScripts);
    
    // Check dataLayer contents
    if (window.dataLayer && window.dataLayer.length > 0) {
      console.log('Recent dataLayer entries:', window.dataLayer.slice(-5));
    }
  }
  console.log('=== End GA4 Debug ===');
};

// Run comprehensive GA4 test
export const runGA4TestSuite = () => {
  console.log('🔍 Running Google Analytics 4 Test Suite...');
  
  const integrationTest = testGAIntegration();
  console.log('✅ Integration Test:', integrationTest ? 'PASSED' : 'FAILED');
  
  testPageView('/test-suite-page');
  console.log('✅ Page View Test: SENT');
  
  testGA4EcommerceEvent();
  console.log('✅ Ecommerce Events Test: SENT');
  
  testCustomEvents();
  console.log('✅ Custom Events Test: SENT');
  
  debugGA4();
  
  console.log('🎉 GA4 Test Suite Complete!');
  return integrationTest;
};