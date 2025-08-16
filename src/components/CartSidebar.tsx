"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Plus, Minus, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart";
import { cn } from "@/lib/utils";
import { CheckoutModal } from "@/components/CheckoutModal";

export function CartSidebar() {
  const {
    items,
    isOpen,
    closeCart,
    updateQuantity,
    removeItem,
    getTotalItems,
    getTotalPrice,
    clearCart
  } = useCartStore();
  
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const totalPrice = getTotalPrice();
  const totalItems = getTotalItems();

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/50 transition-opacity",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={closeCart}
      />
      
      {/* Sidebar */}
      <div
        className={cn(
          "fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white shadow-xl transition-transform",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 p-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              <h2 className="text-lg font-semibold">
                শপিং কার্ট ({totalItems})
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={closeCart}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  আপনার কার্ট খালি
                </h3>
                <p className="text-gray-600 mb-4">
                  কেনাকাটা শুরু করতে কিছু পণ্য যোগ করুন
                </p>
                <Button onClick={closeCart} asChild>
                  <Link href="/shop">
                    কেনাকাটা করুন
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4 p-4">
                {items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex gap-3 rounded-lg border border-gray-200 p-3"
                  >
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded">
                      <Image
                        src={item.product.images[0] || "/placeholder-product.jpg"}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 line-clamp-1">
                        {item.product.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {item.product.unit}
                      </p>
                      <p className="text-sm font-semibold text-green-600">
                        ৳{item.product.price}
                      </p>
                      
                      {/* Quantity Controls */}
                      <div className="mt-2 flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="h-6 w-6 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="min-w-[2rem] text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="h-6 w-6 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.productId)}
                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ৳{item.product.price * item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
                
                {/* Clear Cart Button */}
                {items.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearCart}
                    className="w-full text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    কার্ট খালি করুন
                  </Button>
                )}
              </div>
            )}
          </div>
          
          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-gray-200 p-4 space-y-4">
              {/* Delivery Info */}
              <div className="text-sm text-gray-600">
                <p>🚚 ঢাকার ভিতরে ফ্রি ডেলিভারি (২৪ ঘন্টায়)</p>
                <p>📞 হটলাইন: ০১৭১১-১২৩৪৫৬</p>
              </div>
              
              {/* Total */}
              <div className="flex items-center justify-between text-lg font-semibold">
                <span>মোট:</span>
                <span>৳{totalPrice}</span>
              </div>
              
              {/* Checkout Button */}
              <Button 
                className="w-full" 
                size="lg" 
                onClick={() => {
                  setIsCheckoutModalOpen(true);
                  closeCart();
                }}
              >
                চেকআউট (৳{totalPrice})
              </Button>
              
              {/* Continue Shopping */}
              <Button
                variant="outline"
                className="w-full"
                onClick={closeCart}
                asChild
              >
                <Link href="/shop">
                  কেনাকাটা চালিয়ে যান
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Checkout Modal */}
      <CheckoutModal 
        isOpen={isCheckoutModalOpen} 
        onClose={() => setIsCheckoutModalOpen(false)} 
      />
    </>
  );
}