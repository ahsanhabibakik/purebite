import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  verified: boolean;
  helpful: number;
  notHelpful: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

interface ReviewsState {
  reviews: Review[];
  addReview: (review: Omit<Review, 'id' | 'createdAt' | 'updatedAt' | 'helpful' | 'notHelpful'>) => void;
  markHelpful: (reviewId: string, isHelpful: boolean) => void;
  getProductReviews: (productId: string) => Review[];
  getReviewStats: (productId: string) => ReviewStats;
  deleteReview: (reviewId: string) => void;
}

// Mock initial reviews data
const initialReviews: Review[] = [
  {
    id: '1',
    productId: '1',
    userId: 'user1',
    userName: 'রিয়া আক্তার',
    userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=150&h=150&fit=crop&crop=face',
    rating: 5,
    title: 'অসাধারণ স্বাদের খেজুর হালুয়া!',
    comment: 'পিউর বাইটের খেজুর হালুয়া সত্যিই অসাধারণ। কোন কৃত্রিম উপাদান নেই, সম্পূর্ণ প্রাকৃতিক। আমার পুরো পরিবার খুব পছন্দ করেছে। প্যাকেজিং খুব সুন্দর।',
    verified: true,
    helpful: 12,
    notHelpful: 1,
    createdAt: '2025-01-10T10:30:00Z',
    updatedAt: '2025-01-10T10:30:00Z'
  },
  {
    id: '2',
    productId: '1',
    userId: 'user2',
    userName: 'আহমেদ হাসান',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    rating: 4,
    title: 'ভালো মান, একটু দাম বেশি',
    comment: 'খেজুর হালুয়ার মান অনেক ভালো। স্বাদ চমৎকার। শুধু দামটা একটু বেশি লাগলো। তবে গুণগত মান অনুযায়ী ঠিক আছে।',
    verified: true,
    helpful: 8,
    notHelpful: 2,
    createdAt: '2025-01-08T14:20:00Z',
    updatedAt: '2025-01-08T14:20:00Z'
  },
  {
    id: '3',
    productId: '2',
    userId: 'user3',
    userName: 'ফাতিমা খানম',
    userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    rating: 5,
    title: 'প্রিমিয়াম কোয়ালিটি কাজু',
    comment: 'কাজু বাদামের গুণগত মান অসাধারণ। খুবই তাজা এবং মজাদার। রান্নায় ব্যবহার করেও দারুণ। পুষ্টিগুণ বজায় আছে।',
    verified: true,
    helpful: 15,
    notHelpful: 0,
    createdAt: '2025-01-12T09:15:00Z',
    updatedAt: '2025-01-12T09:15:00Z'
  },
  {
    id: '4',
    productId: '3',
    userId: 'user4',
    userName: 'করিম উদ্দিন',
    userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    rating: 5,
    title: 'জিমের জন্য পারফেক্ট এনার্জি বল',
    comment: 'ওয়ার্কআউটের আগে খেলে দারুণ এনার্জি পাই। সম্পূর্ণ প্রাকৃতিক উপাদান। কোন কৃত্রিম চিনি নেই। স্বাদও চমৎকার।',
    verified: true,
    helpful: 20,
    notHelpful: 1,
    createdAt: '2025-01-09T16:45:00Z',
    updatedAt: '2025-01-09T16:45:00Z'
  }
];

export const useReviewsStore = create<ReviewsState>()(
  persist(
    (set, get) => ({
      reviews: initialReviews,
      
      addReview: (reviewData) => {
        const newReview: Review = {
          ...reviewData,
          id: `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          helpful: 0,
          notHelpful: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        set(state => ({
          reviews: [newReview, ...state.reviews]
        }));
      },
      
      markHelpful: (reviewId, isHelpful) => {
        set(state => ({
          reviews: state.reviews.map(review => 
            review.id === reviewId 
              ? {
                  ...review,
                  helpful: isHelpful ? review.helpful + 1 : review.helpful,
                  notHelpful: !isHelpful ? review.notHelpful + 1 : review.notHelpful,
                  updatedAt: new Date().toISOString()
                }
              : review
          )
        }));
      },
      
      getProductReviews: (productId) => {
        return get().reviews
          .filter(review => review.productId === productId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },
      
      getReviewStats: (productId) => {
        const productReviews = get().getProductReviews(productId);
        const totalReviews = productReviews.length;
        
        if (totalReviews === 0) {
          return {
            totalReviews: 0,
            averageRating: 0,
            ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
          };
        }
        
        const ratingDistribution = productReviews.reduce((acc, review) => {
          acc[review.rating as keyof typeof acc]++;
          return acc;
        }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
        
        const totalRating = productReviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = Math.round((totalRating / totalReviews) * 10) / 10;
        
        return {
          totalReviews,
          averageRating,
          ratingDistribution
        };
      },
      
      deleteReview: (reviewId) => {
        set(state => ({
          reviews: state.reviews.filter(review => review.id !== reviewId)
        }));
      }
    }),
    {
      name: 'purebite-reviews'
    }
  )
);