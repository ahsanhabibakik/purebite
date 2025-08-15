'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { CouponType } from '@prisma/client';

interface CouponDetails {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: CouponType;
  value: number;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  maxUses?: number;
  maxUsesPerUser?: number;
  usedCount: number;
  isActive: boolean;
  isPublic: boolean;
  autoApply: boolean;
  stackable: boolean;
  validFrom: string;
  validUntil: string;
  applicableProducts: string[];
  excludedProducts: string[];
  applicableCategories: string[];
  firstTimeOnly: boolean;
  createdAt: string;
  updatedAt: string;
  userCoupons: Array<{
    id: string;
    usedCount: number;
    lastUsedAt?: string;
    user: {
      id: string;
      name?: string;
      email: string;
    };
  }>;
  orders: Array<{
    id: string;
    orderNumber: string;
    total: number;
    discount: number;
    createdAt: string;
    user: {
      name?: string;
      email: string;
    };
  }>;
}

export default function CouponDetailsPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [coupon, setCoupon] = useState<CouponDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<CouponDetails>>({});

  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user || !session.user.email) {
      router.push('/auth/login');
      return;
    }
    fetchCoupon();
  }, [session, status, params.id]);

  const fetchCoupon = async () => {
    try {
      const response = await fetch(`/api/coupons/${params.id}`);
      if (!response.ok) {
        if (response.status === 404) {
          router.push('/admin/coupons');
          return;
        }
        throw new Error('Failed to fetch coupon');
      }

      const data = await response.json();
      setCoupon(data);
      setFormData(data);
    } catch (error) {
      console.error('Error fetching coupon:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coupon) return;

    try {
      const response = await fetch(`/api/coupons/${coupon.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'কুপন আপডেট করতে ব্যর্থ');
      }

      const updatedCoupon = await response.json();
      setCoupon(updatedCoupon);
      setFormData(updatedCoupon);
      setEditing(false);
      alert('কুপন সফলভাবে আপডেট হয়েছে');
    } catch (error) {
      console.error('Error updating coupon:', error);
      alert(error instanceof Error ? error.message : 'কুপন আপডেট করতে ব্যর্থ');
    }
  };

  const deleteCoupon = async () => {
    if (!coupon || !confirm('আপনি কি এই কুপনটি মুছে ফেলতে চান?')) return;

    try {
      const response = await fetch(`/api/coupons/${coupon.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete coupon');

      router.push('/admin/coupons');
    } catch (error) {
      console.error('Error deleting coupon:', error);
      alert('কুপন মুছতে ব্যর্থ');
    }
  };

  const formatCurrency = (amount: number) => `৳${amount.toFixed(2)}`;

  const getDiscountDisplay = (coupon: CouponDetails) => {
    if (coupon.type === CouponType.PERCENTAGE) {
      return `${coupon.value}%`;
    } else if (coupon.type === CouponType.FIXED_AMOUNT) {
      return formatCurrency(coupon.value);
    } else {
      return 'Free Shipping';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!coupon) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">কুপন পাওয়া যায়নি</h1>
          <button
            onClick={() => router.push('/admin/coupons')}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            কুপন তালিকায় ফিরে যান
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">কুপনের বিস্তারিত</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => router.push('/admin/coupons')}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
          >
            ফিরে যান
          </button>
          <button
            onClick={() => setEditing(!editing)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            {editing ? 'বাতিল' : 'এডিট'}
          </button>
          <button
            onClick={deleteCoupon}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            মুছুন
          </button>
        </div>
      </div>

      {editing ? (
        <form onSubmit={handleUpdate} className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                কুপন কোড
              </label>
              <input
                type="text"
                value={formData.code || ''}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                নাম
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                বিবরণ
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ধরন
              </label>
              <select
                value={formData.type || CouponType.PERCENTAGE}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as CouponType })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value={CouponType.PERCENTAGE}>শতাংশ ছাড়</option>
                <option value={CouponType.FIXED_AMOUNT}>নির্দিষ্ট ছাড়</option>
                <option value={CouponType.FREE_SHIPPING}>ফ্রি ডেলিভারি</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                মান
              </label>
              <input
                type="number"
                value={formData.value || 0}
                onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                সর্বনিম্ন অর্ডার মূল্য
              </label>
              <input
                type="number"
                value={formData.minOrderValue || ''}
                onChange={(e) => setFormData({ ...formData, minOrderValue: parseFloat(e.target.value) || undefined })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                সর্বোচ্চ ছাড়ের পরিমাণ
              </label>
              <input
                type="number"
                value={formData.maxDiscountAmount || ''}
                onChange={(e) => setFormData({ ...formData, maxDiscountAmount: parseFloat(e.target.value) || undefined })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive || false}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="mr-2"
              />
              সক্রিয়
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isPublic || false}
                onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                className="mr-2"
              />
              পাবলিক
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.autoApply || false}
                onChange={(e) => setFormData({ ...formData, autoApply: e.target.checked })}
                className="mr-2"
              />
              অটো প্রয়োগ
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.firstTimeOnly || false}
                onChange={(e) => setFormData({ ...formData, firstTimeOnly: e.target.checked })}
                className="mr-2"
              />
              শুধু নতুন গ্রাহক
            </label>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              আপডেট করুন
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">কুপন কোড</h3>
              <p className="text-lg font-semibold text-gray-900">{coupon.code}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">নাম</h3>
              <p className="text-lg text-gray-900">{coupon.name}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">ধরন</h3>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                coupon.type === CouponType.PERCENTAGE
                  ? 'bg-blue-100 text-blue-800'
                  : coupon.type === CouponType.FIXED_AMOUNT
                  ? 'bg-green-100 text-green-800'
                  : 'bg-purple-100 text-purple-800'
              }`}>
                {coupon.type === CouponType.PERCENTAGE
                  ? 'শতাংশ ছাড়'
                  : coupon.type === CouponType.FIXED_AMOUNT
                  ? 'নির্দিষ্ট ছাড়'
                  : 'ফ্রি শিপিং'
                }
              </span>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">ছাড়ের পরিমাণ</h3>
              <p className="text-lg font-semibold text-green-600">{getDiscountDisplay(coupon)}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">ব্যবহার</h3>
              <p className="text-lg text-gray-900">
                {coupon.usedCount}{coupon.maxUses && ` / ${coupon.maxUses}`}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">স্ট্যাটাস</h3>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                coupon.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {coupon.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
              </span>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">মেয়াদ</h3>
              <p className="text-sm text-gray-900">
                {new Date(coupon.validFrom).toLocaleDateString('bn-BD')} থেকে{' '}
                {new Date(coupon.validUntil).toLocaleDateString('bn-BD')}
              </p>
            </div>

            {coupon.minOrderValue && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">সর্বনিম্ন অর্ডার</h3>
                <p className="text-lg text-gray-900">{formatCurrency(coupon.minOrderValue)}</p>
              </div>
            )}

            {coupon.maxDiscountAmount && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">সর্বোচ্চ ছাড়</h3>
                <p className="text-lg text-gray-900">{formatCurrency(coupon.maxDiscountAmount)}</p>
              </div>
            )}
          </div>

          {coupon.description && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">বিবরণ</h3>
              <p className="text-gray-900">{coupon.description}</p>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-2">
            {coupon.isPublic && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                পাবলিক
              </span>
            )}
            {coupon.autoApply && (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                অটো প্রয়োগ
              </span>
            )}
            {coupon.stackable && (
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                স্ট্যাকেবল
              </span>
            )}
            {coupon.firstTimeOnly && (
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                শুধু নতুন গ্রাহক
              </span>
            )}
          </div>
        </div>
      )}

      {/* Usage Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Usage */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">ব্যবহারকারীদের ব্যবহার</h2>
          {coupon.userCoupons.length > 0 ? (
            <div className="space-y-3">
              {coupon.userCoupons.slice(0, 10).map((userCoupon) => (
                <div key={userCoupon.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium text-gray-900">
                      {userCoupon.user.name || userCoupon.user.email}
                    </p>
                    <p className="text-sm text-gray-500">{userCoupon.user.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{userCoupon.usedCount} বার</p>
                    {userCoupon.lastUsedAt && (
                      <p className="text-sm text-gray-500">
                        {new Date(userCoupon.lastUsedAt).toLocaleDateString('bn-BD')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">এখনো কেউ এই কুপন ব্যবহার করেনি</p>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">সাম্প্রতিক অর্ডার</h2>
          {coupon.orders.length > 0 ? (
            <div className="space-y-3">
              {coupon.orders.slice(0, 10).map((order) => (
                <div key={order.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium text-gray-900">#{order.orderNumber}</p>
                    <p className="text-sm text-gray-500">
                      {order.user.name || order.user.email}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{formatCurrency(order.total)}</p>
                    <p className="text-sm text-green-600">ছাড়: {formatCurrency(order.discount)}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('bn-BD')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">এই কুপন দিয়ে এখনো কোনো অর্ডার হয়নি</p>
          )}
        </div>
      </div>
    </div>
  );
}