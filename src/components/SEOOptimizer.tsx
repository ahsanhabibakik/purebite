import Head from 'next/head';
import { Metadata } from 'next';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  price?: number;
  currency?: string;
  availability?: 'in_stock' | 'out_of_stock' | 'preorder';
  brand?: string;
  category?: string;
  publishedTime?: string;
  modifiedTime?: string;
  locale?: 'en' | 'bn';
  alternateLocales?: string[];
}

// Default SEO values
const DEFAULT_SEO = {
  title: 'PureBite - জৈব ও স্বাস্থ্যকর খাবারের অনলাইন শপ',
  description: 'বাংলাদেশের সবচেয়ে বিশ্বস্ত জৈব খাবারের অনলাইন শপ। তাজা ফল, সবজি, দুগ্ধজাত ও প্রাকৃতিক খাবার ঘরে বসে অর্ডার করুন। ফ্রি ডেলিভারি ও গ্যারান্টিসহ।',
  keywords: [
    'জৈব খাবার', 'অর্গানিক ফুড', 'তাজা ফল', 'সবজি', 'দুগ্ধজাত',
    'প্রাকৃতিক খাবার', 'স্বাস্থ্যকর খাবার', 'অনলাইন গ্রোসারি',
    'বাংলাদেশ', 'ঢাকা', 'হোম ডেলিভারি', 'organic food Bangladesh'
  ],
  image: '/images/purebite-logo-og.jpg',
  url: 'https://purebite.com.bd',
  siteName: 'PureBite',
  locale: 'bn_BD',
  twitterHandle: '@PureBiteBD',
  facebookAppId: 'your-facebook-app-id'
};

export function generateSEOMetadata({
  title,
  description,
  keywords = [],
  image,
  url,
  type = 'website',
  price,
  currency = 'BDT',
  availability,
  brand,
  category,
  publishedTime,
  modifiedTime,
  locale = 'bn',
  alternateLocales = []
}: SEOProps): Metadata {
  const finalTitle = title ? `${title} | PureBite` : DEFAULT_SEO.title;
  const finalDescription = description || DEFAULT_SEO.description;
  const finalKeywords = [...DEFAULT_SEO.keywords, ...keywords];
  const finalImage = image || DEFAULT_SEO.image;
  const finalUrl = url || DEFAULT_SEO.url;

  const metadata: Metadata = {
    title: finalTitle,
    description: finalDescription,
    keywords: finalKeywords.join(', '),
    
    // Open Graph
    openGraph: {
      title: finalTitle,
      description: finalDescription,
      url: finalUrl,
      siteName: DEFAULT_SEO.siteName,
      images: [
        {
          url: finalImage,
          width: 1200,
          height: 630,
          alt: finalTitle,
        }
      ],
      locale: locale === 'bn' ? 'bn_BD' : 'en_US',
      type: type as any,
    },

    // Twitter
    twitter: {
      card: 'summary_large_image',
      title: finalTitle,
      description: finalDescription,
      images: [finalImage],
      creator: DEFAULT_SEO.twitterHandle,
    },

    // Additional meta tags
    other: {
      // Facebook specific
      'fb:app_id': DEFAULT_SEO.facebookAppId,
      
      // Product specific (for e-commerce)
      ...(type === 'product' && price && {
        'product:price:amount': price.toString(),
        'product:price:currency': currency,
        'product:availability': availability || 'in_stock',
        ...(brand && { 'product:brand': brand }),
        ...(category && { 'product:category': category }),
      }),

      // Article specific
      ...(type === 'article' && {
        ...(publishedTime && { 'article:published_time': publishedTime }),
        ...(modifiedTime && { 'article:modified_time': modifiedTime }),
      }),

      // Multilingual
      ...(alternateLocales.length > 0 && {
        'alternate-locales': alternateLocales.join(',')
      }),

      // Local business (for location-based SEO)
      'business:contact_data:street_address': 'ঢাকা, বাংলাদেশ',
      'business:contact_data:locality': 'Dhaka',
      'business:contact_data:region': 'Dhaka Division',
      'business:contact_data:postal_code': '1000',
      'business:contact_data:country_name': 'Bangladesh',

      // Additional SEO tags
      'robots': 'index,follow',
      'googlebot': 'index,follow',
      'theme-color': '#16a34a', // Green theme color
      'mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'default',
      'format-detection': 'telephone=no',
    },

    // Structured data would be added separately via JSON-LD
    alternates: {
      canonical: finalUrl,
      languages: {
        'bn-BD': finalUrl,
        'en-US': finalUrl.replace('.bd', '.com'),
      }
    },

    // App links for mobile apps (if available)
    // appLinks: {
    //   ios: {
    //     app_store_id: 'your-app-store-id',
    //     url: 'purebite://product/' + productId,
    //   },
    //   android: {
    //     package: 'com.purebite.app',
    //     url: 'purebite://product/' + productId,
    //   },
    // },
  };

  return metadata;
}

