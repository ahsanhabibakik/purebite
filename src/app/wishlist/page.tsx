"use client";

import { useState, useEffect } from "react";
import { useWishlistStore } from "@/store/wishlist";
import { useCartStore } from "@/store/cart";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default function WishlistPage() {
  const [mounted, setMounted] = useState(false);
  const { items, clearWishlist, getTotalItems } = useWishlistStore();
  const { addItem } = useCartStore();
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const totalItems = mounted ? getTotalItems() : 0;

  const handleAddToCart = (productId: string) => {
    const product = items.find(item => item.id === productId);
    if (product) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        quantity: 1
      });
    }
  };

  if (!mounted || totalItems === 0) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">আপনার উইশলিস্ট খালি</h2>
          <p className="text-gray-600 mb-6">
            আপনার পছন্দের পণ্যগুলো উইশলিস্টে যোগ করুন
          </p>
          <Button asChild>
            <Link href="/shop">কেনাকাটা শুরু করুন</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">আমার উইশলিস্ট</h1>
          <p className="text-gray-600">{totalItems}টি পণ্য</p>
        </div>
        <Button
          variant="outline"
          onClick={clearWishlist}
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          সব মুছে ফেলুন
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mounted && items.map((product) => (
          <div key={product.id} className="relative">
            <ProductCard product={product} />
            <div className="mt-3 space-y-2">
              <Button
                onClick={() => handleAddToCart(product.id)}
                className="w-full"
                size="sm"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                কার্টে যোগ করুন
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}