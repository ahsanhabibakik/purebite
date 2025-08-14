"use client";

import { useWishlistStore } from "@/store/wishlist";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import Link from "next/link";

export default function WishlistPage() {
  const { items, clearWishlist, getTotalItems } = useWishlistStore();
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const totalItems = getTotalItems();

  const handleAddAllToCart = () => {
    items.forEach(product => {
      addItem(product, 1);
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Heart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h1 className="text-2xl font-bold mb-4">উইশলিস্ট দেখতে লগইন করুন</h1>
        <p className="text-gray-600 mb-6">
          আপনার পছন্দের পণ্যগুলো সেভ করতে প্রথমে লগইন করুন
        </p>
        <Button asChild>
          <Link href="/">হোমে ফিরে যান</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">আমার উইশলিস্ট</h1>
          <p className="text-gray-600">
            {totalItems > 0 ? `${totalItems}টি পণ্য আপনার উইশলিস্টে আছে` : 'আপনার উইশলিস্ট খালি'}
          </p>
        </div>
        
        {totalItems > 0 && (
          <div className="flex gap-3">
            <Button
              onClick={handleAddAllToCart}
              className="flex items-center gap-2"
            >
              <ShoppingCart className="h-4 w-4" />
              সব কার্টে যোগ করুন
            </Button>
            <Button
              variant="outline"
              onClick={clearWishlist}
              className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              সব মুছে দিন
            </Button>
          </div>
        )}
      </div>

      {/* Wishlist Items */}
      {totalItems === 0 ? (
        <div className="text-center py-16">
          <Heart className="mx-auto h-24 w-24 text-gray-300 mb-6" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            আপনার উইশলিস্ট খালি
          </h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            আপনার পছন্দের পণ্যগুলো উইশলিস্টে যোগ করুন যাতে পরে সহজেই খুঁজে পান।
            পণ্যের হার্ট আইকনে ক্লিক করে উইশলিস্টে যোগ করুন।
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild>
              <Link href="/shop">এখনই শপিং করুন</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/categories">ক্যাটাগরি ব্রাউজ করুন</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Recommended Products */}
      {totalItems === 0 && (
        <div className="mt-16">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            আপনার পছন্দ হতে পারে
          </h3>
          <div className="text-center text-gray-500 py-8">
            <p>আরও পণ্য দেখতে আমাদের শপ পেইজ ভিজিট করুন</p>
          </div>
        </div>
      )}
    </div>
  );
}