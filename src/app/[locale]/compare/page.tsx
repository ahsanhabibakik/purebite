"use client";

import Image from "next/image";
import Link from "next/link";
import { Scale, X, ShoppingCart, Heart, Star, Check, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useComparisonStore } from "@/store/comparison";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";

export default function ComparePage() {
  const { items, removeItem, clearComparison } = useComparisonStore();
  const { addItem: addToCart, openCart } = useCartStore();
  const { addItem: addToWishlist, isInWishlist } = useWishlistStore();

  const handleAddToCart = (product: any) => {
    addToCart(product);
    openCart();
  };

  const handleWishlistToggle = (product: any) => {
    if (!isInWishlist(product.id)) {
      addToWishlist(product);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Scale className="h-12 w-12 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            তুলনা করার জন্য কোন পণ্য নেই
          </h1>
          <p className="text-gray-600 mb-8">
            বিভিন্ন পণ্যের বৈশিষ্ট্য, দাম ও গুণমান তুলনা করতে 
            পণ্য যোগ করুন (সর্বোচ্চ ৩টি)।
          </p>
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/bn/shop">
                কেনাকাটা শুরু করুন
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/bn/categories">
                ক্যাটাগরি দেখুন
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Comparison attributes to show
  const comparisonAttributes = [
    { key: 'price', label: 'দাম', type: 'price' },
    { key: 'category', label: 'ক্যাটাগরি', type: 'text' },
    { key: 'averageRating', label: 'রেটিং', type: 'rating' },
    { key: 'inStock', label: 'স্টক স্ট্যাটাস', type: 'boolean' },
    { key: 'weight', label: 'ওজন', type: 'text' },
    { key: 'unit', label: 'একক', type: 'text' },
    { key: 'origin', label: 'উৎপাদনস্থল', type: 'text' },
    { key: 'tags', label: 'ট্যাগ', type: 'array' },
  ];

  const renderAttributeValue = (product: any, attribute: any) => {
    const value = product[attribute.key];
    
    switch (attribute.type) {
      case 'price':
        return (
          <div>
            <span className="text-lg font-bold text-green-600">
              ৳{value?.toLocaleString() || 'N/A'}
            </span>
            {product.originalPrice && product.originalPrice > value && (
              <div className="text-sm text-gray-500 line-through">
                ৳{product.originalPrice.toLocaleString()}
              </div>
            )}
          </div>
        );
        
      case 'rating':
        return value ? (
          <div className="flex items-center gap-1">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(value)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {value.toFixed(1)}
            </span>
          </div>
        ) : (
          <span className="text-gray-500">রেটিং নেই</span>
        );
        
      case 'boolean':
        return value ? (
          <div className="flex items-center gap-1 text-green-600">
            <Check className="h-4 w-4" />
            <span>হ্যাঁ</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-red-600">
            <Minus className="h-4 w-4" />
            <span>না</span>
          </div>
        );
        
      case 'array':
        return value && value.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {value.slice(0, 3).map((item: string, index: number) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {item}
              </Badge>
            ))}
            {value.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{value.length - 3}
              </Badge>
            )}
          </div>
        ) : (
          <span className="text-gray-500">N/A</span>
        );
        
      default:
        return value || <span className="text-gray-500">N/A</span>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          পণ্য তুলনা ({items.length}/৩ টি পণ্য)
        </h1>
        <Button
          onClick={clearComparison}
          variant="outline"
          size="sm"
          className="text-red-600 border-red-600 hover:bg-red-50"
        >
          সব মুছুন
        </Button>
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-4 font-medium text-gray-900 min-w-[200px]">
                  বৈশিষ্ট্য
                </th>
                {items.map((product) => (
                  <th key={product.id} className="text-center p-4 min-w-[250px]">
                    <div className="relative">
                      <button
                        onClick={() => removeItem(product.id)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      
                      <Link href={`/bn/products/${product.id}`}>
                        <div className="relative w-32 h-32 mx-auto mb-3 overflow-hidden rounded-lg">
                          <Image
                            src={product.images?.[0] || product.image || "/placeholder-product.jpg"}
                            alt={product.name}
                            fill
                            className="object-cover hover:scale-105 transition-transform"
                            sizes="128px"
                          />
                        </div>
                      </Link>
                      
                      <Link 
                        href={`/bn/products/${product.id}`}
                        className="font-medium text-gray-900 hover:text-green-600 line-clamp-2"
                      >
                        {product.name}
                      </Link>
                    </div>
                  </th>
                ))}
                
                {/* Empty slots */}
                {[...Array(3 - items.length)].map((_, index) => (
                  <th key={`empty-${index}`} className="text-center p-4 min-w-[250px]">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                      <Scale className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">
                        তুলনা করতে পণ্য যোগ করুন
                      </p>
                      <Button asChild size="sm" className="mt-2">
                        <Link href="/bn/shop">পণ্য খুঁজুন</Link>
                      </Button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            
            <tbody>
              {/* Action buttons row */}
              <tr className="border-b bg-gray-50">
                <td className="p-4 font-medium text-gray-900">
                  অ্যাকশন
                </td>
                {items.map((product) => (
                  <td key={product.id} className="p-4 text-center">
                    <div className="space-y-2">
                      <Button
                        onClick={() => handleAddToCart(product)}
                        disabled={!product.inStock}
                        size="sm"
                        className="w-full"
                      >
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        কার্টে যোগ করুন
                      </Button>
                      
                      <Button
                        onClick={() => handleWishlistToggle(product)}
                        variant="outline"
                        size="sm"
                        className={`w-full ${
                          isInWishlist(product.id) 
                            ? 'text-red-500 border-red-500' 
                            : ''
                        }`}
                      >
                        <Heart className={`h-4 w-4 mr-1 ${
                          isInWishlist(product.id) ? 'fill-current' : ''
                        }`} />
                        {isInWishlist(product.id) ? 'পছন্দের তালিকায় আছে' : 'পছন্দের তালিকায় যোগ করুন'}
                      </Button>
                    </div>
                  </td>
                ))}
                
                {/* Empty action slots */}
                {[...Array(3 - items.length)].map((_, index) => (
                  <td key={`empty-action-${index}`} className="p-4 text-center">
                    <div className="text-gray-400">-</div>
                  </td>
                ))}
              </tr>
              
              {/* Comparison attributes */}
              {comparisonAttributes.map((attribute) => (
                <tr key={attribute.key} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900">
                    {attribute.label}
                  </td>
                  {items.map((product) => (
                    <td key={product.id} className="p-4 text-center">
                      {renderAttributeValue(product, attribute)}
                    </td>
                  ))}
                  
                  {/* Empty attribute slots */}
                  {[...Array(3 - items.length)].map((_, index) => (
                    <td key={`empty-attr-${index}`} className="p-4 text-center">
                      <div className="text-gray-400">-</div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-3">
          তুলনা করার টিপস
        </h2>
        <ul className="space-y-2 text-blue-800">
          <li>• একসাথে সর্বোচ্চ ৩টি পণ্য তুলনা করতে পারবেন</li>
          <li>• একই ধরনের পণ্য তুলনা করলে বেশি কার্যকর হবে</li>
          <li>• দাম, গুণমান ও বৈশিষ্ট্য বিবেচনা করে সিদ্ধান্ত নিন</li>
          <li>• পণ্যের রিভিউ ও রেটিং দেখতে পণ্যের পেইজে যান</li>
        </ul>
      </div>

      {/* Suggested Products */}
      <div className="mt-12 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          আরও পণ্য তুলনা করুন
        </h2>
        <p className="text-gray-600 mb-6">
          অন্যান্য পণ্য দেখুন এবং তুলনা করুন
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link href="/bn/shop">
              সব পণ্য দেখুন
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/bn/categories">
              ক্যাটাগরি ব্রাউজ করুন
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}