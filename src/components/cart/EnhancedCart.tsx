"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Plus,
  Minus,
  X,
  Heart,
  Gift,
  Truck,
  Clock,
  CreditCard,
  ArrowRight,
  Package,
  Star,
  Zap,
  Tag,
  MapPin,
  Phone,
  User,
  ChevronRight,
  Save,
  Percent,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import { FloatingActionButton, AnimatedBadge, InteractiveHeartButton, LoadingDots } from "@/components/animations/InteractiveAnimations";

interface CartItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
  inStock: boolean;
  maxQuantity?: number;
  category: string;
  weight?: string;
  freeShipping?: boolean;
  expressDelivery?: boolean;
  discount?: number;
}

interface DeliveryOption {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: number;
  icon: any;
}

interface PromoCode {
  code: string;
  discount: number;
  type: "percentage" | "fixed";
  minAmount?: number;
  description: string;
}

export function EnhancedCart({ 
  isOpen = false, 
  onClose,
  onCheckout
}: {
  isOpen?: boolean;
  onClose?: () => void;
  onCheckout?: () => void;
}) {
  const t = useTranslations("cart");
  const { 
    items, 
    updateQuantity, 
    removeItem, 
    clearCart, 
    getTotalPrice, 
    getTotalItems 
  } = useCartStore();
  const { toggleItem: toggleWishlist, isInWishlist } = useWishlistStore();
  
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [selectedDelivery, setSelectedDelivery] = useState("standard");
  const [deliveryAddress, setDeliveryAddress] = useState({
    phone: "",
    address: "",
    area: "",
    instructions: ""
  });
  const [giftWrap, setGiftWrap] = useState(false);
  const [saveForLater, setSaveForLater] = useState<string[]>([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const deliveryOptions: DeliveryOption[] = [
    {
      id: "standard",
      name: "স্ট্যান্ডার্ড ডেলিভারি",
      description: "৩-৫ কর্মদিবস",
      price: 60,
      estimatedDays: 4,
      icon: Truck
    },
    {
      id: "express",
      name: "এক্সপ্রেস ডেলিভারি", 
      description: "১-২ কর্মদিবস",
      price: 120,
      estimatedDays: 1,
      icon: Zap
    },
    {
      id: "same-day",
      name: "একইদিন ডেলিভারি",
      description: "৬-৮ ঘন্টার মধ্যে",
      price: 200,
      estimatedDays: 0,
      icon: Clock
    }
  ];

  const availablePromoCodes: PromoCode[] = [
    {
      code: "SAVE10",
      discount: 10,
      type: "percentage",
      minAmount: 500,
      description: "১০% ছাড় (সর্বনিম্ন ৳৫০০)"
    },
    {
      code: "FIRST50",
      discount: 50,
      type: "fixed",
      minAmount: 200,
      description: "৳৫০ ছাড় (নতুন কাস্টমার)"
    },
    {
      code: "FREE100",
      discount: 100,
      type: "fixed",
      minAmount: 1000,
      description: "৳১০০ ছাড় (সর্বনিম্ন ৳১০০০)"
    }
  ];

  const subtotal = getTotalPrice();
  const deliveryCharge = deliveryOptions.find(d => d.id === selectedDelivery)?.price || 0;
  const giftWrapCharge = giftWrap ? 50 : 0;
  const discountAmount = appliedPromo 
    ? appliedPromo.type === "percentage" 
      ? (subtotal * appliedPromo.discount / 100)
      : appliedPromo.discount
    : 0;
  const total = subtotal + deliveryCharge + giftWrapCharge - discountAmount;

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id);
    } else {
      updateQuantity(id, newQuantity);
    }
  };

  const handleApplyPromo = () => {
    const promo = availablePromoCodes.find(p => p.code === promoCode.toUpperCase());
    if (promo && (!promo.minAmount || subtotal >= promo.minAmount)) {
      setAppliedPromo(promo);
      setPromoCode("");
    }
  };

  const handleSaveForLater = (itemId: string) => {
    setSaveForLater(prev => [...prev, itemId]);
    removeItem(itemId);
  };

  const handleMoveToWishlist = (item: CartItem) => {
    toggleWishlist(item.id);
    removeItem(item.id);
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    // Simulate checkout process
    setTimeout(() => {
      setIsCheckingOut(false);
      onCheckout?.();
    }, 2000);
  };

  if (items.length === 0 && !isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Cart Panel */}
          <motion.div
            className="ml-auto w-full max-w-2xl bg-white dark:bg-gray-900 h-full overflow-hidden flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <ShoppingCart className="h-6 w-6 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  শপিং কার্ট
                </h2>
                <AnimatedBadge variant="default">
                  {getTotalItems()} টি পণ্য
                </AnimatedBadge>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Cart Content */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <ShoppingCart className="h-16 w-16 text-gray-400 mb-4" />
                  </motion.div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    আপনার কার্ট খালি
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-center mb-4">
                    কিছু পণ্য যোগ করুন এবং কেনাকাটা শুরু করুন
                  </p>
                  <Button onClick={onClose} className="bg-green-600 hover:bg-green-700">
                    কেনাকাটা করুন
                  </Button>
                </div>
              ) : (
                <div className="p-6 space-y-6">
                  {/* Cart Items */}
                  <div className="space-y-4">
                    <AnimatePresence>
                      {items.map((item, index) => (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -100 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4"
                        >
                          <div className="flex gap-4">
                            {/* Product Image */}
                            <div className="relative w-20 h-20 flex-shrink-0">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover rounded-md"
                              />
                              {item.discount && (
                                <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs">
                                  -{item.discount}%
                                </Badge>
                              )}
                            </div>

                            {/* Product Info */}
                            <div className="flex-1 space-y-2">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-medium text-gray-900 dark:text-white">
                                    {item.name}
                                  </h4>
                                  <p className="text-sm text-gray-500">{item.category}</p>
                                  {item.weight && (
                                    <p className="text-xs text-gray-400">{item.weight}</p>
                                  )}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeItem(item.id)}
                                  className="text-gray-400 hover:text-red-500"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>

                              {/* Features */}
                              <div className="flex gap-2">
                                {item.freeShipping && (
                                  <AnimatedBadge variant="success" icon={Truck}>
                                    ফ্রি শিপিং
                                  </AnimatedBadge>
                                )}
                                {item.expressDelivery && (
                                  <AnimatedBadge variant="warning" icon={Zap}>
                                    এক্সপ্রেস
                                  </AnimatedBadge>
                                )}
                              </div>

                              {/* Price & Quantity */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg font-bold text-green-600">
                                    ৳{item.price}
                                  </span>
                                  {item.originalPrice && item.originalPrice > item.price && (
                                    <span className="text-sm text-gray-500 line-through">
                                      ৳{item.originalPrice}
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-3">
                                  {/* Quantity Controls */}
                                  <div className="flex items-center gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                      disabled={item.quantity <= 1}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Minus className="h-3 w-3" />
                                    </Button>
                                    <span className="w-8 text-center font-medium">
                                      {item.quantity}
                                    </span>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                      disabled={item.maxQuantity ? item.quantity >= item.maxQuantity : false}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Plus className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>

                              {/* Quick Actions */}
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleSaveForLater(item.id)}
                                  className="text-xs"
                                >
                                  <Save className="h-3 w-3 mr-1" />
                                  পরে কিনব
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleMoveToWishlist(item)}
                                  className="text-xs"
                                >
                                  <Heart className="h-3 w-3 mr-1" />
                                  পছন্দের তালিকায়
                                </Button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  <Separator />

                  {/* Promo Code */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        প্রোমো কোড
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {appliedPromo ? (
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-green-800 dark:text-green-200">
                                {appliedPromo.code}
                              </p>
                              <p className="text-sm text-green-600 dark:text-green-300">
                                {appliedPromo.description}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setAppliedPromo(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Input
                            placeholder="প্রোমো কোড লিখুন"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                            className="flex-1"
                          />
                          <Button onClick={handleApplyPromo} variant="outline">
                            প্রয়োগ করুন
                          </Button>
                        </div>
                      )}

                      {/* Available Promo Codes */}
                      <div className="text-xs text-gray-500">
                        <p className="mb-1">উপলব্ধ কোড:</p>
                        <div className="flex flex-wrap gap-1">
                          {availablePromoCodes.map(promo => (
                            <button
                              key={promo.code}
                              onClick={() => setPromoCode(promo.code)}
                              className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            >
                              {promo.code}
                            </button>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Delivery Options */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        ডেলিভারি অপশন
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {deliveryOptions.map(option => {
                        const Icon = option.icon;
                        return (
                          <motion.div
                            key={option.id}
                            className={`
                              border rounded-lg p-3 cursor-pointer transition-all
                              ${selectedDelivery === option.id 
                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                              }
                            `}
                            onClick={() => setSelectedDelivery(option.id)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Icon className="h-5 w-5 text-green-600" />
                                <div>
                                  <p className="font-medium">{option.name}</p>
                                  <p className="text-sm text-gray-500">{option.description}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">৳{option.price}</p>
                                {selectedDelivery === option.id && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-4 h-4 bg-green-500 rounded-full ml-auto mt-1"
                                  />
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </CardContent>
                  </Card>

                  {/* Gift Wrap */}
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Gift className="h-5 w-5 text-pink-500" />
                          <div>
                            <p className="font-medium">গিফট র‌্যাপ</p>
                            <p className="text-sm text-gray-500">বিশেষ উপহারের জন্য</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">৳৫০</span>
                          <Checkbox
                            checked={giftWrap}
                            onCheckedChange={setGiftWrap}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Delivery Address */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        ডেলিভারি ঠিকানা
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Input
                        placeholder="মোবাইল নম্বর"
                        value={deliveryAddress.phone}
                        onChange={(e) => setDeliveryAddress(prev => ({ ...prev, phone: e.target.value }))}
                      />
                      <Input
                        placeholder="এলাকা (যেমন: ধানমন্ডি, গুলশান)"
                        value={deliveryAddress.area}
                        onChange={(e) => setDeliveryAddress(prev => ({ ...prev, area: e.target.value }))}
                      />
                      <Textarea
                        placeholder="সম্পূর্ণ ঠিকানা"
                        value={deliveryAddress.address}
                        onChange={(e) => setDeliveryAddress(prev => ({ ...prev, address: e.target.value }))}
                        rows={2}
                      />
                      <Textarea
                        placeholder="বিশেষ নির্দেশনা (ঐচ্ছিক)"
                        value={deliveryAddress.instructions}
                        onChange={(e) => setDeliveryAddress(prev => ({ ...prev, instructions: e.target.value }))}
                        rows={2}
                      />
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
                {/* Order Summary */}
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>সাবটোটাল ({getTotalItems()} টি পণ্য)</span>
                    <span>৳{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>ডেলিভারি চার্জ</span>
                    <span>৳{deliveryCharge}</span>
                  </div>
                  {giftWrap && (
                    <div className="flex justify-between text-sm">
                      <span>গিফট র‌্যাপ</span>
                      <span>৳{giftWrapCharge}</span>
                    </div>
                  )}
                  {appliedPromo && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>প্রোমো ছাড় ({appliedPromo.code})</span>
                      <span>-৳{discountAmount}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>মোট</span>
                    <span className="text-green-600">৳{total}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-base font-medium"
                    onClick={handleCheckout}
                    disabled={isCheckingOut || !deliveryAddress.phone || !deliveryAddress.address}
                  >
                    {isCheckingOut ? (
                      <LoadingDots />
                    ) : (
                      <>
                        <CreditCard className="h-5 w-5 mr-2" />
                        চেকআউট করুন
                        <ArrowRight className="h-5 w-5 ml-2" />
                      </>
                    )}
                  </Button>
                </motion.div>

                {/* Security Notice */}
                <p className="text-xs text-gray-500 text-center mt-3">
                  🔒 নিরাপদ পেমেন্ট | SSL এনক্রিপ্টেড
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}