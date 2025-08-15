import { Product, ProductCategory } from "@/types/product";

export const products: Product[] = [
  // Homemade Healthy Snacks & Sweets
  {
    id: "1",
    name: "খেজুর বাদাম হালুয়া",
    description: "স্বাস্থ্যকর খেজুর ও বাদাম দিয়ে তৈরি পুষ্টিকর হালুয়া। কোন চিনি বা কৃত্রিম মিষ্টি নেই।",
    price: 350,
    originalPrice: 400,
    discount: 12,
    images: ["https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500", "https://images.unsplash.com/photo-1571197119382-5d52d10e5ed8?w=500"],
    category: ProductCategory.HOMEMADE_SNACKS,
    subcategory: "হালুয়া ও মিষ্টি",
    inStock: true,
    stockQuantity: 25,
    unit: "প্যাকেট (৫০০গ্রাম)",
    weight: 500,
    tags: ["হালুয়া", "খেজুর", "বাদাম", "চিনিমুক্ত", "হোমমেড"],
    featured: true,
    nutritionInfo: {
      calories: 450,
      protein: 12,
      carbs: 35,
      fat: 28,
      fiber: 8,
      sugar: 25
    },
    ingredients: ["খেজুর", "আমন্ড", "কাজু", "দেশি ঘি", "এলাচ"],
    origin: "ঢাকা",
    expiryDate: "৭ দিন",
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: "2", 
    name: "পুষ্টিকর তিলের লাড্ডু",
    description: "খাঁটি তিল ও গুড় দিয়ে তৈরি পুষ্টিকর লাড্ডু। শীতকালীন বিশেষ খাবার।",
    price: 250,
    images: ["https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500", "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=80"],
    category: ProductCategory.HOMEMADE_SNACKS,
    subcategory: "লাড্ডু ও নাড়ু",
    inStock: true,
    stockQuantity: 40,
    unit: "প্যাকেট (৩০০গ্রাম)",
    weight: 300,
    tags: ["লাড্ডু", "তিল", "গুড়", "শীতকালীন", "পুষ্টিকর"],
    featured: false,
    nutritionInfo: {
      calories: 380,
      protein: 8,
      carbs: 45,
      fat: 18,
      fiber: 6
    },
    ingredients: ["তিল", "খেজুর গুড়", "নারিকেল কুঁচি", "এলাচ"],
    origin: "যশোর",
    expiryDate: "১৫ দিন",
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: "3",
    name: "এনার্জি বল (ডেট বাইটস)",
    description: "খেজুর, বাদাম ও শুকনা ফলের সমন্বয়ে তৈরি প্রাকৃতিক এনার্জি বল।",
    price: 450,
    images: ["https://images.unsplash.com/photo-1571197119382-5d52d10e5ed8?w=500", "https://images.unsplash.com/photo-1571197119382-5d52d10e5ed8?w=500&auto=format&fit=crop&q=80"],
    category: ProductCategory.HOMEMADE_SNACKS,
    subcategory: "এনার্জি স্ন্যাক্স",
    inStock: true,
    stockQuantity: 30,
    unit: "প্যাকেট (২০টি)",
    weight: 400,
    tags: ["এনার্জি বল", "খেজুর", "বাদাম", "প্রাকৃতিক", "স্বাস্থ্যকর"],
    featured: true,
    nutritionInfo: {
      calories: 520,
      protein: 15,
      carbs: 40,
      fat: 32,
      fiber: 10
    },
    ingredients: ["খেজুর", "আমন্ড", "আখরোট", "কিশমিশ", "নারিকেল", "চিয়া সিড"],
    origin: "ঢাকা",
    expiryDate: "১০ দিন",
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },

  // Dry Foods
  {
    id: "4",
    name: "প্রিমিয়াম কাজু বাদাম",
    description: "উন্নতমানের কাজু বাদাম। কাঁচা বা ভাজা দুইভাবেই পাওয়া যায়।",
    price: 1200,
    images: ["https://images.unsplash.com/photo-1568096889942-6eedde686635?w=500", "https://images.unsplash.com/photo-1568096889942-6eedde686635?w=500&auto=format&fit=crop&q=80"],
    category: ProductCategory.DRY_FOODS,
    subcategory: "বাদাম",
    inStock: true,
    stockQuantity: 50,
    unit: "কেজি",
    weight: 1000,
    tags: ["কাজু", "বাদাম", "প্রিমিয়াম", "কাঁচা", "ভাজা"],
    featured: true,
    nutritionInfo: {
      calories: 553,
      protein: 18,
      carbs: 30,
      fat: 44,
      fiber: 3
    },
    origin: "ভিয়েতনাম",
    expiryDate: "৬ মাস",
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: "5",
    name: "খাঁটি খেজুর গুড়",
    description: "১০০% খাঁটি খেজুর গুড়। কোন মিলাবত নেই। প্রাকৃতিক মিষ্টতা।",
    price: 180,
    images: ["https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500", "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=80"],
    category: ProductCategory.DRY_FOODS,
    subcategory: "গুড় ও মধু",
    inStock: true,
    stockQuantity: 100,
    unit: "কেজি",
    weight: 1000,
    tags: ["খেজুর গুড়", "খাঁটি", "প্রাকৃতিক", "চিনির বিকল্প"],
    featured: false,
    nutritionInfo: {
      calories: 383,
      protein: 2,
      carbs: 95,
      fat: 0,
      fiber: 2
    },
    origin: "যশোর",
    expiryDate: "১ বছর",
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },

  // Fresh Products  
  {
    id: "6",
    name: "তাজা ইলিশ মাছ",
    description: "পদ্মার তাজা ইলিশ মাছ। প্রতিদিন সকালে আনা হয়।",
    price: 1800,
    images: ["https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=500", "https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=500&auto=format&fit=crop&q=80"],
    category: ProductCategory.FRESH_PRODUCTS,
    subcategory: "নদীর মাছ",
    inStock: true,
    stockQuantity: 15,
    unit: "কেজি",
    weight: 1000,
    tags: ["ইলিশ", "তাজা মাছ", "পদ্মার", "নদীর মাছ"],
    featured: true,
    origin: "পদ্মা নদী",
    expiryDate: "১ দিন",
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: "7",
    name: "দেশি মুরগির ডিম",
    description: "গ্রামের দেশি মুরগির তাজা ডিম। কোন হরমোন বা কেমিক্যাল নেই।",
    price: 15,
    images: ["https://images.unsplash.com/photo-1518569656558-1f25e69d93d7?w=500", "https://images.unsplash.com/photo-1518569656558-1f25e69d93d7?w=500&auto=format&fit=crop&q=80"],
    category: ProductCategory.FRESH_PRODUCTS,
    subcategory: "ডিম ও দুগ্ধ",
    inStock: true,
    stockQuantity: 200,
    unit: "পিস",
    weight: 60,
    tags: ["দেশি ডিম", "তাজা", "গ্রামের", "প্রাকৃতিক"],
    featured: false,
    origin: "গাজীপুর",
    expiryDate: "৫ দিন",
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },

  // Gift Combos
  {
    id: "8",
    name: "হেলদি স্ন্যাক্স কম্বো",
    description: "বিভিন্ন ধরনের স্বাস্থ্যকর স্ন্যাক্সের কম্বো প্যাকেজ। উপহার দেওয়ার জন্য আদর্শ।",
    price: 850,
    originalPrice: 1000,
    discount: 15,
    images: ["https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500", "https://images.unsplash.com/photo-1571197119382-5d52d10e5ed8?w=500"],
    category: ProductCategory.GIFT_COMBOS,
    subcategory: "স্ন্যাক্স কম্বো",
    inStock: true,
    stockQuantity: 20,
    unit: "গিফট বক্স",
    weight: 800,
    tags: ["কম্বো", "গিফট", "স্বাস্থ্যকর", "স্ন্যাক্স", "উপহার"],
    featured: true,
    ingredients: ["খেজুর হালুয়া", "বাদাম মিক্স", "এনার্জি বল", "তিলের লাড্ডু"],
    origin: "ঢাকা",
    expiryDate: "৭ দিন",
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  }
];

