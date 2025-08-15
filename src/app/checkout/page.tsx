"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ChevronLeft,
  CreditCard,
  Truck,
  Shield,
  Phone,
  MapPin,
  User,
  CheckCircle,
  Tag,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart";
import { useSession } from "next-auth/react";

const checkoutSchema = z.object({
  fullName: z.string().min(2, "নাম কমপক্ষে ২ অক্ষরের হতে হবে"),
  email: z.string().email("সঠিক ইমেইল ঠিকানা দিন"),
  phone: z.string().min(11, "সঠিক মোবাইল নম্বর দিন"),
  street: z.string().min(5, "সম্পূর্ণ ঠিকানা দিন"),
  area: z.string().min(2, "এলাকার নাম দিন"),
  city: z.string().min(2, "শহরের নাম দিন"),
  district: z.string().min(2, "জেলার নাম দিন"),
  postalCode: z.string().optional(),
  paymentMethod: z.enum(["cash_on_delivery", "mobile_banking", "bank_transfer"]),
  specialInstructions: z.string().optional()
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

interface CouponValidationResult {
  isValid: boolean;
  errorMessage?: string;
  discount: number;
  finalAmount: number;
  couponId?: string;
}

export default function CheckoutPage() {
  const { data: session } = useSession();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResult | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [autoAppliedCoupons, setAutoAppliedCoupons] = useState<any[]>([]);

  const form = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: "cash_on_delivery"
    }
  });

  const totalPrice = getTotalPrice();
  const deliveryFee = totalPrice >= 500 ? 0 : 60;
  const subtotal = totalPrice + deliveryFee;
  const discount = appliedCoupon?.discount || 0;
  const finalTotal = subtotal - discount;

  // Auto-apply coupons on load
  useEffect(() => {
    if (session?.user && items.length > 0) {
      checkAutoApplyCoupons();
    }
  }, [session, items]);

  const checkAutoApplyCoupons = async () => {
    if (!session?.user?.email) return;

    try {
      const cartItems = items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.product.price,
      }));

      const response = await fetch('/api/coupons/auto-apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartItems,
          subtotal,
        }),
      });

      if (response.ok) {
        const autoApplicable = await response.json();
        if (autoApplicable.length > 0) {
          setAutoAppliedCoupons(autoApplicable);
          // Apply the best auto-applicable coupon
          const bestCoupon = autoApplicable[0];
          setAppliedCoupon({
            isValid: true,
            discount: bestCoupon.calculatedDiscount,
            finalAmount: subtotal - bestCoupon.calculatedDiscount,
            couponId: bestCoupon.id,
          });
          setCouponCode(bestCoupon.code);
        }
      }
    } catch (error) {
      console.error('Error checking auto-apply coupons:', error);
    }
  };

  const validateCoupon = async () => {
    if (!couponCode.trim() || !session?.user?.email) return;

    setCouponLoading(true);
    try {
      const cartItems = items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.product.price,
      }));

      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          couponCode: couponCode.trim(),
          cartItems,
          subtotal,
        }),
      });

      const result = await response.json();
      setAppliedCoupon(result);

      if (!result.isValid) {
        alert(result.errorMessage || 'কুপন কোড সঠিক নয়');
      }
    } catch (error) {
      console.error('Error validating coupon:', error);
      alert('কুপন যাচাই করতে সমস্যা হয়েছে');
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  if (items.length === 0 && !orderPlaced) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            আপনার কার্ট খালি
          </h1>
          <p className="text-gray-600 mb-6">
            চেকআউট করার জন্য প্রথমে কিছু পণ্য কার্টে যোগ করুন
          </p>
          <Button asChild>
            <Link href="/shop">কেনাকাটা করুন</Link>
          </Button>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: CheckoutForm) => {
    setIsSubmitting(true);
    
    try {
      if (data.paymentMethod === 'cash_on_delivery') {
        // Handle cash on delivery - create order directly
        const orderData = {
          items,
          customerInfo: data,
          subtotal: totalPrice,
          deliveryFee,
          discount,
          totalAmount: finalTotal,
          paymentMethod: data.paymentMethod,
          couponId: appliedCoupon?.couponId,
          orderDate: new Date()
        };

        // TODO: Send to your order creation API
        console.log("Cash on Delivery Order:", orderData);
        
        clearCart();
        setOrderPlaced(true);
      } else {
        // Handle online payment via SSLCommerz
        const response = await fetch('/api/payment/sslcommerz', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            items,
            customerInfo: data,
            subtotal: totalPrice,
            deliveryFee,
            discount,
            totalAmount: finalTotal,
            couponId: appliedCoupon?.couponId,
          }),
        });

        const result = await response.json();
        
        if (result.status === 'success' && result.data.GatewayPageURL) {
          // Redirect to SSLCommerz payment gateway
          window.location.href = result.data.GatewayPageURL;
        } else {
          throw new Error(result.message || 'Failed to create payment session');
        }
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Checkout failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center py-12">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            অর্ডার সফল হয়েছে!
          </h1>
          <p className="text-gray-600 mb-6">
            আপনার অর্ডারটি গ্রহণ করা হয়েছে। শীঘ্রই আমরা আপনার সাথে যোগাযোগ করব।
          </p>
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/shop">আরও কেনাকাটা করুন</Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/">হোমে ফিরে যান</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" className="mb-4" asChild>
          <Link href="/shop">
            <ChevronLeft className="mr-2 h-4 w-4" />
            পেছনে যান
          </Link>
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">চেকআউট</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Customer Information */}
            <div className="rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <User className="mr-2 h-5 w-5" />
                গ্রাহকের তথ্য
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    পূর্ণ নাম *
                  </label>
                  <input
                    {...form.register("fullName")}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="আপনার পূর্ণ নাম"
                  />
                  {form.formState.errors.fullName && (
                    <p className="mt-1 text-sm text-red-600">
                      {form.formState.errors.fullName.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    মোবাইল নম্বর *
                  </label>
                  <input
                    {...form.register("phone")}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="০১৭১১১২৩৪৫৬"
                  />
                  {form.formState.errors.phone && (
                    <p className="mt-1 text-sm text-red-600">
                      {form.formState.errors.phone.message}
                    </p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ইমেইল
                  </label>
                  <input
                    {...form.register("email")}
                    type="email"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="your@email.com"
                  />
                  {form.formState.errors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="mr-2 h-5 w-5" />
                ডেলিভারি ঠিকানা
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    সম্পূর্ণ ঠিকানা *
                  </label>
                  <input
                    {...form.register("street")}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="বাড়ি নম্বর, রাস্তার নাম"
                  />
                  {form.formState.errors.street && (
                    <p className="mt-1 text-sm text-red-600">
                      {form.formState.errors.street.message}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      এলাকা *
                    </label>
                    <input
                      {...form.register("area")}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="থানা/এলাকা"
                    />
                    {form.formState.errors.area && (
                      <p className="mt-1 text-sm text-red-600">
                        {form.formState.errors.area.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      শহর *
                    </label>
                    <input
                      {...form.register("city")}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="ঢাকা"
                    />
                    {form.formState.errors.city && (
                      <p className="mt-1 text-sm text-red-600">
                        {form.formState.errors.city.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      জেলা *
                    </label>
                    <input
                      {...form.register("district")}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="ঢাকা"
                    />
                    {form.formState.errors.district && (
                      <p className="mt-1 text-sm text-red-600">
                        {form.formState.errors.district.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      পোস্টাল কোড
                    </label>
                    <input
                      {...form.register("postalCode")}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="১২০০"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    বিশেষ নির্দেশনা
                  </label>
                  <textarea
                    {...form.register("specialInstructions")}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="ডেলিভারির জন্য বিশেষ কোন নির্দেশনা থাকলে লিখুন"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <CreditCard className="mr-2 h-5 w-5" />
                পেমেন্ট পদ্ধতি
              </h2>
              <div className="space-y-3">
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    {...form.register("paymentMethod")}
                    type="radio"
                    value="cash_on_delivery"
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <div className="font-medium">ক্যাশ অন ডেলিভারি</div>
                    <div className="text-sm text-gray-600">পণ্য পৌঁছানোর সময় টাকা দিন</div>
                  </div>
                </label>
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    {...form.register("paymentMethod")}
                    type="radio"
                    value="mobile_banking"
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <div className="font-medium">মোবাইল ব্যাংকিং</div>
                    <div className="text-sm text-gray-600">bKash, Nagad, Rocket</div>
                  </div>
                </label>
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    {...form.register("paymentMethod")}
                    type="radio"
                    value="bank_transfer"
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <div className="font-medium">ব্যাংক ট্রান্সফার</div>
                    <div className="text-sm text-gray-600">সরাসরি ব্যাংক একাউন্টে পাঠান</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Place Order Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 text-lg"
              size="lg"
            >
              {isSubmitting ? "অর্ডার প্রক্রিয়াকরণ..." : `৳${finalTotal} - অর্ডার সম্পন্ন করুন`}
            </Button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <div className="rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                অর্ডার সামারি
              </h2>
              
              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-3">
                    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded">
                      <Image
                        src={item.product.images[0] || "/placeholder-product.jpg"}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm line-clamp-1">
                        {item.product.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {item.quantity} × ৳{item.product.price}
                      </p>
                    </div>
                    <div className="text-sm font-semibold">
                      ৳{item.product.price * item.quantity}
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon Section */}
              <div className="border-t border-gray-200 pt-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="h-4 w-4 text-green-600" />
                  <h3 className="font-medium text-gray-900">কুপন কোড</h3>
                </div>
                
                {appliedCoupon?.isValid ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-800">
                          কুপন প্রয়োগ করা হয়েছে: {couponCode}
                        </p>
                        <p className="text-sm text-green-600">
                          ছাড়: ৳{discount.toFixed(2)}
                        </p>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-green-600 hover:text-green-800"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="কুপন কোড লিখুন"
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      onKeyPress={(e) => e.key === 'Enter' && validateCoupon()}
                    />
                    <Button
                      type="button"
                      onClick={validateCoupon}
                      disabled={!couponCode.trim() || couponLoading}
                      variant="outline"
                      size="sm"
                    >
                      {couponLoading ? 'যাচাই...' : 'প্রয়োগ'}
                    </Button>
                  </div>
                )}

                {session?.user && (
                  <div className="mt-2">
                    <Link 
                      href="/coupons" 
                      className="text-sm text-green-600 hover:text-green-700 underline"
                    >
                      উপলব্ধ কুপন দেখুন
                    </Link>
                  </div>
                )}
              </div>

              {/* Pricing Breakdown */}
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>সাবটোটাল:</span>
                  <span>৳{totalPrice}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>ডেলিভারি চার্জ:</span>
                  <span className={deliveryFee === 0 ? "text-green-600" : ""}>
                    {deliveryFee === 0 ? "ফ্রি" : `৳${deliveryFee}`}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>কুপন ছাড়:</span>
                    <span>-৳{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-lg border-t border-gray-200 pt-2">
                  <span>মোট:</span>
                  <span>৳{finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="mt-6 space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-green-600" />
                  <span>২৪ ঘন্টায় ডেলিভারি</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span>১০০% নিরাপদ পেমেন্ট</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-green-600" />
                  <span>২৪/৭ কাস্টমার সাপোর্ট</span>
                </div>
              </div>

              {/* Free Delivery Notice */}
              {totalPrice < 500 && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    আরও ৳{500 - totalPrice} কিনলে ফ্রি ডেলিভারি পাবেন!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}