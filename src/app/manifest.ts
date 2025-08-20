import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'PureBite - জৈব ও স্বাস্থ্যকর খাবারের অনলাইন শপ',
    short_name: 'PureBite',
    description: 'বাংলাদেশের সবচেয়ে বিশ্বস্ত জৈব খাবারের অনলাইন শপ। তাজা ফল, সবজি, দুগ্ধজাত ও প্রাকৃতিক খাবার ঘরে বসে অর্ডার করুন।',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#16a34a',
    orientation: 'portrait-primary',
    scope: '/',
    lang: 'bn',
    categories: ['food', 'shopping', 'lifestyle'],
    shortcuts: [
      {
        name: 'পণ্য খুঁজুন',
        short_name: 'খুঁজুন',
        description: 'পণ্য খুঁজুন এবং অর্ডার করুন',
        url: '/shop',
        icons: [{ src: '/icons/search-192x192.png', sizes: '192x192' }]
      },
      {
        name: 'কার্ট',
        short_name: 'কার্ট',
        description: 'আপনার শপিং কার্ট দেখুন',
        url: '/cart',
        icons: [{ src: '/icons/cart-192x192.png', sizes: '192x192' }]
      },
      {
        name: 'অর্ডার',
        short_name: 'অর্ডার',
        description: 'আপনার অর্ডার ট্র্যাক করুন',
        url: '/orders',
        icons: [{ src: '/icons/orders-192x192.png', sizes: '192x192' }]
      },
      {
        name: 'প্রিয় তালিকা',
        short_name: 'প্রিয়',
        description: 'আপনার প্রিয় পণ্য দেখুন',
        url: '/wishlist',
        icons: [{ src: '/icons/wishlist-192x192.png', sizes: '192x192' }]
      }
    ],
    icons: [
      {
        src: '/icons/icon-72x72.png',
        sizes: '72x72',
        type: 'image/png',
        purpose: 'maskable any'
      },
      {
        src: '/icons/icon-96x96.png',
        sizes: '96x96',
        type: 'image/png',
        purpose: 'maskable any'
      },
      {
        src: '/icons/icon-128x128.png',
        sizes: '128x128',
        type: 'image/png',
        purpose: 'maskable any'
      },
      {
        src: '/icons/icon-144x144.png',
        sizes: '144x144',
        type: 'image/png',
        purpose: 'maskable any'
      },
      {
        src: '/icons/icon-152x152.png',
        sizes: '152x152',
        type: 'image/png',
        purpose: 'maskable any'
      },
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable any'
      },
      {
        src: '/icons/icon-384x384.png',
        sizes: '384x384',
        type: 'image/png',
        purpose: 'maskable any'
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable any'
      }
    ],
    screenshots: [
      {
        src: '/screenshots/mobile-home.png',
        sizes: '375x812',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'হোমপেজ - মোবাইল ভিউ'
      },
      {
        src: '/screenshots/mobile-shop.png',
        sizes: '375x812',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'পণ্য তালিকা - মোবাইল ভিউ'
      },
      {
        src: '/screenshots/desktop-home.png',
        sizes: '1280x720',
        type: 'image/png',
        form_factor: 'wide',
        label: 'হোমপেজ - ডেস্কটপ ভিউ'
      },
      {
        src: '/screenshots/desktop-shop.png',
        sizes: '1280x720',
        type: 'image/png',
        form_factor: 'wide',
        label: 'পণ্য তালিকা - ডেস্কটপ ভিউ'
      }
    ],
    related_applications: [
      {
        platform: 'play',
        url: 'https://play.google.com/store/apps/details?id=com.purebite.app',
        id: 'com.purebite.app'
      },
      {
        platform: 'itunes',
        url: 'https://apps.apple.com/app/purebite/id123456789'
      }
    ],
    prefer_related_applications: false,
    edge_side_panel: {
      preferred_width: 480
    }
  };
}