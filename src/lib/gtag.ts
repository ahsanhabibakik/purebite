declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-D7CKE6Z48J';

export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
};

export const event = (action: string, parameters: any = {}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, parameters);
  }
};

// Ecommerce events
export const trackPurchase = (transactionId: string, value: number, currency: string = 'USD', items: any[] = []) => {
  event('purchase', {
    transaction_id: transactionId,
    value,
    currency,
    items,
  });
};

export const trackAddToCart = (currency: string, value: number, items: any[]) => {
  event('add_to_cart', {
    currency,
    value,
    items,
  });
};

export const trackRemoveFromCart = (currency: string, value: number, items: any[]) => {
  event('remove_from_cart', {
    currency,
    value,
    items,
  });
};

export const trackViewItem = (currency: string, value: number, items: any[]) => {
  event('view_item', {
    currency,
    value,
    items,
  });
};

export const trackSearch = (searchTerm: string) => {
  event('search', {
    search_term: searchTerm,
  });
};

export const trackSignUp = (method: string) => {
  event('sign_up', {
    method,
  });
};

export const trackLogin = (method: string) => {
  event('login', {
    method,
  });
};

export const trackBeginCheckout = (currency: string, value: number, items: any[]) => {
  event('begin_checkout', {
    currency,
    value,
    items,
  });
};

export const trackAddPaymentInfo = (currency: string, value: number, paymentType: string) => {
  event('add_payment_info', {
    currency,
    value,
    payment_type: paymentType,
  });
};

export const trackAddShippingInfo = (currency: string, value: number, shippingTier: string) => {
  event('add_shipping_info', {
    currency,
    value,
    shipping_tier: shippingTier,
  });
};