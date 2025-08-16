"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Grid, List, ArrowRight, Package, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from 'next-intl';

interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  productCount: number;
  subcategories?: string[];
}

export default function CategoriesPage() {
  const t = useTranslations('categories');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock categories data - replace with API call
    const mockCategories: Category[] = [
      {
        id: "homemade-snacks",
        name: "হোমমেড স্ন্যাকস ও মিষ্টি",
        description: "ঘরে তৈরি স্বাস্থ্যকর স্ন্যাকস এবং ঐতিহ্যবাহী মিষ্টি",
        image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500",
        productCount: 25,
        subcategories: ["হালুয়া", "লাড্ডু", "পিঠা", "চিপস"]
      },
      {
        id: "dry-foods",
        name: "শুকনো খাবার",
        description: "দীর্ঘস্থায়ী শুকনো খাবার ও মসলা",
        image: "https://images.unsplash.com/photo-1586049237499-4af9c4e5d6e0?w=500",
        productCount: 18,
        subcategories: ["চাল", "ডাল", "মসলা", "তেল"]
      },
      {
        id: "fresh-products",
        name: "তাজা পণ্য",
        description: "দৈনিক তাজা সবজি, ফল ও দুগ্ধজাত পণ্য",
        image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500",
        productCount: 32,
        subcategories: ["সবজি", "ফল", "দুধ", "মাছ"]
      },
      {
        id: "beverages",
        name: "পানীয়",
        description: "প্রাকৃতিক জুস, চা, কফি ও অন্যান্য পানীয়",
        image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=500",
        productCount: 15,
        subcategories: ["জুস", "চা", "কফি", "শরবত"]
      },
      {
        id: "gift-combos",
        name: "গিফট কম্বো",
        description: "উপহারের জন্য বিশেষ প্যাকেজ ও কম্বো অফার",
        image: "https://images.unsplash.com/photo-1549887534-1541e9326642?w=500",
        productCount: 8,
        subcategories: ["ঈদ কম্বো", "বিয়ে কম্বো", "জন্মদিন"]
      },
      {
        id: "seasonal",
        name: "মৌসুমী",
        description: "বিশেষ মৌসুমী খাবার ও ফল",
        image: "https://images.unsplash.com/photo-1577234286642-fc512a5f8f11?w=500",
        productCount: 12,
        subcategories: ["গ্রীষ্মকাল", "শীতকাল", "বর্ষাকাল"]
      }
    ];

    setTimeout(() => {
      setCategories(mockCategories);
      setLoading(false);
    }, 1000);
  }, []);

  const totalProducts = categories.reduce((sum, cat) => sum + cat.productCount, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          পণ্যের ক্যাটাগরি
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          আমাদের বিভিন্ন ধরনের স্বাস্থ্যকর ও তাজা পণ্যের সংগ্রহ দেখুন। 
          প্রতিটি ক্যাটাগরিতে রয়েছে সেরা মানের পণ্য।
        </p>
        {!loading && (
          <div className="mt-4 text-sm text-gray-500">
            মোট {totalProducts} টি পণ্য • {categories.length} টি ক্যাটাগরি
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="bg-green-50 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-green-900 mb-4">দ্রুত লিংক</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            href="/bn/shop?sort=newest"
            className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Star className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">নতুন পণ্য</h3>
              <p className="text-sm text-gray-600">সদ্য যোগ হওয়া পণ্য</p>
            </div>
          </Link>
          
          <Link 
            href="/bn/shop?featured=true"
            className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Package className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">ফিচার্ড পণ্য</h3>
              <p className="text-sm text-gray-600">বিশেষ নির্বাচিত পণ্য</p>
            </div>
          </Link>
          
          <Link 
            href="/bn/shop?discount=true"
            className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <ArrowRight className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">ছাড়ের পণ্য</h3>
              <p className="text-sm text-gray-600">বিশেষ ছাড়ে পাওয়া যাচ্ছে</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border p-6 animate-pulse">
              <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/bn/shop?category=${category.id}`}
              className="group bg-white rounded-lg border hover:shadow-lg transition-all duration-300"
            >
              <div className="relative aspect-video overflow-hidden rounded-t-lg">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1 text-sm font-medium text-gray-900">
                  {category.productCount} টি পণ্য
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                  {category.name}
                </h3>
                <p className="text-gray-600 mb-4">
                  {category.description}
                </p>
                
                {category.subcategories && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">উপ-ক্যাটাগরি:</p>
                    <div className="flex flex-wrap gap-1">
                      {category.subcategories.slice(0, 3).map((sub, index) => (
                        <span
                          key={index}
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                        >
                          {sub}
                        </span>
                      ))}
                      {category.subcategories.length > 3 && (
                        <span className="text-xs text-gray-500 px-2 py-1">
                          +{category.subcategories.length - 3} আরও
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {category.productCount} টি পণ্য
                  </span>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Call to Action */}
      <div className="text-center mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          কিছু খুঁজে পাচ্ছেন না?
        </h2>
        <p className="text-gray-600 mb-6">
          আমাদের সম্পূর্ণ পণ্যের সংগ্রহ দেখুন অথবা সরাসরি যোগাযোগ করুন
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link href="/bn/shop">
              সব পণ্য দেখুন
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/bn/contact">
              যোগাযোগ করুন
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}