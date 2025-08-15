'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Star, ThumbsUp, ThumbsDown, Flag, Plus, Minus, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface Review {
  id: string;
  userId: string;
  rating: number;
  title?: string;
  comment: string;
  pros: string[];
  cons: string[];
  images: string[];
  isVerifiedPurchase: boolean;
  isHelpful: number;
  createdAt: string;
  user: {
    id: string;
    name?: string;
    email: string;
  };
  helpful: Array<{
    id: string;
    userId: string;
    isHelpful: boolean;
  }>;
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  verifiedPurchases: number;
  helpfulReviews: number;
}

interface ReviewSectionProps {
  productId: string;
}

export default function ReviewSection({ productId }: ReviewSectionProps) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [filters, setFilters] = useState({
    rating: '',
    verifiedOnly: false,
    sortBy: 'newest',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchReviews();
    fetchStats();
  }, [productId, filters, currentPage]);

  const fetchReviews = async () => {
    try {
      const params = new URLSearchParams({
        productId,
        page: currentPage.toString(),
        limit: '10',
        ...filters,
      });

      if (filters.rating) params.append('rating', filters.rating);
      if (filters.verifiedOnly) params.append('verifiedOnly', 'true');
      params.append('sortBy', filters.sortBy);

      const response = await fetch(`/api/reviews?${params}`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/reviews/stats?productId=${productId}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching review stats:', error);
    }
  };

  const markHelpful = async (reviewId: string, isHelpful: boolean) => {
    if (!session?.user) {
      alert('লগইন করুন');
      return;
    }

    try {
      const response = await fetch('/api/reviews/helpful', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, isHelpful }),
      });

      if (response.ok) {
        fetchReviews(); // Refresh reviews to update helpful counts
      }
    } catch (error) {
      console.error('Error marking review as helpful:', error);
    }
  };

  const reportReview = async (reviewId: string, reason: string) => {
    if (!session?.user) {
      alert('লগইন করুন');
      return;
    }

    const comment = prompt('রিপোর্টের কারণ বিস্তারিত লিখুন (ঐচ্ছিক):');
    
    try {
      const response = await fetch('/api/reviews/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, reason, comment }),
      });

      if (response.ok) {
        alert('রিভিউ রিপোর্ট করা হয়েছে');
      }
    } catch (error) {
      console.error('Error reporting review:', error);
    }
  };

  const renderStars = (rating: number, size = 'w-4 h-4') => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const renderRatingDistribution = () => {
    if (!stats) return null;

    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution];
          const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
          
          return (
            <div key={rating} className="flex items-center gap-2 text-sm">
              <span className="w-8">{rating}</span>
              <Star className="w-3 h-3 text-yellow-400 fill-current" />
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-8 text-gray-600">{count}</span>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="mt-16">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
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
    <div className="mt-16">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">গ্রাহক রিভিউ</h2>

      {/* Review Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Overall Rating */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {stats?.averageRating.toFixed(1) || '0.0'}
            </div>
            {renderStars(stats?.averageRating || 0, 'w-6 h-6')}
            <div className="text-sm text-gray-600 mt-2">
              {stats?.totalReviews || 0}টি রিভিউ
            </div>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-medium text-gray-900 mb-4">রেটিং বিতরণ</h3>
          {renderRatingDistribution()}
        </div>

        {/* Quick Stats */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-medium text-gray-900 mb-4">পরিসংখ্যান</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>যাচাইকৃত ক্রয়:</span>
              <span>{stats?.verifiedPurchases || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>উপকারী রিভিউ:</span>
              <span>{stats?.helpfulReviews || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Write Review Button */}
      {session?.user && (
        <div className="mb-6">
          <Button
            onClick={() => setShowWriteReview(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            রিভিউ লিখুন
          </Button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <select
          value={filters.rating}
          onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
          className="border border-gray-300 rounded px-3 py-1 text-sm"
        >
          <option value="">সব রেটিং</option>
          <option value="5">৫ স্টার</option>
          <option value="4">৪ স্টার</option>
          <option value="3">৩ স্টার</option>
          <option value="2">২ স্টার</option>
          <option value="1">১ স্টার</option>
        </select>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={filters.verifiedOnly}
            onChange={(e) => setFilters({ ...filters, verifiedOnly: e.target.checked })}
          />
          শুধু যাচাইকৃত ক্রয়
        </label>

        <select
          value={filters.sortBy}
          onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
          className="border border-gray-300 rounded px-3 py-1 text-sm"
        >
          <option value="newest">নতুন আগে</option>
          <option value="oldest">পুরাতন আগে</option>
          <option value="rating_high">রেটিং (বেশি)</option>
          <option value="rating_low">রেটিং (কম)</option>
          <option value="helpful">উপকারী</option>
        </select>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <Star className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              এখনো কোনো রিভিউ নেই
            </h3>
            <p className="text-gray-600">
              প্রথম রিভিউ লিখে অন্যদের সাহায্য করুন
            </p>
          </div>
        ) : (
          reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              currentUserId={session?.user?.email}
              onMarkHelpful={markHelpful}
              onReport={reportReview}
            />
          ))
        )}
      </div>

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

      {/* Write Review Modal */}
      {showWriteReview && (
        <WriteReviewModal
          productId={productId}
          onClose={() => setShowWriteReview(false)}
          onSubmit={() => {
            setShowWriteReview(false);
            fetchReviews();
            fetchStats();
          }}
        />
      )}
    </div>
  );
}

interface ReviewCardProps {
  review: Review;
  currentUserId?: string;
  onMarkHelpful: (reviewId: string, isHelpful: boolean) => void;
  onReport: (reviewId: string, reason: string) => void;
}

function ReviewCard({ review, currentUserId, onMarkHelpful, onReport }: ReviewCardProps) {
  const [showFullComment, setShowFullComment] = useState(false);
  const [showReportMenu, setShowReportMenu] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bn-BD');
  };

  const getUserDisplayName = () => {
    if (review.user.name) return review.user.name;
    // Hide email for privacy, show only first part
    const emailParts = review.user.email.split('@');
    return emailParts[0].substring(0, 3) + '***';
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

  return (
    <div className="border border-gray-200 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-green-600 font-medium">
              {getUserDisplayName().charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">{getUserDisplayName()}</span>
              {review.isVerifiedPurchase && (
                <div className="flex items-center gap-1 text-green-600 text-xs">
                  <CheckCircle className="w-3 h-3" />
                  যাচাইকৃত ক্রয়
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              {renderStars(review.rating)}
              <span className="text-sm text-gray-500">{formatDate(review.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Report Button */}
        {currentUserId && currentUserId !== review.user.email && (
          <div className="relative">
            <button
              onClick={() => setShowReportMenu(!showReportMenu)}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <Flag className="w-4 h-4" />
            </button>
            {showReportMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                <div className="py-1">
                  <button
                    onClick={() => {
                      onReport(review.id, 'SPAM');
                      setShowReportMenu(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    স্প্যাম
                  </button>
                  <button
                    onClick={() => {
                      onReport(review.id, 'INAPPROPRIATE');
                      setShowReportMenu(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    অনুপযুক্ত
                  </button>
                  <button
                    onClick={() => {
                      onReport(review.id, 'FAKE');
                      setShowReportMenu(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    ভুয়া রিভিউ
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Title */}
      {review.title && (
        <h3 className="font-medium text-gray-900 mb-2">{review.title}</h3>
      )}

      {/* Comment */}
      <div className="text-gray-700 mb-4">
        {showFullComment || review.comment.length <= 200 ? (
          <p>{review.comment}</p>
        ) : (
          <div>
            <p>{review.comment.substring(0, 200)}...</p>
            <button
              onClick={() => setShowFullComment(true)}
              className="text-green-600 hover:text-green-700 text-sm mt-1"
            >
              আরও পড়ুন
            </button>
          </div>
        )}
      </div>

      {/* Pros & Cons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {review.pros.length > 0 && (
          <div>
            <h4 className="font-medium text-green-600 mb-2 flex items-center gap-1">
              <Plus className="w-4 h-4" />
              ভালো দিক
            </h4>
            <ul className="text-sm text-gray-700 space-y-1">
              {review.pros.map((pro, index) => (
                <li key={index}>• {pro}</li>
              ))}
            </ul>
          </div>
        )}

        {review.cons.length > 0 && (
          <div>
            <h4 className="font-medium text-red-600 mb-2 flex items-center gap-1">
              <Minus className="w-4 h-4" />
              খারাপ দিক
            </h4>
            <ul className="text-sm text-gray-700 space-y-1">
              {review.cons.map((con, index) => (
                <li key={index}>• {con}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Images */}
      {review.images.length > 0 && (
        <div className="mb-4">
          <div className="grid grid-cols-3 gap-2">
            {review.images.slice(0, 3).map((image, index) => (
              <div key={index} className="relative aspect-square">
                <Image
                  src={image}
                  alt={`রিভিউ ছবি ${index + 1}`}
                  fill
                  className="object-cover rounded"
                  sizes="(max-width: 768px) 33vw, 100px"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Helpful Actions */}
      <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
        <span className="text-sm text-gray-600">এই রিভিউটি কি উপকারী?</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onMarkHelpful(review.id, true)}
            disabled={!currentUserId || currentUserId === review.user.email}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ThumbsUp className="w-4 h-4" />
            হ্যাঁ
          </button>
          <button
            onClick={() => onMarkHelpful(review.id, false)}
            disabled={!currentUserId || currentUserId === review.user.email}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ThumbsDown className="w-4 h-4" />
            না
          </button>
        </div>
        {review.isHelpful > 0 && (
          <span className="text-sm text-gray-500">
            {review.isHelpful} জন উপকারী বলেছেন
          </span>
        )}
      </div>
    </div>
  );
}

interface WriteReviewModalProps {
  productId: string;
  onClose: () => void;
  onSubmit: () => void;
}

function WriteReviewModal({ productId, onClose, onSubmit }: WriteReviewModalProps) {
  const [formData, setFormData] = useState({
    rating: 0,
    title: '',
    comment: '',
    pros: [''],
    cons: [''],
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.rating === 0 || !formData.comment.trim()) {
      alert('রেটিং এবং মন্তব্য আবশ্যক');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          rating: formData.rating,
          title: formData.title.trim() || undefined,
          comment: formData.comment.trim(),
          pros: formData.pros.filter(p => p.trim()),
          cons: formData.cons.filter(c => c.trim()),
        }),
      });

      if (response.ok) {
        onSubmit();
        alert('রিভিউ সফলভাবে জমা দেওয়া হয়েছে!');
      } else {
        const error = await response.json();
        alert(error.error || 'রিভিউ জমা দিতে সমস্যা হয়েছে');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('রিভিউ জমা দিতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const addProsField = () => setFormData(prev => ({ ...prev, pros: [...prev.pros, ''] }));
  const addConsField = () => setFormData(prev => ({ ...prev, cons: [...prev.cons, ''] }));

  const updatePros = (index: number, value: string) => {
    const newPros = [...formData.pros];
    newPros[index] = value;
    setFormData(prev => ({ ...prev, pros: newPros }));
  };

  const updateCons = (index: number, value: string) => {
    const newCons = [...formData.cons];
    newCons[index] = value;
    setFormData(prev => ({ ...prev, cons: newCons }));
  };

  const removeProsField = (index: number) => {
    if (formData.pros.length > 1) {
      const newPros = formData.pros.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, pros: newPros }));
    }
  };

  const removeConsField = (index: number) => {
    if (formData.cons.length > 1) {
      const newCons = formData.cons.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, cons: newCons }));
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">রিভিউ লিখুন</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              রেটিং *
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                  className="p-1"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= formData.rating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              শিরোনাম
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="আপনার রিভিউর একটি শিরোনাম দিন"
            />
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              মন্তব্য *
            </label>
            <textarea
              value={formData.comment}
              onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
              rows={5}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="পণ্যটি সম্পর্কে আপনার অভিজ্ঞতা লিখুন"
              required
            />
          </div>

          {/* Pros */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ভালো দিকসমূহ
            </label>
            {formData.pros.map((pro, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={pro}
                  onChange={(e) => updatePros(index, e.target.value)}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                  placeholder="ভালো দিক লিখুন"
                />
                {formData.pros.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeProsField(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addProsField}
              className="text-green-600 hover:text-green-800 text-sm flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              আরও যোগ করুন
            </button>
          </div>

          {/* Cons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              খারাপ দিকসমূহ
            </label>
            {formData.cons.map((con, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={con}
                  onChange={(e) => updateCons(index, e.target.value)}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                  placeholder="খারাপ দিক লিখুন"
                />
                {formData.cons.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeConsField(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addConsField}
              className="text-green-600 hover:text-green-800 text-sm flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              আরও যোগ করুন
            </button>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              বাতিল
            </Button>
            <Button
              type="submit"
              disabled={loading || formData.rating === 0 || !formData.comment.trim()}
            >
              {loading ? 'জমা দিচ্ছি...' : 'রিভিউ জমা দিন'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}