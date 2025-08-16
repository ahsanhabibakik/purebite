"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Minus, 
  Plus, 
  X, 
  ShoppingBag, 
  ArrowRight,
  Truck,
  Shield,
  Gift,
  Tag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/store/cart";
import { CheckoutModal } from "@/components/CheckoutModal";

export default function CartPage() {
  const { 
    items, 
    updateQuantity, 
    removeItem, 
    getTotalPrice, 
    getTotalItems,
    clearCart 
  } = useCartStore();
  
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const subtotal = getTotalPrice();
  const deliveryFee = subtotal >= 500 ? 0 : 60;
  const discount = appliedCoupon?.discount || 0;
  const total = subtotal + deliveryFee - discount;

  const handleApplyCoupon = () => {
    // Mock coupon logic
    if (couponCode.toLowerCase() === "save50") {
      setAppliedCoupon({ code: couponCode, discount: 50 });
      setCouponCode("");
    } else if (couponCode.toLowerCase() === "welcome10") {
      setAppliedCoupon({ code: couponCode, discount: Math.min(100, subtotal * 0.1) });
      setCouponCode("");
    } else {
      alert("অবৈধ কুপন কোড");
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="h-12 w-12 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            আপনার কার্ট খালি
          </h1>
          <p className="text-gray-600 mb-8">
            আপনার কার্টে কোন পণ্য নেই। কেনাকাটা শুরু করুন এবং 
            আপনার পছন্দের পণ্য যোগ করুন।
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
          শপিং কার্ট ({getTotalItems()} টি পণ্য)
        </h1>
        <Button
          onClick={clearCart}
          variant="outline"
          size="sm"
          className="text-red-600 border-red-600 hover:bg-red-50"
        >
          সব মুছুন
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border">
            {/* Header */}
            <div className="p-6 border-b bg-gray-50">
              <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-600">
                <div className="col-span-6">পণ্য</div>
                <div className="col-span-2 text-center">দাম</div>
                <div className="col-span-2 text-center">পরিমাণ</div>
                <div className="col-span-2 text-right">মোট</div>
              </div>
            </div>

            {/* Cart Items */}
            <div className="divide-y">
              {items.map((item) => (
                <div key={item.productId} className="p-6">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* Product Info */}
                    <div className="col-span-6 flex items-center gap-4">
                      <div className="relative w-16 h-16 flex-shrink-0 overflow-hidden rounded-lg">
                        <Image
                          src={item.product.images?.[0] || item.product.image || "/placeholder-product.jpg"}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link 
                          href={`/bn/products/${item.productId}`}
                          className="font-medium text-gray-900 hover:text-green-600 line-clamp-2"
                        >
                          {item.product.name}
                        </Link>
                        <p className="text-sm text-gray-500 mt-1">
                          {item.product.category}
                        </p>
                        {item.product.tags && item.product.tags.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {item.product.tags.slice(0, 2).map((tag, index) => (
                              <span
                                key={index}
                                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Price */}
                    <div className="col-span-2 text-center">
                      <div className="font-medium text-gray-900">
                        ৳{item.product.price}
                      </div>
                      {item.product.unit && (
                        <div className="text-sm text-gray-500">
                          / {item.product.unit}
                        </div>
                      )}
                    </div>

                    {/* Quantity */}
                    <div className="col-span-2">
                      <div className="flex items-center justify-center">
                        <div className="flex items-center border rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="p-2 hover:bg-gray-100 disabled:opacity-50"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="px-4 py-2 font-medium min-w-[3rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="p-2 hover:bg-gray-100"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="col-span-2 text-right">
                      <div className="font-bold text-gray-900">
                        ৳{(item.product.price * item.quantity).toLocaleString()}
                      </div>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="text-red-500 hover:text-red-700 text-sm mt-1 flex items-center gap-1 ml-auto"
                      >
                        <X className="h-3 w-3" />
                        মুছুন
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Coupon Section */}
          <div className="bg-white rounded-lg border mt-6 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              কুপন কোড
            </h3>
            
            {appliedCoupon ? (
              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-900">
                    {appliedCoupon.code} - ৳{appliedCoupon.discount} ছাড়
                  </span>
                </div>
                <button
                  onClick={handleRemoveCoupon}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <Input
                  placeholder="কুপন কোড লিখুন"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={handleApplyCoupon}
                  variant="outline"
                  disabled={!couponCode.trim()}
                >
                  প্রয়োগ করুন
                </Button>
              </div>
            )}
            
            <div className="mt-4 text-sm text-gray-600">
              <p className="font-medium mb-2">উপলব্ধ কুপন:</p>
              <ul className="space-y-1">
                <li>• <code className="bg-gray-100 px-2 py-1 rounded">SAVE50</code> - ৫০ টাকা ছাড়</li>
                <li>• <code className="bg-gray-100 px-2 py-1 rounded">WELCOME10</code> - ১০% ছাড় (সর্বোচ্চ ১০০ টাকা)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border p-6 sticky top-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              অর্ডার সামারি
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">সাবটোটাল ({getTotalItems()} টি পণ্য)</span>
                <span className="font-medium">৳{subtotal.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">ডেলিভারি চার্জ</span>
                <span className={`font-medium ${deliveryFee === 0 ? 'text-green-600' : ''}`}>
                  {deliveryFee === 0 ? 'ফ্রি' : `৳${deliveryFee}`}
                </span>
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>ছাড়</span>
                  <span className="font-medium">-৳{discount}</span>
                </div>
              )}
              
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900">মোট</span>
                  <span className="font-bold text-green-600 text-lg">
                    ৳{total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Free Delivery Notice */}
            {subtotal < 500 && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 text-blue-800 text-sm">
                  <Truck className="h-4 w-4" />
                  <span>
                    আরও ৳{(500 - subtotal).toLocaleString()} কিনলে ফ্রি ডেলিভারি!
                  </span>
                </div>
              </div>
            )}

            {/* Features */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield className="h-4 w-4 text-green-600" />
                <span>নিরাপদ পেমেন্ট</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Truck className="h-4 w-4 text-blue-600" />
                <span>দ্রুত ডেলিভারি</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Gift className="h-4 w-4 text-purple-600" />
                <span>গিফট র‍্যাপিং উপলব্ধ</span>
              </div>
            </div>

            {/* Checkout Button */}
            <Button
              onClick={() => setIsCheckoutOpen(true)}
              className="w-full mt-6"
              size="lg"
            >
              চেকআউট করুন
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>

            {/* Continue Shopping */}
            <Button
              asChild
              variant="outline"
              className="w-full mt-3"
            >
              <Link href="/bn/shop">
                কেনাকাটা চালিয়ে যান
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal 
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />
    </div>
  );
}