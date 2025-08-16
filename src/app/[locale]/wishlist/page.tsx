"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, X, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWishlistStore } from "@/store/wishlist";
import { useCartStore } from "@/store/cart";

export default function WishlistPage() {
  const { items, removeItem, clearWishlist } = useWishlistStore();
  const { addItem: addToCart, openCart } = useCartStore();

  const handleAddToCart = (product: any) => {
    addToCart(product);
    openCart();
  };

  const handleRemoveFromWishlist = (productId: string) => {
    removeItem(productId);
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="h-12 w-12 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            আপনার পছন্দের তালিকা খালি
          </h1>
          <p className="text-gray-600 mb-8">
            আপনার পছন্দের পণ্যগুলো এখানে সংরক্ষণ করুন এবং 
            পরে সহজেই কিনতে পারবেন।
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          আমার পছন্দের তালিকা ({items.length} টি পণ্য)
        </h1>
        <Button
          onClick={clearWishlist}
          variant="outline"
          size="sm"
          className="text-red-600 border-red-600 hover:bg-red-50"
        >
          সব মুছুন
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item) => (
          <div key={item.id} className="group bg-white rounded-lg border hover:shadow-lg transition-all duration-300">
            <div className="relative">
              <Link href={`/bn/products/${item.id}`}>
                <div className="relative aspect-square overflow-hidden rounded-t-lg">
                  <Image
                    src={item.images?.[0] || item.image || "/placeholder-product.jpg"}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  />
                </div>
              </Link>
              
              {/* Remove from wishlist button */}
              <button
                onClick={() => handleRemoveFromWishlist(item.id)}
                className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors"
              >
                <X className="h-4 w-4 text-gray-600" />
              </button>

              {/* Discount badge */}
              {item.originalPrice && item.originalPrice > item.price && (
                <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
                  {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% ছাড়
                </div>
              )}
            </div>

            <div className="p-4">
              <Link href={`/bn/products/${item.id}`}>
                <h3 className="font-medium text-gray-900 line-clamp-2 hover:text-green-600 transition-colors mb-2">
                  {item.name}
                </h3>
              </Link>
              
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                {item.description}
              </p>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-green-600">
                    ৳{item.price?.toLocaleString()}
                  </span>
                  {item.originalPrice && item.originalPrice > item.price && (
                    <span className="text-sm text-gray-500 line-through">
                      ৳{item.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
                
                {item.unit && (
                  <span className="text-xs text-gray-500">
                    / {item.unit}
                  </span>
                )}
              </div>

              {/* Category and tags */}
              <div className="mb-4">
                {item.category && (
                  <span className="inline-block text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded mr-2">
                    {item.category}
                  </span>
                )}
                {item.tags && item.tags.slice(0, 2).map((tag, index) => (
                  <span
                    key={index}
                    className="inline-block text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded mr-1"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Stock status */}
              <div className="flex items-center gap-2 mb-4">
                {item.inStock ? (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600 font-medium">স্টকে আছে</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-red-600 font-medium">স্টকে নেই</span>
                  </>
                )}
              </div>

              {/* Action buttons */}
              <div className="space-y-2">
                <Button
                  onClick={() => handleAddToCart(item)}
                  disabled={!item.inStock}
                  className="w-full"
                  size="sm"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  কার্টে যোগ করুন
                </Button>
                
                <div className="flex gap-2">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Link href={`/bn/products/${item.id}`}>
                      বিস্তারিত দেখুন
                    </Link>
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="px-3"
                    onClick={() => {
                      // Share functionality
                      if (navigator.share) {
                        navigator.share({
                          title: item.name,
                          text: item.description,
                          url: `${window.location.origin}/bn/products/${item.id}`
                        });
                      } else {
                        // Fallback: copy to clipboard
                        navigator.clipboard.writeText(
                          `${window.location.origin}/bn/products/${item.id}`
                        );
                        alert('লিংক কপি করা হয়েছে!');
                      }
                    }}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Continue Shopping */}
      <div className="mt-12 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          আরও পণ্য খুঁজুন
        </h2>
        <p className="text-gray-600 mb-6">
          আপনার পছন্দের আরও পণ্য আবিষ্কার করুন
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