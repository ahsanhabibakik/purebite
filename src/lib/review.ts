import { prisma } from '@/lib/db';
import { ReviewReportReason, ReviewReportStatus } from '@prisma/client';

interface CreateReviewData {
  productId: string;
  orderId?: string;
  rating: number;
  title?: string;
  comment: string;
  pros?: string[];
  cons?: string[];
  images?: string[];
}

interface UpdateReviewData {
  rating?: number;
  title?: string;
  comment?: string;
  pros?: string[];
  cons?: string[];
  images?: string[];
}

interface ReviewFilters {
  rating?: number;
  verifiedOnly?: boolean;
  sortBy?: 'newest' | 'oldest' | 'rating_high' | 'rating_low' | 'helpful';
  page?: number;
  limit?: number;
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

export class ReviewService {
  
  /**
   * Create a new review
   */
  static async createReview(userId: string, data: CreateReviewData) {
    // Validate rating
    if (data.rating < 1 || data.rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    // Check if user already reviewed this product
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_productId: {
          userId,
          productId: data.productId,
        },
      },
    });

    if (existingReview) {
      throw new Error('You have already reviewed this product');
    }

    // Check if this is a verified purchase
    let isVerifiedPurchase = false;
    if (data.orderId) {
      const order = await prisma.order.findFirst({
        where: {
          id: data.orderId,
          userId,
          status: 'DELIVERED',
          items: {
            some: {
              productId: data.productId,
            },
          },
        },
      });
      isVerifiedPurchase = !!order;
    }

    return prisma.$transaction(async (tx) => {
      // Create the review
      const review = await tx.review.create({
        data: {
          userId,
          productId: data.productId,
          orderId: data.orderId,
          rating: data.rating,
          title: data.title,
          comment: data.comment,
          pros: data.pros || [],
          cons: data.cons || [],
          images: data.images || [],
          isVerifiedPurchase,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Update product rating and review count
      await this.updateProductRating(data.productId, tx);

      return review;
    });
  }

  /**
   * Update an existing review
   */
  static async updateReview(reviewId: string, userId: string, data: UpdateReviewData) {
    const review = await prisma.review.findFirst({
      where: { id: reviewId, userId },
    });

    if (!review) {
      throw new Error('Review not found or not authorized');
    }

    if (data.rating && (data.rating < 1 || data.rating > 5)) {
      throw new Error('Rating must be between 1 and 5');
    }

    return prisma.$transaction(async (tx) => {
      const updatedReview = await tx.review.update({
        where: { id: reviewId },
        data: {
          ...data,
          updatedAt: new Date(),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Update product rating if rating changed
      if (data.rating && data.rating !== review.rating) {
        await this.updateProductRating(review.productId, tx);
      }

      return updatedReview;
    });
  }

  /**
   * Delete a review
   */
  static async deleteReview(reviewId: string, userId: string) {
    const review = await prisma.review.findFirst({
      where: { id: reviewId, userId },
    });

    if (!review) {
      throw new Error('Review not found or not authorized');
    }

    return prisma.$transaction(async (tx) => {
      await tx.review.delete({
        where: { id: reviewId },
      });

      // Update product rating
      await this.updateProductRating(review.productId, tx);
    });
  }

  /**
   * Get reviews for a product
   */
  static async getProductReviews(productId: string, filters: ReviewFilters = {}) {
    const {
      rating,
      verifiedOnly = false,
      sortBy = 'newest',
      page = 1,
      limit = 10,
    } = filters;

    const skip = (page - 1) * limit;

    let orderBy: any = { createdAt: 'desc' };
    
    switch (sortBy) {
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'rating_high':
        orderBy = { rating: 'desc' };
        break;
      case 'rating_low':
        orderBy = { rating: 'asc' };
        break;
      case 'helpful':
        orderBy = { isHelpful: 'desc' };
        break;
    }

    const where: any = {
      productId,
      isReported: false,
    };

    if (rating) {
      where.rating = rating;
    }

    if (verifiedOnly) {
      where.isVerifiedPurchase = true;
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          helpful: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.review.count({ where }),
    ]);

    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get review statistics for a product
   */
  static async getProductReviewStats(productId: string): Promise<ReviewStats> {
    const summary = await prisma.reviewSummary.findUnique({
      where: { productId },
    });

    if (!summary) {
      return {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        verifiedPurchases: 0,
        helpfulReviews: 0,
      };
    }

    const [verifiedCount, helpfulCount] = await Promise.all([
      prisma.review.count({
        where: { productId, isVerifiedPurchase: true },
      }),
      prisma.review.count({
        where: { productId, isHelpful: { gt: 0 } },
      }),
    ]);

    return {
      totalReviews: summary.totalReviews,
      averageRating: summary.averageRating,
      ratingDistribution: {
        1: summary.rating1Count,
        2: summary.rating2Count,
        3: summary.rating3Count,
        4: summary.rating4Count,
        5: summary.rating5Count,
      },
      verifiedPurchases: verifiedCount,
      helpfulReviews: helpfulCount,
    };
  }

  /**
   * Mark review as helpful/not helpful
   */
  static async markReviewHelpful(reviewId: string, userId: string, isHelpful: boolean) {
    return prisma.$transaction(async (tx) => {
      // Remove existing helpful vote if any
      await tx.reviewHelpful.deleteMany({
        where: { reviewId, userId },
      });

      // Add new vote
      await tx.reviewHelpful.create({
        data: { reviewId, userId, isHelpful },
      });

      // Update review helpful count
      const helpfulCount = await tx.reviewHelpful.count({
        where: { reviewId, isHelpful: true },
      });

      const notHelpfulCount = await tx.reviewHelpful.count({
        where: { reviewId, isHelpful: false },
      });

      await tx.review.update({
        where: { id: reviewId },
        data: { isHelpful: helpfulCount - notHelpfulCount },
      });
    });
  }

  /**
   * Report a review
   */
  static async reportReview(
    reviewId: string,
    userId: string,
    reason: ReviewReportReason,
    comment?: string
  ) {
    return prisma.reviewReport.upsert({
      where: {
        reviewId_userId: { reviewId, userId },
      },
      create: {
        reviewId,
        userId,
        reason,
        comment,
      },
      update: {
        reason,
        comment,
        createdAt: new Date(),
      },
    });
  }

  /**
   * Get user's reviews
   */
  static async getUserReviews(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { userId },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              image: true,
              price: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.review.count({ where: { userId } }),
    ]);

    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get reviewable products for a user (from completed orders)
   */
  static async getReviewableProducts(userId: string) {
    const deliveredOrders = await prisma.order.findMany({
      where: {
        userId,
        status: 'DELIVERED',
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                image: true,
                price: true,
              },
            },
          },
        },
      },
      orderBy: { deliveredAt: 'desc' },
    });

    // Get existing reviews for this user
    const existingReviews = await prisma.review.findMany({
      where: { userId },
      select: { productId: true },
    });

    const reviewedProductIds = new Set(existingReviews.map(r => r.productId));

    // Filter out already reviewed products
    const reviewableProducts = [];
    for (const order of deliveredOrders) {
      for (const item of order.items) {
        if (!reviewedProductIds.has(item.productId)) {
          reviewableProducts.push({
            orderId: order.id,
            orderNumber: order.orderNumber,
            deliveredAt: order.deliveredAt,
            product: item.product,
          });
          reviewedProductIds.add(item.productId); // Avoid duplicates
        }
      }
    }

    return reviewableProducts;
  }

