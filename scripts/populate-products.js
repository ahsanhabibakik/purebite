#!/usr/bin/env node

/**
 * Sample Products Population Script for PureBite E-commerce
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Sample product data with Bengali and English names
const sampleProducts = [
  {
    name: 'খেজুর বাদাম হালুয়া',
    nameEn: 'Date Almond Halwa',
    description: 'প্রাকৃতিক খেজুর এবং কাজু বাদাম দিয়ে তৈরি স্বাস্থ্যকর হালুয়া। চিনি ছাড়া প্রস্তুত।',
    descriptionEn: 'Healthy halwa made with natural dates and cashew nuts. Prepared without sugar.',
    price: 250,
    originalPrice: 300,
    category: 'SWEETS',
    images: ['/placeholder-product.jpg'],
    inStock: true,
    stockQuantity: 50,
    weight: 500,
    unit: 'গ্রাম',
    nutritionInfo: {
      calories: 180,
      protein: 4,
      carbs: 25,
      fat: 8,
      fiber: 3
    },
    tags: ['organic', 'sugar-free', 'healthy', 'traditional'],
    featured: true,
    metaTitle: 'খেজুর বাদাম হালুয়া - চিনি ছাড়া স্বাস্থ্যকর মিষ্টি',
    metaDescription: 'প্রাকৃতিক খেজুর এবং কাজু বাদাম দিয়ে তৈরি স্বাস্থ্যকর হালুয়া। চিনি ছাড়া প্রস্তুত।'
  },
  {
    name: 'তিল বীজের লাড্ডু',
    nameEn: 'Sesame Seed Laddu',
    description: 'কাঁচা তিল এবং গুড় দিয়ে তৈরি পুষ্টিকর লাড্ডু। শীতকালীন বিশেষ খাবার।',
    descriptionEn: 'Nutritious laddu made with raw sesame seeds and jaggery. Special winter treat.',
    price: 180,
    originalPrice: 220,
    category: 'SWEETS',
    images: ['/placeholder-product.jpg'],
    inStock: true,
    stockQuantity: 40,
    weight: 250,
    unit: 'গ্রাম',
    nutritionInfo: {
      calories: 220,
      protein: 6,
      carbs: 18,
      fat: 15,
      fiber: 4
    },
    tags: ['winter-special', 'energy-booster', 'calcium-rich'],
    featured: true,
    metaTitle: 'তিল বীজের লাড্ডু - শীতকালীন পুষ্টিকর মিষ্টি',
    metaDescription: 'কাঁচা তিল এবং গুড় দিয়ে তৈরি পুষ্টিকর লাড্ডু। শীতকালীন বিশেষ খাবার।'
  },
  {
    name: 'কাজু বাদামের বার্ফি',
    nameEn: 'Cashew Almond Barfi',
    description: 'প্রিমিয়াম কাজু ও বাদাম দিয়ে তৈরি মুখরোচক বার্ফি। ঘরে তৈরি।',
    descriptionEn: 'Delicious barfi made with premium cashews and almonds. Homemade.',
    price: 350,
    originalPrice: 400,
    category: 'SWEETS',
    images: ['/placeholder-product.jpg'],
    inStock: true,
    stockQuantity: 30,
    weight: 500,
    unit: 'গ্রাম',
    nutritionInfo: {
      calories: 200,
      protein: 5,
      carbs: 20,
      fat: 12,
      fiber: 2
    },
    tags: ['premium', 'festive', 'homemade'],
    featured: false,
    metaTitle: 'কাজু বাদামের বার্ফি - প্রিমিয়াম মিষ্টি',
    metaDescription: 'প্রিমিয়াম কাজু ও বাদাম দিয়ে তৈরি মুখরোচক বার্ফি। ঘরে তৈরি।'
  },
  {
    name: 'মধু মিশ্রিত গ্রানোলা',
    nameEn: 'Honey Mixed Granola',
    description: 'ওট, বাদাম, শুকনো ফল এবং খাঁটি মধু দিয়ে তৈরি স্বাস্থ্যকর গ্রানোলা।',
    descriptionEn: 'Healthy granola made with oats, nuts, dried fruits and pure honey.',
    price: 450,
    originalPrice: 500,
    category: 'SNACKS',
    images: ['/placeholder-product.jpg'],
    inStock: true,
    stockQuantity: 25,
    weight: 400,
    unit: 'গ্রাম',
    nutritionInfo: {
      calories: 150,
      protein: 4,
      carbs: 22,
      fat: 6,
      fiber: 5
    },
    tags: ['breakfast', 'fiber-rich', 'energy'],
    featured: true,
    metaTitle: 'মধু মিশ্রিত গ্রানোলা - স্বাস্থ্যকর নাস্তা',
    metaDescription: 'ওট, বাদাম, শুকনো ফল এবং খাঁটি মধু দিয়ে তৈরি স্বাস্থ্যকর গ্রানোলা।'
  },
  {
    name: 'খাঁটি ঘি',
    nameEn: 'Pure Ghee',
    description: 'দেশি গরুর দুধ থেকে তৈরি খাঁটি ঘি। কোন কৃত্রিম উপাদান নেই।',
    descriptionEn: 'Pure ghee made from local cow milk. No artificial ingredients.',
    price: 600,
    originalPrice: 650,
    category: 'DAIRY',
    images: ['/placeholder-product.jpg'],
    inStock: true,
    stockQuantity: 20,
    weight: 500,
    unit: 'মিলি',
    nutritionInfo: {
      calories: 900,
      protein: 0,
      carbs: 0,
      fat: 100,
      fiber: 0
    },
    tags: ['pure', 'traditional', 'cow-milk'],
    featured: false,
    metaTitle: 'খাঁটি ঘি - দেশি গরুর দুধের ঘি',
    metaDescription: 'দেশি গরুর দুধ থেকে তৈরি খাঁটি ঘি। কোন কৃত্রিম উপাদান নেই।'
  },
  {
    name: 'মিক্সড নাট মিক্স',
    nameEn: 'Mixed Nuts',
    description: 'বাদাম, কাজু, পেস্তা এবং আখরোটের মিশ্রণ। প্রাকৃতিকভাবে ভাজা।',
    descriptionEn: 'Mix of almonds, cashews, pistachios and walnuts. Naturally roasted.',
    price: 380,
    originalPrice: 420,
    category: 'NUTS',
    images: ['/placeholder-product.jpg'],
    inStock: true,
    stockQuantity: 35,
    weight: 250,
    unit: 'গ্রাম',
    nutritionInfo: {
      calories: 280,
      protein: 10,
      carbs: 8,
      fat: 25,
      fiber: 4
    },
    tags: ['protein-rich', 'brain-food', 'healthy-snack'],
    featured: true,
    metaTitle: 'মিক্সড নাট মিক্স - স্বাস্থ্যকর বাদাম',
    metaDescription: 'বাদাম, কাজু, পেস্তা এবং আখরোটের মিশ্রণ। প্রাকৃতিকভাবে ভাজা।'
  },
  {
    name: 'খেজুর গুড়',
    nameEn: 'Date Palm Jaggery',
    description: 'খেজুর গাছের রস থেকে তৈরি খাঁটি গুড়। চিনির প্রাকৃতিক বিকল্প।',
    descriptionEn: 'Pure jaggery made from date palm sap. Natural alternative to sugar.',
    price: 120,
    originalPrice: 150,
    category: 'SWEETENERS',
    images: ['/placeholder-product.jpg'],
    inStock: true,
    stockQuantity: 60,
    weight: 500,
    unit: 'গ্রাম',
    nutritionInfo: {
      calories: 383,
      protein: 1,
      carbs: 98,
      fat: 0,
      fiber: 0
    },
    tags: ['natural-sweetener', 'winter-special', 'iron-rich'],
    featured: false,
    metaTitle: 'খেজুর গুড় - প্রাকৃতিক মিষ্টি',
    metaDescription: 'খেজুর গাছের রস থেকে তৈরি খাঁটি গুড়। চিনির প্রাকৃতিক বিকল্প।'
  },
  {
    name: 'কালো তিলের তেল',
    nameEn: 'Black Sesame Oil',
    description: 'কাঁচা কালো তিল থেকে তৈরি খাঁটি তেল। স্বাস্থ্যের জন্য অত্যন্ত উপকারী।',
    descriptionEn: 'Pure oil made from raw black sesame seeds. Extremely beneficial for health.',
    price: 280,
    originalPrice: 320,
    category: 'OILS',
    images: ['/placeholder-product.jpg'],
    inStock: true,
    stockQuantity: 15,
    weight: 250,
    unit: 'মিলি',
    nutritionInfo: {
      calories: 884,
      protein: 0,
      carbs: 0,
      fat: 100,
      fiber: 0
    },
    tags: ['cold-pressed', 'medicinal', 'antioxidant'],
    featured: false,
    metaTitle: 'কালো তিলের তেল - স্বাস্থ্যকর তেল',
    metaDescription: 'কাঁচা কালো তিল থেকে তৈরি খাঁটি তেল। স্বাস্থ্যের জন্য অত্যন্ত উপকারী।'
  }
];

async function populateProducts() {
  try {
    console.log('🌱 Populating sample products...');
    
    // Check if products already exist
    const existingProducts = await prisma.product.count();
    console.log(`📊 Current products in database: ${existingProducts}`);
    
    if (existingProducts > 0) {
      console.log('⚠️  Products already exist. Skipping population.');
      console.log('💡 To reset products, delete them from admin panel first.');
      return;
    }
    
    // Add sample products
    for (const productData of sampleProducts) {
      const product = await prisma.product.create({
        data: {
          name: productData.name,
          description: productData.description,
          price: productData.price,
          salePrice: productData.originalPrice !== productData.price ? productData.originalPrice : null,
          image: productData.images[0], // Main image
          images: productData.images,
          category: productData.category,
          tags: productData.tags,
          inStock: productData.inStock,
          stockCount: productData.stockQuantity,
        }
      });
      console.log(`✅ Created product: ${product.name}`);
    }
    
    console.log(`🎉 Successfully added ${sampleProducts.length} sample products!`);
    
    // Display summary
    const categories = [...new Set(sampleProducts.map(p => p.category))];
    console.log('\n📋 Product Categories:');
    for (const category of categories) {
      const count = sampleProducts.filter(p => p.category === category).length;
      console.log(`  - ${category}: ${count} products`);
    }
    
    console.log('\n💰 Price Range:');
    const prices = sampleProducts.map(p => p.price);
    console.log(`  - Min: ৳${Math.min(...prices)}`);
    console.log(`  - Max: ৳${Math.max(...prices)}`);
    console.log(`  - Average: ৳${Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)}`);
    
    console.log('\n⭐ Featured Products:');
    const featured = sampleProducts.filter(p => p.featured);
    featured.forEach(p => console.log(`  - ${p.name} (৳${p.price})`));
    
  } catch (error) {
    console.error('❌ Error populating products:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  populateProducts();
}

module.exports = { populateProducts, sampleProducts };