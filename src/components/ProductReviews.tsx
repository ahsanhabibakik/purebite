"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  Shield,
  Calendar,
  User,
  Send,
  Loader2
} from "lucide-react";
import { Product } from "@/types/product";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  title?: string;
  comment: string;
  verified?: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    name?: string;
  };
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

interface ProductReviewsProps {
  product: Product;
}

export function ProductReviews({ product }: ProductReviewsProps) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "highest" | "lowest">("newest");
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [product.id]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews?productId=${product.id}`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
        calculateStats(data.reviews || []);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (reviewList: Review[]) => {
    if (reviewList.length === 0) {
      setStats({
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      });
      return;
    }

    const total = reviewList.length;
    const sum = reviewList.reduce((acc, review) => acc + review.rating, 0);
    const average = sum / total;

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviewList.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++;
    });

    setStats({
      averageRating: average,
      totalReviews: total,
      ratingDistribution: distribution
    });
  };

  // Filter and sort reviews
  const filteredReviews = reviews
    .filter(review => filterRating ? review.rating === filterRating : true)
    .sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "highest":
          return b.rating - a.rating;
        case "lowest":
          return a.rating - b.rating;
        case "helpful":
          return (b.helpful - b.notHelpful) - (a.helpful - a.notHelpful);
        case "newest":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const StarRating = ({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" | "lg" }) => {
    const starSize = size === "lg" ? "h-6 w-6" : size === "md" ? "h-5 w-5" : "h-4 w-4";
    
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              starSize,
              star <= rating 
                ? "fill-yellow-400 text-yellow-400" 
                : "fill-gray-200 text-gray-200"
            )}
          />
        ))}
      </div>
    );
  };

  const ReviewItem = ({ review }: { review: Review }) => {

    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    return (
      <div className="border-b border-gray-100 pb-6 mb-6 last:border-b-0">
        <div className="flex items-start gap-4">
          {/* User Avatar */}
          <div className="flex-shrink-0">
            <div className="relative w-12 h-12">
              {review.userAvatar ? (
                <Image
                  src={review.userAvatar}
                  alt={review.userName}
                  fill
                  className="rounded-full object-cover"
                  sizes="48px"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-400" />
                </div>
              )}
              {review.verified && (
                <div className="absolute -bottom-1 -right-1 bg-green-100 rounded-full p-1">
                  <Shield className="w-3 h-3 text-green-600" />
                </div>
              )}
            </div>
          </div>

          {/* Review Content */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold text-gray-900">{review.user.name || 'বেনামী গ্রাহক'}</h4>
              {review.verified && (
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                  <Shield className="w-3 h-3 mr-1" />
                  যাচাইকৃত ক্রেতা
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 mb-2">
              <StarRating rating={review.rating} />
              <span className="text-sm text-gray-600">•</span>
              <span className="text-sm text-gray-600 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(review.createdAt)}
              </span>
            </div>

            {review.title && <h5 className="font-medium text-gray-900 mb-2">{review.title}</h5>}
            <p className="text-gray-700 leading-relaxed mb-4">{review.comment}</p>

          </div>
        </div>
      </div>
    );
  };

  const WriteReviewForm = () => {
    const [rating, setRating] = useState(0);
    const [title, setTitle] = useState("");
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!rating || !comment) {
        toast.error('দয়া করে রেটিং এবং মন্তব্য দিন');
        return;
      }

      if (!session) {
        toast.error('রিভিউ লিখতে লগইন করুন');
        return;
      }

      setIsSubmitting(true);
      
      try {
        const response = await fetch('/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: product.id,
            rating,
            title: title || undefined,
            comment,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'রিভিউ পাঠাতে সমস্যা');
        }

        toast.success('রিভিউ সফলভাবে পাঠানো হয়েছে!');
        
        setRating(0);
        setTitle("");
        setComment("");
        setShowWriteReview(false);
        
        // Refresh reviews
        fetchReviews();
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">রেটিং দিন</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="p-1"
              >
                <Star
                  className={cn(
                    "h-8 w-8 transition-colors",
                    star <= rating 
                      ? "fill-yellow-400 text-yellow-400" 
                      : "fill-gray-200 text-gray-200 hover:fill-yellow-200 hover:text-yellow-200"
                  )}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">রিভিউ শিরোনাম</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="আপনার অভিজ্ঞতার শিরোনাম"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">বিস্তারিত রিভিউ</label>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="এই পণ্য সম্পর্কে আপনার মতামত শেয়ার করুন..."
            rows={4}
            required
          />
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                পাঠানো হচ্ছে...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                রিভিউ পাঠান
              </>
            )}
          </Button>
          <Button type="button" variant="outline" onClick={() => setShowWriteReview(false)}>
            বাতিল
          </Button>
        </div>
      </form>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-600">রিভিউ লোড হচ্ছে...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="bg-gray-50 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Overall Rating */}
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {stats.averageRating.toFixed(1)}
            </div>
            <StarRating rating={Math.round(stats.averageRating)} size="lg" />
            <p className="text-gray-600 mt-2">
              {stats.totalReviews}টি রিভিউর ভিত্তিতে
            </p>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution];
              const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
              
              return (
                <div key={rating} className="flex items-center gap-2">
                  <span className="text-sm w-2">{rating}</span>
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-8">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reviews Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          গ্রাহক রিভিউ ({stats.totalReviews}টি)
        </h3>

        <div className="flex gap-2">
          {session ? (
            <Dialog open={showWriteReview} onOpenChange={setShowWriteReview}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  রিভিউ লিখুন
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>পণ্যের রিভিউ লিখুন</DialogTitle>
                </DialogHeader>
                <WriteReviewForm />
              </DialogContent>
            </Dialog>
          ) : (
            <Button 
              onClick={() => toast.error('রিভিউ লিখতে প্রথমে লগইন করুন')}
              className="flex items-center gap-2"
            >
              <Star className="h-4 w-4" />
              রিভিউ লিখুন
            </Button>
          )}
        </div>
      </div>

      {/* Filters and Sort */}
      {stats.totalReviews > 0 && (
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex gap-2">
            <Button
              variant={filterRating === null ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterRating(null)}
            >
              সব রেটিং
            </Button>
            {[5, 4, 3, 2, 1].map((rating) => (
              <Button
                key={rating}
                variant={filterRating === rating ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterRating(rating)}
                className="flex items-center gap-1"
              >
                {rating} <Star className="h-3 w-3 fill-current" />
              </Button>
            ))}
          </div>

          <div className="border-l border-gray-300 pl-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="newest">নতুন আগে</option>
              <option value="oldest">পুরাতন আগে</option>
              <option value="highest">বেশি রেটিং আগে</option>
              <option value="lowest">কম রেটিং আগে</option>
              <option value="helpful">সহায়ক আগে</option>
            </select>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div>
        {filteredReviews.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {stats.totalReviews === 0 ? "এখনও কোন রিভিউ নেই" : "কোন রিভিউ পাওয়া যায়নি"}
            </h3>
            <p className="text-gray-600 mb-4">
              {stats.totalReviews === 0 
                ? "এই পণ্যের প্রথম রিভিউ দিন!"
                : "ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।"
              }
            </p>
            {stats.totalReviews === 0 && (
              <Button onClick={() => setShowWriteReview(true)}>
                <Star className="w-4 h-4 mr-2" />
                রিভিউ লিখুন
              </Button>
            )}
          </div>
        ) : (
          <div>
            {filteredReviews.map((review) => (
              <ReviewItem key={review.id} review={review} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}