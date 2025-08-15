'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { CouponType } from '@prisma/client';

interface AvailableCoupon {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: CouponType;
  value: number;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  validUntil: string;
  isPublic: boolean;
  autoApply: boolean;
  firstTimeOnly: boolean;
  userCoupons: Array<{
    id: string;
    usedCount: number;
    lastUsedAt?: string;
  }>;
}

export default function CouponsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [coupons, setCoupons] = useState<AvailableCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user || !session.user.email) {
      router.push('/auth/login');
      return;
    }
    fetchAvailableCoupons();
  }, [session, status]);

  const fetchAvailableCoupons = async () => {
    try {
      const response = await fetch('/api/coupons?type=available');
      if (!response.ok) throw new Error('Failed to fetch coupons');

      const data = await response.json();
      setCoupons(data);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  const getDiscountDisplay = (coupon: AvailableCoupon) => {
    if (coupon.type === CouponType.PERCENTAGE) {
      const maxDisplay = coupon.maxDiscountAmount 
        ? ` (সর্বোচ্চ ৳${coupon.maxDiscountAmount})`
        : '';
      return `${coupon.value}% ছাড়${maxDisplay}`;
    } else if (coupon.type === CouponType.FIXED_AMOUNT) {
      return `৳${coupon.value} ছাড়`;
    } else {
      return 'ফ্রি ডেলিভারি';
    }
  };

  const getDiscountColor = (type: CouponType) => {
    switch (type) {
      case CouponType.PERCENTAGE:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case CouponType.FIXED_AMOUNT:
        return 'bg-green-100 text-green-800 border-green-200';
      case CouponType.FREE_SHIPPING:
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCurrency = (amount: number) => `৳${amount.toFixed(2)}`;

  const isExpiringSoon = (validUntil: string) => {
    const daysUntilExpiry = Math.ceil(
      (new Date(validUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= 7;
  };

  const getDaysUntilExpiry = (validUntil: string) => {
    return Math.ceil(
      (new Date(validUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">উপলব্ধ কুপন</h1>
        <p className="text-gray-600">
          আপনার অর্ডারে বিশেষ ছাড় পেতে এই কুপনগুলি ব্যবহার করুন
        </p>
      </div>

      {coupons.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">কোনো কুপন উপলব্ধ নেই</h3>
          <p className="text-gray-500 mb-6">
            বর্তমানে আপনার জন্য কোনো কুপন উপলব্ধ নেই। শীঘ্রই নতুন অফার আসবে!
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors"
          >
            কেনাকাটা চালিয়ে যান
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coupons.map((coupon) => {
            const userUsage = coupon.userCoupons[0];
            const daysLeft = getDaysUntilExpiry(coupon.validUntil);
            const isExpiring = isExpiringSoon(coupon.validUntil);

            return (
              <div
                key={coupon.id}
                className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${
                  isExpiring ? 'ring-2 ring-orange-200' : ''
                }`}
              >
                {/* Header */}
                <div className={`p-4 ${getDiscountColor(coupon.type)} border-b`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold">{coupon.name}</h3>
                      <p className="text-sm opacity-80">
                        {getDiscountDisplay(coupon)}
                      </p>
                    </div>
                    {isExpiring && (
                      <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                        {daysLeft}দিন বাকি
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  {coupon.description && (
                    <p className="text-gray-600 text-sm mb-3">{coupon.description}</p>
                  )}

                  {/* Conditions */}
                  <div className="space-y-2 mb-4">
                    {coupon.minOrderValue && (
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        সর্বনিম্ন অর্ডার: {formatCurrency(coupon.minOrderValue)}
                      </div>
                    )}

                    {coupon.firstTimeOnly && (
                      <div className="flex items-center text-sm text-blue-600">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        শুধুমাত্র নতুন গ্রাহকদের জন্য
                      </div>
                    )}

                    {coupon.autoApply && (
                      <div className="flex items-center text-sm text-green-600">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        স্বয়ংক্রিয়ভাবে প্রয়োগ হবে
                      </div>
                    )}
                  </div>

                  {/* Usage Info */}
                  {userUsage && (
                    <div className="bg-gray-50 rounded-md p-3 mb-4">
                      <p className="text-sm text-gray-600">
                        আপনি এই কুপনটি <span className="font-medium">{userUsage.usedCount}</span> বার ব্যবহার করেছেন
                      </p>
                      {userUsage.lastUsedAt && (
                        <p className="text-xs text-gray-500 mt-1">
                          শেষ ব্যবহার: {new Date(userUsage.lastUsedAt).toLocaleDateString('bn-BD')}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Coupon Code */}
                  <div className="border-2 border-dashed border-gray-300 rounded-md p-3 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">কুপন কোড</p>
                        <p className="text-lg font-mono font-bold text-gray-900">{coupon.code}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(coupon.code)}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                          copiedCode === coupon.code
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {copiedCode === coupon.code ? (
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            কপি হয়েছে
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            কপি করুন
                          </div>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expiry */}
                  <div className="mt-3 text-center">
                    <p className={`text-sm ${
                      isExpiring ? 'text-orange-600 font-medium' : 'text-gray-500'
                    }`}>
                      মেয়াদ শেষ: {new Date(coupon.validUntil).toLocaleDateString('bn-BD')}
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-4 py-3">
                  <button
                    onClick={() => {
                      copyToClipboard(coupon.code);
                      router.push('/checkout');
                    }}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors font-medium"
                  >
                    এখনই ব্যবহার করুন
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tips */}
      <div className="mt-12 bg-blue-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-3">কুপন ব্যবহারের টিপস</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div className="flex items-start">
            <svg className="w-5 h-5 mr-2 mt-0.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            চেকআউটের সময় কুপন কোড প্রয়োগ করুন
          </div>
          <div className="flex items-start">
            <svg className="w-5 h-5 mr-2 mt-0.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            কিছু কুপন স্বয়ংক্রিয়ভাবে প্রয়োগ হবে
          </div>
          <div className="flex items-start">
            <svg className="w-5 h-5 mr-2 mt-0.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            মেয়াদ শেষ হওয়ার আগে ব্যবহার করুন
          </div>
          <div className="flex items-start">
            <svg className="w-5 h-5 mr-2 mt-0.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            সর্বনিম্ন অর্ডার মূল্যের শর্ত মেনে চলুন
          </div>
        </div>
      </div>
    </div>
  );
}