  /**
   * Update product rating summary (internal method)
   */
  private static async updateProductRating(productId: string, tx?: any) {
    const prismaInstance = tx || prisma;

    const reviews = await prismaInstance.review.findMany({
      where: { productId },
      select: { rating: true },
    });

    const totalReviews = reviews.length;
    let averageRating = 0;
    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    if (totalReviews > 0) {
      const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
      averageRating = sum / totalReviews;

      reviews.forEach(review => {
        ratingCounts[review.rating as keyof typeof ratingCounts]++;
      });
    }

    // Update product
    await prismaInstance.product.update({
      where: { id: productId },
      data: {
        rating: averageRating,
        reviewCount: totalReviews,
      },
    });

    // Update review summary
    await prismaInstance.reviewSummary.upsert({
      where: { productId },
      create: {
        productId,
        totalReviews,
        averageRating,
        rating1Count: ratingCounts[1],
        rating2Count: ratingCounts[2],
        rating3Count: ratingCounts[3],
        rating4Count: ratingCounts[4],
        rating5Count: ratingCounts[5],
      },
      update: {
        totalReviews,
        averageRating,
        rating1Count: ratingCounts[1],
        rating2Count: ratingCounts[2],
        rating3Count: ratingCounts[3],
        rating4Count: ratingCounts[4],
        rating5Count: ratingCounts[5],
        lastUpdated: new Date(),
      },
    });
  }

  /**
   * Admin: Get reported reviews
   */
  static async getReportedReviews(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [reports, total] = await Promise.all([
      prisma.reviewReport.findMany({
        where: { status: 'PENDING' },
        include: {
          review: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
              product: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.reviewReport.count({ where: { status: 'PENDING' } }),
    ]);

    return {
      reports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Admin: Moderate review report
   */
  static async moderateReviewReport(
    reportId: string,
    action: 'approve' | 'reject',
    moderatorId: string,
    moderatorNotes?: string
  ) {
    const report = await prisma.reviewReport.findUnique({
      where: { id: reportId },
      include: { review: true },
    });

    if (!report) {
      throw new Error('Report not found');
    }

    return prisma.$transaction(async (tx) => {
      // Update report status
      await tx.reviewReport.update({
        where: { id: reportId },
        data: {
          status: action === 'approve' ? 'APPROVED' : 'REJECTED',
          resolvedAt: new Date(),
          resolvedBy: moderatorId,
        },
      });

      // If approved, mark review as reported and add moderator notes
      if (action === 'approve') {
        await tx.review.update({
          where: { id: report.reviewId },
          data: {
            isReported: true,
            moderatorNotes,
          },
        });

        // Update product rating since review is now hidden
        await this.updateProductRating(report.review.productId, tx);
      }
    });
  }
}

export default ReviewService;