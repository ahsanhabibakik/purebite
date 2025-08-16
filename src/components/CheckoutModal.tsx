"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTranslations } from 'next-intl';

const checkoutSchema = z.object({
  fullName: z.string().min(2, "নাম কমপক্ষে ২ অক্ষরের হতে হবে"),
  email: z.string().email("সঠিক ইমেইল ঠিকানা দিন"),
  phone: z.string().min(11, "সঠিক মোবাইল নম্বর দিন"),
  street: z.string().min(5, "সম্পূর্ণ ঠিকানা দিন"),
  area: z.string().min(2, "এলাকার নাম দিন"),
  city: z.string().min(2, "শহরের নাম দিন"),
  district: z.string().min(2, "জেলার নাম দিন"),
  postalCode: z.string().optional(),
  paymentMethod: z.enum(["cash_on_delivery", "mobile_banking", "bank_transfer", "online_payment"]),
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

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const t = useTranslations('checkout');
  const { data: session } = useSession();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResult | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

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
    if (isOpen && session?.user && items.length > 0) {
      checkAutoApplyCoupons();
    }
  }, [isOpen, session, items]);

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

  const onSubmit = async (data: CheckoutForm) => {
    setIsSubmitting(true);
    
    try {
      if (data.paymentMethod === 'cash_on_delivery' || data.paymentMethod === 'mobile_banking' || data.paymentMethod === 'bank_transfer') {
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

        // Create order via API
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            items: items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price
            })),
            shippingAddress: data,
            paymentMethod: data.paymentMethod.toUpperCase(),
            total: finalTotal,
            subtotal: totalPrice,
            tax: 0,
            shipping: deliveryFee
          }),
        });

        if (response.ok) {
          clearCart();
          setOrderPlaced(true);
        } else {
          throw new Error('Failed to create order');
        }
      } else {
        // Handle online payment via SSLCommerz
        const response = await fetch('/api/payment/sslcommerz', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            items: items.map(item => ({
              productId: item.productId,
              product: item.product,
              quantity: item.quantity,
              price: item.product.price
            })),
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
      alert('অর্ডার করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && !orderPlaced) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              আপনার কার্ট খালি
            </h3>
            <p className="text-gray-600 mb-4">
              চেকআউট করার জন্য প্রথমে কিছু পণ্য কার্টে যোগ করুন
            </p>
            <Button onClick={onClose}>
              বুঝেছি
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (orderPlaced) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              অর্ডার সফল হয়েছে!
            </h3>
            <p className="text-gray-600 mb-6">
              আপনার অর্ডারটি গ্রহণ করা হয়েছে। শীঘ্রই আমরা আপনার সাথে যোগাযোগ করব।
            </p>
            <Button onClick={onClose} className="w-full">
              বন্ধ করুন
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">চেকআউট</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Checkout Form */}
          <div>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Customer Information */}
              <div className="rounded-lg border border-gray-200 p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  গ্রাহকের তথ্য
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      পূর্ণ নাম *
                    </label>
                    <input
                      {...form.register("fullName")}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="আপনার পূর্ণ নাম"
                    />
                    {form.formState.errors.fullName && (
                      <p className="mt-1 text-xs text-red-600">
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
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="০১৭১১১২৩৪৫৬"
                    />
                    {form.formState.errors.phone && (
                      <p className="mt-1 text-xs text-red-600">
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
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="your@email.com"
                    />
                    {form.formState.errors.email && (
                      <p className="mt-1 text-xs text-red-600">
                        {form.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="rounded-lg border border-gray-200 p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <MapPin className="mr-2 h-4 w-4" />
                  ডেলিভারি ঠিকানা
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      সম্পূর্ণ ঠিকানা *
                    </label>
                    <input
                      {...form.register("street")}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="বাড়ি নম্বর, রাস্তার নাম"
                    />
                    {form.formState.errors.street && (
                      <p className="mt-1 text-xs text-red-600">
                        {form.formState.errors.street.message}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        এলাকা *
                      </label>
                      <input
                        {...form.register("area")}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="থানা/এলাকা"
                      />
                      {form.formState.errors.area && (
                        <p className="mt-1 text-xs text-red-600">
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
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="ঢাকা"
                      />
                      {form.formState.errors.city && (
                        <p className="mt-1 text-xs text-red-600">
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
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="ঢাকা"
                      />
                      {form.formState.errors.district && (
                        <p className="mt-1 text-xs text-red-600">
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
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
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
                      rows={2}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="ডেলিভারির জন্য বিশেষ কোন নির্দেশনা থাকলে লিখুন"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="rounded-lg border border-gray-200 p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <CreditCard className="mr-2 h-4 w-4" />
                  পেমেন্ট পদ্ধতি
                </h3>
                <div className="space-y-2">
                  <label className="flex items-center p-2 border rounded-lg cursor-pointer hover:bg-gray-50 border-green-200 bg-green-50">
                    <input
                      {...form.register("paymentMethod")}
                      type="radio"
                      value="cash_on_delivery"
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm flex items-center">
                        💰 ক্যাশ অন ডেলিভারি 
                        <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded">সুপারিশকৃত</span>
                      </div>
                      <div className="text-xs text-gray-600">পণ্য হাতে পেয়ে টাকা দিন - কোন অগ্রিম পেমেন্ট লাগবে না</div>
                    </div>
                  </label>
                  <label className="flex items-center p-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      {...form.register("paymentMethod")}
                      type="radio"
                      value="mobile_banking"
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm">📱 মোবাইল ব্যাংকিং</div>
                      <div className="text-xs text-gray-600">
                        bKash (01XXXXXXXX), Nagad (01XXXXXXXX), Rocket (01XXXXXXXX)
                        <br />
                        <span className="text-green-600">✓ তাৎক্ষণিক পেমেন্ট নিশ্চিতকরণ</span>
                      </div>
                    </div>
                  </label>
                  <label className="flex items-center p-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      {...form.register("paymentMethod")}
                      type="radio"
                      value="online_payment"
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm">💳 অনলাইন পেমেন্ট</div>
                      <div className="text-xs text-gray-600">
                        কার্ড, bKash, Nagad, Rocket, ইন্টারনেট ব্যাংকিং
                        <br />
                        <span className="text-green-600">✓ SSLCommerz দ্বারা সুরক্ষিত</span>
                      </div>
                    </div>
                  </label>
                  <label className="flex items-center p-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      {...form.register("paymentMethod")}
                      type="radio"
                      value="bank_transfer"
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm">🏦 ব্যাংক ট্রান্সফার</div>
                      <div className="text-xs text-gray-600">
                        ইসলামী ব্যাংক, ডাচ-বাংলা ব্যাংক, ব্র্যাক ব্যাংক
                        <br />
                        <span className="text-blue-600">ℹ️ ট্রান্সফারের পর রসিদ পাঠান</span>
                      </div>
                    </div>
                  </label>
                </div>
                
                {/* Payment Security Info */}
                <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 text-xs text-blue-800">
                    <Shield className="h-3 w-3" />
                    <span>সকল পেমেন্ট SSL সিকিউরিটি দ্বারা সুরক্ষিত</span>
                  </div>
                </div>
              </div>

              {/* Place Order Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2 text-sm"
                size="sm"
              >
                {isSubmitting ? "অর্ডার প্রক্রিয়াকরণ..." : `৳${finalTotal} - অর্ডার সম্পন্ন করুন`}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                অর্ডার সামারি
              </h3>
              
              {/* Cart Items */}
              <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-2">
                    <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded">
                      <Image
                        src={item.product.images[0] || "/placeholder-product.jpg"}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-xs line-clamp-1">
                        {item.product.name}
                      </h4>
                      <p className="text-xs text-gray-600">
                        {item.quantity} × ৳{item.product.price}
                      </p>
                    </div>
                    <div className="text-xs font-semibold">
                      ৳{item.product.price * item.quantity}
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon Section */}
              <div className="border-t border-gray-200 pt-3 mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="h-3 w-3 text-green-600" />
                  <h4 className="font-medium text-sm text-gray-900">কুপন কোড</h4>
                </div>
                
                {appliedCoupon?.isValid ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-green-800">
                          কুপন প্রয়োগ করা হয়েছে: {couponCode}
                        </p>
                        <p className="text-xs text-green-600">
                          ছাড়: ৳{discount.toFixed(2)}
                        </p>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-green-600 hover:text-green-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-1">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="কুপন কোড লিখুন"
                      className="flex-1 border border-gray-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-green-500"
                      onKeyPress={(e) => e.key === 'Enter' && validateCoupon()}
                    />
                    <Button
                      type="button"
                      onClick={validateCoupon}
                      disabled={!couponCode.trim() || couponLoading}
                      variant="outline"
                      size="sm"
                      className="text-xs px-2 py-1 h-auto"
                    >
                      {couponLoading ? 'যাচাই...' : 'প্রয়োগ'}
                    </Button>
                  </div>
                )}
              </div>

              {/* Pricing Breakdown */}
              <div className="border-t border-gray-200 pt-3 space-y-1">
                <div className="flex justify-between text-xs">
                  <span>সাবটোটাল:</span>
                  <span>৳{totalPrice}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>ডেলিভারি চার্জ:</span>
                  <span className={deliveryFee === 0 ? "text-green-600" : ""}>
                    {deliveryFee === 0 ? "ফ্রি" : `৳${deliveryFee}`}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-xs text-green-600">
                    <span>কুপন ছাড়:</span>
                    <span>-৳{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-sm border-t border-gray-200 pt-1">
                  <span>মোট:</span>
                  <span>৳{finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="mt-4 space-y-2 text-xs text-gray-600">
                <h4 className="font-medium text-sm text-gray-900 mb-2">🚚 ডেলিভারি তথ্য</h4>
                <div className="flex items-center gap-2">
                  <Truck className="h-3 w-3 text-green-600" />
                  <span>ঢাকায় ২৪ ঘন্টা, ঢাকার বাইরে ৪৮ ঘন্টায় ডেলিভারি</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-3 w-3 text-green-600" />
                  <span>১০০% নিরাপদ পেমেন্ট ও পণ্যের মান নিশ্চয়তা</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3 w-3 text-green-600" />
                  <span>২ৄ/৭ কাস্টমার সাপোর্ট: ১৬২৬৩ (টোল ফ্রি)</span>
                </div>
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-xs text-yellow-800">
                    🕐 সকাল ৮টা থেকে রাত ১০টা পর্যন্ত ডেলিভারি সময়
                  </p>
                </div>
              </div>

              {/* Free Delivery Notice */}
              {totalPrice < 500 && (
                <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs text-yellow-800">
                    আরও ৳{500 - totalPrice} কিনলে ফ্রি ডেলিভারি পাবেন!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}