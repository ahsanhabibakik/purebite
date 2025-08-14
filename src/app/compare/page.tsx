"use client";

import { useComparisonStore } from "@/store/comparison";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import { 
  X, 
  ShoppingCart, 
  Star, 
  Scale,
  ArrowRight,
  Check,
  Minus
} from "lucide-react";
import { Product } from "@/types/product";

export default function ComparePage() {
  const { items, removeItem, clearAll, getTotalItems } = useComparisonStore();
  const { addItem } = useCartStore();
  const totalItems = getTotalItems();

  const handleAddToCart = (product: Product) => {
    addItem(product, 1);
  };

  if (totalItems === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Scale className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h1 className="text-2xl font-bold mb-4">কোন পণ্য তুলনার জন্য নেই</h1>
        <p className="text-gray-600 mb-6">
          পণ্যের তুলনা করতে প্রোডাক্ট কার্ডে &quot;তুলনা করুন&quot; বাটনে ক্লিক করুন (সর্বোচ্চ ৩টি)
        </p>
        <Button asChild>
          <Link href="/shop">শপিং করুন</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">পণ্য তুলনা</h1>
          <p className="text-gray-600">
            {totalItems}টি পণ্যের তুলনা ({3 - totalItems}টি আরও যোগ করতে পারেন)
          </p>
        </div>
        
        <Button
          variant="outline"
          onClick={clearAll}
          className="text-red-600 border-red-200 hover:bg-red-50"
        >
          <X className="h-4 w-4 mr-2" />
          সব মুছে দিন
        </Button>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Product Images & Names */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="font-semibold text-gray-700 p-4">
              পণ্যের তথ্য
            </div>
            {items.map((product) => (
              <div key={product.id} className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(product.id)}
                  className="absolute -top-2 -right-2 z-10 h-8 w-8 p-0 bg-red-100 hover:bg-red-200 text-red-600"
                >
                  <X className="h-4 w-4" />
                </Button>
                
                <div className="border rounded-lg p-4 bg-white">
                  <div className="aspect-square relative mb-4 overflow-hidden rounded-lg">
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="200px"
                    />
                  </div>
                  <h3 className="font-semibold text-center mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <div className="text-center">
                    <span className="text-2xl font-bold text-green-600">
                      ৳{product.price}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-500 line-through ml-2">
                        ৳{product.originalPrice}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Comparison Rows */}
          <div className="space-y-4">
            {/* Rating */}
            <div className="grid grid-cols-4 gap-4 py-4 border-b">
              <div className="font-medium text-gray-700 p-4">রেটিং</div>
              {items.map((product) => (
                <div key={product.id} className="p-4 text-center">
                  <div className="flex justify-center mb-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className="h-4 w-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">৪.৮ (২৪ রিভিউ)</span>
                </div>
              ))}
            </div>

            {/* Category */}
            <div className="grid grid-cols-4 gap-4 py-4 border-b">
              <div className="font-medium text-gray-700 p-4">ক্যাটাগরি</div>
              {items.map((product) => (
                <div key={product.id} className="p-4 text-center">
                  <Badge variant="outline">{product.subcategory}</Badge>
                </div>
              ))}
            </div>

            {/* Weight */}
            <div className="grid grid-cols-4 gap-4 py-4 border-b">
              <div className="font-medium text-gray-700 p-4">ওজন/পরিমাণ</div>
              {items.map((product) => (
                <div key={product.id} className="p-4 text-center">
                  <span className="font-medium">{product.weight || 'N/A'}গ্রাম</span>
                  <br />
                  <span className="text-sm text-gray-600">{product.unit}</span>
                </div>
              ))}
            </div>

            {/* Stock Status */}
            <div className="grid grid-cols-4 gap-4 py-4 border-b">
              <div className="font-medium text-gray-700 p-4">স্টক স্ট্যাটাস</div>
              {items.map((product) => (
                <div key={product.id} className="p-4 text-center">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                    product.inStock 
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"
                  }`}>
                    {product.inStock ? (
                      <>
                        <Check className="h-4 w-4" />
                        স্টকে আছে
                      </>
                    ) : (
                      <>
                        <Minus className="h-4 w-4" />
                        স্টক নেই
                      </>
                    )}
                  </div>
                  {product.inStock && (
                    <div className="text-xs text-gray-600 mt-1">
                      {product.stockQuantity} {product.unit}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Featured */}
            <div className="grid grid-cols-4 gap-4 py-4 border-b">
              <div className="font-medium text-gray-700 p-4">ফিচার্ড</div>
              {items.map((product) => (
                <div key={product.id} className="p-4 text-center">
                  {product.featured ? (
                    <Badge className="bg-yellow-100 text-yellow-800">ফিচার্ড</Badge>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </div>
              ))}
            </div>

            {/* Tags */}
            <div className="grid grid-cols-4 gap-4 py-4 border-b">
              <div className="font-medium text-gray-700 p-4">ট্যাগ</div>
              {items.map((product) => (
                <div key={product.id} className="p-4">
                  <div className="flex flex-wrap gap-1 justify-center">
                    {product.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Nutrition Info */}
            {items.some(p => p.nutritionInfo) && (
              <div className="grid grid-cols-4 gap-4 py-4 border-b">
                <div className="font-medium text-gray-700 p-4">পুষ্টিগুণ (প্রতি ১০০গ্রাম)</div>
                {items.map((product) => (
                  <div key={product.id} className="p-4">
                    {product.nutritionInfo ? (
                      <div className="space-y-2 text-sm">
                        <div>ক্যালোরি: {product.nutritionInfo.calories}</div>
                        <div>প্রোটিন: {product.nutritionInfo.protein}গ</div>
                        <div>কার্বস: {product.nutritionInfo.carbs}গ</div>
                        <div>ফ্যাট: {product.nutritionInfo.fat}গ</div>
                      </div>
                    ) : (
                      <span className="text-gray-400">তথ্য নেই</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="grid grid-cols-4 gap-4 py-6">
              <div className="font-medium text-gray-700 p-4">অ্যাকশন</div>
              {items.map((product) => (
                <div key={product.id} className="p-4 space-y-2">
                  <Button
                    onClick={() => handleAddToCart(product)}
                    disabled={!product.inStock}
                    className="w-full"
                    size="sm"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    কার্টে যোগ করুন
                  </Button>
                  <Button
                    variant="outline"
                    asChild
                    className="w-full"
                    size="sm"
                  >
                    <Link href={`/products/${product.id}`}>
                      বিস্তারিত দেখুন
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add More Products */}
      {totalItems < 3 && (
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">
            আরও {3 - totalItems}টি পণ্য যোগ করতে পারেন তুলনার জন্য
          </p>
          <Button asChild>
            <Link href="/shop">আরও পণ্য দেখুন</Link>
          </Button>
        </div>
      )}
    </div>
  );
}