// Structured Data component for rich snippets
export function StructuredData({ data }: { data: any }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data)
      }}
    />
  );
}

// Generate structured data for different page types
export const generateStructuredData = {
  // Website/Organization
  website: () => ({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "PureBite",
    "alternateName": "PureBite Bangladesh",
    "url": "https://purebite.com.bd",
    "description": DEFAULT_SEO.description,
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://purebite.com.bd/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    "sameAs": [
      "https://facebook.com/PureBiteBD",
      "https://instagram.com/PureBiteBD",
      "https://twitter.com/PureBiteBD"
    ]
  }),

  // Organization
  organization: () => ({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "PureBite",
    "url": "https://purebite.com.bd",
    "logo": "https://purebite.com.bd/images/logo.png",
    "description": "বাংলাদেশের সবচেয়ে বিশ্বস্ত জৈব খাবারের অনলাইন শপ",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "BD",
      "addressLocality": "Dhaka",
      "addressRegion": "Dhaka Division"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+880-XXX-XXXXXX",
      "contactType": "customer service",
      "availableLanguage": ["Bengali", "English"]
    }
  }),

  // Product
  product: (product: any) => ({
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": product.images,
    "brand": {
      "@type": "Brand",
      "name": product.brand || "PureBite"
    },
    "category": product.category,
    "offers": {
      "@type": "Offer",
      "price": product.salePrice || product.price,
      "priceCurrency": "BDT",
      "availability": product.inStock 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "PureBite"
      }
    },
    "aggregateRating": product.averageRating && {
      "@type": "AggregateRating",
      "ratingValue": product.averageRating,
      "reviewCount": product.reviewCount || 0,
      "bestRating": 5,
      "worstRating": 1
    }
  }),

  // Local Business
  localBusiness: () => ({
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "PureBite",
    "description": DEFAULT_SEO.description,
    "url": "https://purebite.com.bd",
    "telephone": "+880-XXX-XXXXXX",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "BD",
      "addressLocality": "Dhaka",
      "addressRegion": "Dhaka Division",
      "postalCode": "1000"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "23.8103",
      "longitude": "90.4125"
    },
    "openingHours": "Mo-Su 09:00-21:00",
    "priceRange": "৳৳",
    "servesCuisine": "Organic Food",
    "acceptsReservations": false
  }),

  // Breadcrumb
  breadcrumb: (items: Array<{name: string, url: string}>) => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  }),

  // FAQ
  faq: (faqs: Array<{question: string, answer: string}>) => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  })
};

// SEO utilities
export const seoUtils = {
  // Generate sitemap URLs
  generateSitemapUrls: (products: any[], categories: string[]) => {
    const urls = [
      { url: '/', priority: 1.0, changefreq: 'daily' },
      { url: '/shop', priority: 0.9, changefreq: 'daily' },
      { url: '/categories', priority: 0.8, changefreq: 'weekly' },
      { url: '/about', priority: 0.7, changefreq: 'monthly' },
      { url: '/contact', priority: 0.7, changefreq: 'monthly' },
    ];

    // Add category pages
    categories.forEach(category => {
      urls.push({
        url: `/categories/${encodeURIComponent(category)}`,
        priority: 0.8,
        changefreq: 'weekly'
      });
    });

    // Add product pages
    products.forEach(product => {
      urls.push({
        url: `/products/${product.id}`,
        priority: 0.6,
        changefreq: 'weekly'
      });
    });

    return urls;
  },

  // Generate robots.txt content
  generateRobotsTxt: () => `
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /auth/
Disallow: /_next/
Disallow: /private/

Sitemap: https://purebite.com.bd/sitemap.xml
  `.trim(),

  // Generate meta keywords from product/category data
  generateKeywords: (title: string, description: string, category?: string) => {
    const baseKeywords = DEFAULT_SEO.keywords;
    const extractedKeywords = [
      ...title.split(' ').filter(word => word.length > 3),
      ...description.split(' ').filter(word => word.length > 4),
      ...(category ? [category] : [])
    ];
    
    return [...new Set([...baseKeywords, ...extractedKeywords])];
  }
};