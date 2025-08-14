"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { categories, products } from "@/data/products";

export default function CategoriesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          পণ্যের ক্যাটাগরি
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          আমাদের বিশেষভাবে নির্বাচিত স্বাস্থ্যকর খাবারের বিভিন্ন ক্যাটাগরি থেকে পছন্দের পণ্য খুঁজে নিন
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-12">
        {categories.map((category) => {
          const categoryProducts = products.filter(p => p.category === category.id);
          const featuredProducts = categoryProducts.filter(p => p.featured).slice(0, 3);
          
          return (
            <div
              key={category.id}
              className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-lg"
            >
              {/* Category Header */}
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={category.image || "/placeholder-category.jpg"}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <div className="text-center text-white">
                    <h2 className="text-2xl font-bold mb-2">{category.name}</h2>
                    <p className="text-sm opacity-90">{categoryProducts.length} টি পণ্য</p>
                  </div>
                </div>
              </div>

              {/* Category Content */}
              <div className="p-6">
                <p className="text-gray-600 mb-4">{category.description}</p>
                
                {/* Subcategories */}
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">বিভাগসমূহ:</h4>
                  <div className="flex flex-wrap gap-2">
                    {category.subcategories?.map((sub) => (
                      <span
                        key={sub}
                        className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-800"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Featured Products Preview */}
                {featuredProducts.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-3">জনপ্রিয় পণ্য:</h4>
                    <div className="space-y-2">
                      {featuredProducts.map((product) => (
                        <Link
                          key={product.id}
                          href={`/products/${product.id}`}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded">
                            <Image
                              src={product.images[0] || "/placeholder-product.jpg"}
                              alt={product.name}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-gray-900 truncate">
                              {product.name}
                            </p>
                            <p className="text-sm text-green-600 font-semibold">
                              ৳{product.price}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* View Category Button */}
                <Button asChild className="w-full group/btn">
                  <Link href={`/shop?category=${category.id}`}>
                    সব পণ্য দেখুন
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats Section */}
      <div className="rounded-2xl bg-gradient-to-r from-green-50 to-blue-50 p-8 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {products.length}+
            </div>
            <div className="text-gray-600">মোট পণ্য</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {categories.length}
            </div>
            <div className="text-gray-600">ক্যাটাগরি</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">
              ১০০%
            </div>
            <div className="text-gray-600">প্রাকৃতিক</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">
              ২৪ঘন্টা
            </div>
            <div className="text-gray-600">ডেলিভারি</div>
          </div>
        </div>
      </div>

      {/* Special Collections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-lg border border-gray-200 p-6 text-center">
          <Package className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">নতুন পণ্য</h3>
          <p className="text-gray-600 mb-4">
            সবার আগে নতুন পণ্য দেখুন
          </p>
          <Button variant="outline" asChild>
            <Link href="/shop?sort=newest">
              দেখুন
            </Link>
          </Button>
        </div>

        <div className="rounded-lg border border-gray-200 p-6 text-center">
          <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⭐</span>
          </div>
          <h3 className="font-semibold text-lg mb-2">ফিচার্ড পণ্য</h3>
          <p className="text-gray-600 mb-4">
            আমাদের বিশেষ নির্বাচিত পণ্য
          </p>
          <Button variant="outline" asChild>
            <Link href="/shop?featured=true">
              দেখুন
            </Link>
          </Button>
        </div>

        <div className="rounded-lg border border-gray-200 p-6 text-center">
          <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔥</span>
          </div>
          <h3 className="font-semibold text-lg mb-2">অফার পণ্য</h3>
          <p className="text-gray-600 mb-4">
            বিশেষ ছাড়ে পাওয়া যাচ্ছে
          </p>
          <Button variant="outline" asChild>
            <Link href="/shop?discount=true">
              দেখুন
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}