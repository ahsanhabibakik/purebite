'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { CouponType } from '@prisma/client';

interface Coupon {
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
  _count: {
    userCoupons: number;
    orders: number;
  };
}

interface CouponsResponse {
  coupons: Coupon[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function AdminCouponsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<CouponType | ''>('');
  const [filterActive, setFilterActive] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [bulkCreateMode, setBulkCreateMode] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user || !session.user.email) {
      router.push('/auth/login');
      return;
    }
    fetchCoupons();
  }, [session, status, currentPage, searchTerm, filterType, filterActive]);

  const fetchCoupons = async () => {
    try {
      const params = new URLSearchParams({
        type: 'all',
        page: currentPage.toString(),
        limit: '20',
      });

      if (searchTerm) params.append('search', searchTerm);
      if (filterType) params.append('couponType', filterType);
      if (filterActive) params.append('isActive', filterActive);

      const response = await fetch(`/api/coupons?${params}`);
      if (!response.ok) throw new Error('Failed to fetch coupons');

      const data: CouponsResponse = await response.json();
      setCoupons(data.coupons);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteCoupon = async (couponId: string) => {
    if (!confirm('আপনি কি এই কুপনটি মুছে ফেলতে চান?')) return;

    try {
      const response = await fetch(`/api/coupons/${couponId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete coupon');

      setCoupons(coupons.filter(c => c.id !== couponId));
    } catch (error) {
      console.error('Error deleting coupon:', error);
      alert('কুপন মুছতে ব্যর্থ');
    }
  };

  const toggleCouponStatus = async (couponId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/coupons/${couponId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (!response.ok) throw new Error('Failed to update coupon');

      setCoupons(coupons.map(c => 
        c.id === couponId ? { ...c, isActive: !isActive } : c
      ));
    } catch (error) {
      console.error('Error updating coupon:', error);
    }
  };

  const formatCurrency = (amount: number) => `৳${amount.toFixed(2)}`;

  const getDiscountDisplay = (coupon: Coupon) => {
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">কুপন ব্যবস্থাপনা</h1>
        
        {/* Filters and Search */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <input
              type="text"
              placeholder="কুপন খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2"
            />
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as CouponType | '')}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">সব ধরনের</option>
              <option value={CouponType.PERCENTAGE}>শতাংশ ছাড়</option>
              <option value={CouponType.FIXED_AMOUNT}>নির্দিষ্ট ছাড়</option>
              <option value={CouponType.FREE_SHIPPING}>ফ্রি ডেলিভারি</option>
            </select>

            <select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">সব স্ট্যাটাস</option>
              <option value="true">সক্রিয়</option>
              <option value="false">নিষ্ক্রিয়</option>
            </select>

            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              নতুন কুপন তৈরি করুন
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setBulkCreateMode(false)}
              className={`px-4 py-2 rounded-md ${!bulkCreateMode ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
            >
              একক কুপন
            </button>
            <button
              onClick={() => setBulkCreateMode(true)}
              className={`px-4 py-2 rounded-md ${bulkCreateMode ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
            >
              বাল্ক কুপন
            </button>
          </div>
        </div>

        {/* Coupons Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    কুপন কোড
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    নাম
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ধরন
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ছাড়
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ব্যবহার
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    মেয়াদ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    স্ট্যাটাস
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    অ্যাকশন
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{coupon.code}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{coupon.name}</div>
                      {coupon.description && (
                        <div className="text-sm text-gray-500">{coupon.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        coupon.type === CouponType.PERCENTAGE
                          ? 'bg-blue-100 text-blue-800'
                          : coupon.type === CouponType.FIXED_AMOUNT
                          ? 'bg-green-100 text-green-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {coupon.type === CouponType.PERCENTAGE
                          ? 'শতাংশ'
                          : coupon.type === CouponType.FIXED_AMOUNT
                          ? 'নির্দিষ্ট'
                          : 'ফ্রি শিপিং'
                        }
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getDiscountDisplay(coupon)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {coupon.usedCount}
                      {coupon.maxUses && ` / ${coupon.maxUses}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(coupon.validUntil).toLocaleDateString('bn-BD')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        coupon.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {coupon.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => router.push(`/admin/coupons/${coupon.id}`)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          দেখুন
                        </button>
                        <button
                          onClick={() => toggleCouponStatus(coupon.id, coupon.isActive)}
                          className={`${
                            coupon.isActive 
                              ? 'text-red-600 hover:text-red-900' 
                              : 'text-green-600 hover:text-green-900'
                          }`}
                        >
                          {coupon.isActive ? 'নিষ্ক্রিয়' : 'সক্রিয়'}
                        </button>
                        <button
                          onClick={() => deleteCoupon(coupon.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          মুছুন
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  আগের
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  পরের
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    পৃষ্ঠা <span className="font-medium">{currentPage}</span> of{' '}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === currentPage
                            ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Coupon Modal */}
      {showCreateModal && (
        <CreateCouponModal
          bulkMode={bulkCreateMode}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchCoupons();
          }}
        />
      )}
    </div>
  );
}

interface CreateCouponModalProps {
  bulkMode: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function CreateCouponModal({ bulkMode, onClose, onSuccess }: CreateCouponModalProps) {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    type: CouponType.PERCENTAGE,
    value: 0,
    minOrderValue: '',
    maxDiscountAmount: '',
    maxUses: '',
    maxUsesPerUser: '',
    isPublic: false,
    autoApply: false,
    stackable: false,
    validFrom: '',
    validUntil: '',
    applicableCategories: '',
    firstTimeOnly: false,
    bulkCount: 1,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        minOrderValue: formData.minOrderValue ? parseFloat(formData.minOrderValue) : undefined,
        maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : undefined,
        maxUses: formData.maxUses ? parseInt(formData.maxUses) : undefined,
        maxUsesPerUser: formData.maxUsesPerUser ? parseInt(formData.maxUsesPerUser) : undefined,
        applicableCategories: formData.applicableCategories 
          ? formData.applicableCategories.split(',').map(s => s.trim()).filter(Boolean)
          : [],
        bulkCount: bulkMode ? formData.bulkCount : undefined,
      };

      const response = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'কুপন তৈরি করতে ব্যর্থ');
      }

      onSuccess();
    } catch (error) {
      console.error('Error creating coupon:', error);
      alert(error instanceof Error ? error.message : 'কুপন তৈরি করতে ব্যর্থ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {bulkMode ? 'বাল্ক কুপন তৈরি করুন' : 'নতুন কুপন তৈরি করুন'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                কুপন কোড *
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
                placeholder={bulkMode ? "BULK (prefix)" : "SAVE10"}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                নাম *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                বিবরণ
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ধরন *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as CouponType })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              >
                <option value={CouponType.PERCENTAGE}>শতাংশ ছাড়</option>
                <option value={CouponType.FIXED_AMOUNT}>নির্দিষ্ট ছাড়</option>
                <option value={CouponType.FREE_SHIPPING}>ফ্রি ডেলিভারি</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                মান *
              </label>
              <input
                type="number"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
                min="0"
                step="0.01"
                placeholder={formData.type === CouponType.PERCENTAGE ? "10" : "100"}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                সর্বনিম্ন অর্ডার মূল্য
              </label>
              <input
                type="number"
                value={formData.minOrderValue}
                onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                সর্বোচ্চ ছাড়ের পরিমাণ
              </label>
              <input
                type="number"
                value={formData.maxDiscountAmount}
                onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                মেয়াদ শুরু *
              </label>
              <input
                type="datetime-local"
                value={formData.validFrom}
                onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                মেয়াদ শেষ *
              </label>
              <input
                type="datetime-local"
                value={formData.validUntil}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>

            {bulkMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  কুপনের সংখ্যা *
                </label>
                <input
                  type="number"
                  value={formData.bulkCount}
                  onChange={(e) => setFormData({ ...formData, bulkCount: parseInt(e.target.value) || 1 })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                  min="1"
                  max="1000"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isPublic}
                onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                className="mr-2"
              />
              পাবলিক
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.autoApply}
                onChange={(e) => setFormData({ ...formData, autoApply: e.target.checked })}
                className="mr-2"
              />
              অটো প্রয়োগ
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.stackable}
                onChange={(e) => setFormData({ ...formData, stackable: e.target.checked })}
                className="mr-2"
              />
              স্ট্যাকেবল
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.firstTimeOnly}
                onChange={(e) => setFormData({ ...formData, firstTimeOnly: e.target.checked })}
                className="mr-2"
              />
              শুধু নতুন গ্রাহক
            </label>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'তৈরি হচ্ছে...' : (bulkMode ? 'বাল্ক কুপন তৈরি করুন' : 'কুপন তৈরি করুন')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}