export const categories = [
  {
    id: ProductCategory.HOMEMADE_SNACKS,
    name: "হোমমেড স্ন্যাক্স",
    description: "ঘরে তৈরি স্বাস্থ্যকর স্ন্যাক্স ও মিষ্টি",
    image: "/categories/homemade.jpg",
    subcategories: ["হালুয়া ও মিষ্টি", "লাড্ডু ও নাড়ু", "এনার্জি স্ন্যাক্স"]
  },
  {
    id: ProductCategory.DRY_FOODS,
    name: "শুকনা খাবার",
    description: "বাদাম, গুড়, মশলা ও অন্যান্য শুকনা পণ্য",
    image: "/categories/dry-foods.jpg",
    subcategories: ["বাদাম", "গুড় ও মধু", "মশলা", "ডাল ও চাল"]
  },
  {
    id: ProductCategory.FRESH_PRODUCTS,
    name: "তাজা পণ্য",
    description: "তাজা মাছ, মাংস, ডিম ও দুগ্ধজাত",
    image: "/categories/fresh.jpg",
    subcategories: ["নদীর মাছ", "সমুদ্রের মাছ", "ডিম ও দুগ্ধ", "মাংস"]
  },
  {
    id: ProductCategory.GIFT_COMBOS,
    name: "গিফট কম্বো",
    description: "বিশেষ উপহারের জন্য কম্বো প্যাকেজ",
    image: "/categories/gifts.jpg",
    subcategories: ["স্ন্যাক্স কম্বো", "ফেস্টিভাল প্যাক", "হেলদি কম্বো"]
  }
];