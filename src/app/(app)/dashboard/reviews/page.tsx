'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Star, Edit, Trash2, ShoppingBag, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';

interface UserReview {
  id: string;
  rating: number;
  title?: string;
  comment: string;
  pros: string[];
  cons: string[];
  images: string[];
  isVerifiedPurchase: boolean;
  isHelpful: number;
  createdAt: string;
  updatedAt: string;
  product: {
    id: string;
    name: string;
    image: string;
    price: number;
  };
}

interface ReviewableProduct {
  orderId: string;
  orderNumber: string;
  deliveredAt: string;
  product: {
    id: string;
    name: string;
    image: string;
    price: number;
  };
}

export default function UserReviewsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [reviewableProducts, setReviewableProducts] = useState<ReviewableProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'reviews' | 'reviewable'>('reviews');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user || !session.user.email) {
      router.push('/auth/login');
      return;
    }
    fetchUserData();
  }, [session, status, currentPage, activeTab]);

  const fetchUserData = async () => {
    if (!session?.user?.email) return;

    try {
      const userId = await getUserId();
      if (!userId) return;

      if (activeTab === 'reviews') {
        await fetchUserReviews(userId);
      } else {
        await fetchReviewableProducts();
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserId = async () => {
    try {
      const response = await fetch('/api/users/profile');
      if (response.ok) {
        const data = await response.json();
        return data.id;
      }
    } catch (error) {
      console.error('Error getting user ID:', error);
    }
    return null;
  };

  const fetchUserReviews = async (userId: string) => {
    try {
      const response = await fetch(`/api/reviews?userId=${userId}&page=${currentPage}&limit=10`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching user reviews:', error);
    }
  };

  const fetchReviewableProducts = async () => {
    try {
      const response = await fetch('/api/reviews/reviewable');
      if (response.ok) {
        const data = await response.json();
        setReviewableProducts(data);
      }
    } catch (error) {
      console.error('Error fetching reviewable products:', error);
    }
  };

  const deleteReview = async (reviewId: string) => {
    if (!confirm('আপনি কি এই রিভিউটি মুছে ফেলতে চান?')) return;

    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setReviews(reviews.filter(r => r.id !== reviewId));
        alert('রিভিউ মুছে ফেলা হয়েছে');
      } else {
        alert('রিভিউ মুছতে সমস্যা হয়েছে');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('রিভিউ মুছতে সমস্যা হয়েছে');
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const formatCurrency = (amount: number) => `৳${amount.toFixed(2)}`;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bn-BD');
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">আমার রিভিউ</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'reviews'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            আমার রিভিউ ({reviews.length})
          </button>
          <button
            onClick={() => setActiveTab('reviewable')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'reviewable'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            রিভিউ করার জন্য ({reviewableProducts.length})
          </button>
        </nav>
      </div>

      {/* Reviews Tab */}
      {activeTab === 'reviews' && (
        <div>
          {reviews.length === 0 ? (
            <div className="text-center py-12">
              <Star className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                কোনো রিভিউ নেই
              </h3>
              <p className="text-gray-600 mb-6">
                আপনি এখনো কোনো পণ্যের রিভিউ লেখেননি
              </p>
              <Button onClick={() => setActiveTab('reviewable')}>
                রিভিউ লেখার জন্য পণ্য দেখুন
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white border border-gray-200 rounded-lg p-6">
                  {/* Product Info */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <Image
                        src={review.product.image || '/placeholder-product.jpg'}
                        alt={review.product.name}
                        fill
                        className="object-cover rounded"
                        sizes="64px"
                      />
                    </div>
                    <div className="flex-1">
                      <Link
                        href={`/products/${review.product.id}`}
                        className="text-lg font-medium text-gray-900 hover:text-green-600"
                      >
                        {review.product.name}
                      </Link>
                      <p className="text-gray-600">{formatCurrency(review.product.price)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => router.push(`/dashboard/reviews/edit/${review.id}`)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteReview(review.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Review Content */}
                  <div className="space-y-3">
                    {/* Rating and Date */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {renderStars(review.rating)}
                        {review.isVerifiedPurchase && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                            যাচাইকৃত ক্রয়
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(review.createdAt)}
                        {review.updatedAt !== review.createdAt && (
                          <span className="ml-2">(সম্পাদিত)</span>
                        )}
                      </div>
                    </div>

                    {/* Title */}
                    {review.title && (
                      <h3 className="font-medium text-gray-900">{review.title}</h3>
                    )}

                    {/* Comment */}
                    <p className="text-gray-700">{review.comment}</p>

                    {/* Pros & Cons */}
                    {(review.pros.length > 0 || review.cons.length > 0) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        {review.pros.length > 0 && (
                          <div>
                            <h4 className="font-medium text-green-600 mb-1">ভালো দিক:</h4>
                            <ul className="text-sm text-gray-700 space-y-1">
                              {review.pros.map((pro, index) => (
                                <li key={index}>• {pro}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {review.cons.length > 0 && (
                          <div>
                            <h4 className="font-medium text-red-600 mb-1">খারাপ দিক:</h4>
                            <ul className="text-sm text-gray-700 space-y-1">
                              {review.cons.map((con, index) => (
                                <li key={index}>• {con}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Helpful Count */}
                    {review.isHelpful > 0 && (
                      <div className="text-sm text-gray-600">
                        {review.isHelpful} জন এই রিভিউটি উপকারী বলেছেন
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded ${
                      page === currentPage
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reviewable Products Tab */}
      {activeTab === 'reviewable' && (
        <div>
          {reviewableProducts.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                রিভিউ করার জন্য কোনো পণ্য নেই
              </h3>
              <p className="text-gray-600 mb-6">
                রিভিউ লেখার জন্য প্রথমে কিছু পণ্য কিনুন এবং ডেলিভারি নিন
              </p>
              <Button asChild>
                <Link href="/shop">কেনাকাটা করুন</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {reviewableProducts.map((item) => (
                <div key={`${item.orderId}-${item.product.id}`} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <Image
                        src={item.product.image || '/placeholder-product.jpg'}
                        alt={item.product.name}
                        fill
                        className="object-cover rounded"
                        sizes="64px"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">
                        {item.product.name}
                      </h3>
                      <p className="text-gray-600">{formatCurrency(item.product.price)}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <ShoppingBag className="w-4 h-4" />
                          অর্ডার #{item.orderNumber}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          ডেলিভারি: {formatDate(item.deliveredAt)}
                        </span>
                      </div>
                    </div>
                    <Button asChild>
                      <Link href={`/products/${item.product.id}#reviews`}>
                        রিভিউ লিখুন
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}