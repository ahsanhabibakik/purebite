'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Flag, Star, CheckCircle, XCircle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { ReviewReportReason, ReviewReportStatus } from '@prisma/client';

interface ReviewReport {
  id: string;
  reason: ReviewReportReason;
  comment?: string;
  status: ReviewReportStatus;
  createdAt: string;
  review: {
    id: string;
    rating: number;
    title?: string;
    comment: string;
    pros: string[];
    cons: string[];
    images: string[];
    isVerifiedPurchase: boolean;
    createdAt: string;
    user: {
      id: string;
      name?: string;
      email: string;
    };
    product: {
      id: string;
      name: string;
      image: string;
    };
  };
}

export default function AdminReviewsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reports, setReports] = useState<ReviewReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user || !session.user.email) {
      router.push('/auth/login');
      return;
    }
    fetchReports();
  }, [session, status, currentPage]);

  const fetchReports = async () => {
    try {
      const response = await fetch(`/api/admin/reviews/reports?page=${currentPage}&limit=20`);
      if (response.ok) {
        const data = await response.json();
        setReports(data.reports);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const moderateReport = async (reportId: string, action: 'approve' | 'reject') => {
    const notes = action === 'approve' 
      ? prompt('মডারেটর নোট (ঐচ্ছিক):')
      : null;

    try {
      const response = await fetch(`/api/admin/reviews/reports/${reportId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, moderatorNotes: notes }),
      });

      if (response.ok) {
        fetchReports(); // Refresh the list
        alert(`রিপোর্ট ${action === 'approve' ? 'অনুমোদিত' : 'প্রত্যাখ্যাত'} হয়েছে`);
      } else {
        alert('সমস্যা হয়েছে');
      }
    } catch (error) {
      console.error('Error moderating report:', error);
      alert('সমস্যা হয়েছে');
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

  const getReasonText = (reason: ReviewReportReason) => {
    const reasonMap = {
      SPAM: 'স্প্যাম',
      INAPPROPRIATE: 'অনুপযুক্ত',
      FAKE: 'ভুয়া রিভিউ',
      OFFENSIVE: 'আপত্তিজনক',
      OTHER: 'অন্যান্য',
    };
    return reasonMap[reason] || reason;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bn-BD');
  };

  const getUserDisplayName = (user: { name?: string; email: string }) => {
    if (user.name) return user.name;
    const emailParts = user.email.split('@');
    return emailParts[0].substring(0, 3) + '***';
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">রিভিউ মডারেশন</h1>
        <p className="text-gray-600">রিপোর্ট করা রিভিউগুলো পর্যালোচনা করুন</p>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-12">
          <Flag className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            কোনো পেন্ডিং রিপোর্ট নেই
          </h3>
          <p className="text-gray-600">
            সব রিপোর্ট পর্যালোচনা সম্পন্ন হয়েছে
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {reports.map((report) => (
            <div key={report.id} className="bg-white border border-gray-200 rounded-lg p-6">
              {/* Report Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-full">
                    <Flag className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      রিপোর্টের কারণ: {getReasonText(report.reason)}
                    </h3>
                    <p className="text-sm text-gray-500">
                      রিপোর্ট তারিখ: {formatDate(report.createdAt)}
                    </p>
                    {report.comment && (
                      <p className="text-sm text-gray-700 mt-1">
                        মন্তব্য: {report.comment}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => moderateReport(report.id, 'reject')}
                    className="text-gray-600 border-gray-300"
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    প্রত্যাখ্যান
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => moderateReport(report.id, 'approve')}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    অনুমোদন
                  </Button>
                </div>
              </div>

              {/* Product Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 flex-shrink-0">
                    <Image
                      src={report.review.product.image || '/placeholder-product.jpg'}
                      alt={report.review.product.name}
                      fill
                      className="object-cover rounded"
                      sizes="48px"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {report.review.product.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      পণ্য ID: {report.review.product.id}
                    </p>
                  </div>
                </div>
              </div>

              {/* Review Content */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium text-sm">
                        {getUserDisplayName(report.review.user).charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {getUserDisplayName(report.review.user)}
                        </span>
                        {report.review.isVerifiedPurchase && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                            যাচাইকৃত ক্রয়
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {renderStars(report.review.rating)}
                        <span className="text-sm text-gray-500">
                          {formatDate(report.review.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Review Title */}
                {report.review.title && (
                  <h4 className="font-medium text-gray-900 mb-2">
                    {report.review.title}
                  </h4>
                )}

                {/* Review Comment */}
                <p className="text-gray-700 mb-3">{report.review.comment}</p>

                {/* Pros & Cons */}
                {(report.review.pros.length > 0 || report.review.cons.length > 0) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    {report.review.pros.length > 0 && (
                      <div>
                        <h5 className="font-medium text-green-600 mb-1">ভালো দিক:</h5>
                        <ul className="text-sm text-gray-700 space-y-1">
                          {report.review.pros.map((pro, index) => (
                            <li key={index}>• {pro}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {report.review.cons.length > 0 && (
                      <div>
                        <h5 className="font-medium text-red-600 mb-1">খারাপ দিক:</h5>
                        <ul className="text-sm text-gray-700 space-y-1">
                          {report.review.cons.map((con, index) => (
                            <li key={index}>• {con}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Review Images */}
                {report.review.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {report.review.images.slice(0, 3).map((image, index) => (
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
  );
}