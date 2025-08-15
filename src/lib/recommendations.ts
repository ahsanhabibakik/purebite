import { prisma } from './prisma';
import { Product, UserActionType, RecommendationType, SimilarityType } from '@prisma/client';

interface RecommendationOptions {
  userId?: string;
  productId?: string;
  type?: RecommendationType;
  limit?: number;
  includeOutOfStock?: boolean;
  excludeProductIds?: string[];
  context?: any;
}

interface RecommendationResult {
  productId: string;
  score: number;
  reason: string;
  type: RecommendationType;
  product?: Product;
}

export class RecommendationService {
  static async getRecommendations(options: RecommendationOptions): Promise<RecommendationResult[]> {
    const {
      userId,
      productId,
      type,
      limit = 10,
      includeOutOfStock = false,
      excludeProductIds = [],
      context
    } = options;

    let recommendations: RecommendationResult[] = [];

    switch (type) {
      case 'PERSONALIZED':
        if (userId) {
          recommendations = await this.getPersonalizedRecommendations(userId, limit, excludeProductIds);
        }
        break;
      
      case 'ALSO_VIEWED':
        if (productId) {
          recommendations = await this.getAlsoViewedRecommendations(productId, limit, excludeProductIds);
        }
        break;
      
      case 'ALSO_BOUGHT':
        if (productId) {
          recommendations = await this.getAlsoBoughtRecommendations(productId, limit, excludeProductIds);
        }
        break;
      
      case 'SIMILAR_PRODUCTS':
        if (productId) {
          recommendations = await this.getSimilarProducts(productId, limit, excludeProductIds);
        }
        break;
      
      case 'TRENDING':
        recommendations = await this.getTrendingProducts(limit, excludeProductIds);
        break;
      
      case 'NEW_ARRIVALS':
        recommendations = await this.getNewArrivals(limit, excludeProductIds);
        break;
      
      case 'PRICE_DROP':
        recommendations = await this.getPriceDropProducts(limit, excludeProductIds);
        break;
      
      case 'CART_ABANDONMENT':
        if (userId) {
          recommendations = await this.getCartAbandonmentRecommendations(userId, limit);
        }
        break;
      
      default:
        // Get mixed recommendations
        recommendations = await this.getMixedRecommendations(userId, productId, limit, excludeProductIds);
    }

    // Filter out of stock products if specified
    if (!includeOutOfStock) {
      recommendations = recommendations.filter(rec => rec.product?.inStock !== false);
    }

    // Store recommendations for analytics
    if (userId && recommendations.length > 0) {
      await this.storeRecommendations(userId, recommendations, type, context);
    }

    return recommendations.slice(0, limit);
  }

  static async getPersonalizedRecommendations(
    userId: string, 
    limit: number, 
    excludeProductIds: string[]
  ): Promise<RecommendationResult[]> {
    // Get user's purchase and view history
    const userBehavior = await prisma.userBehavior.findMany({
      where: {
        userId,
        actionType: { in: ['PURCHASE', 'VIEW', 'ADD_TO_CART'] }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    // Get user preferences
    const preferences = await this.getUserPreferences(userId);
    
    // Get categories user interacted with most
    const categoryInteractions = this.analyzeUserCategories(userBehavior);
    
    // Find products in preferred categories that user hasn't interacted with
    const products = await prisma.product.findMany({
      where: {
        AND: [
          {
            id: { notIn: [...excludeProductIds, ...userBehavior.map(b => b.productId)] }
          },
          {
            inStock: true
          },
          preferences.preferredCategories.length > 0 ? {
            category: { in: preferences.preferredCategories }
          } : {},
          preferences.preferredPriceRange ? {
            price: {
              gte: preferences.preferredPriceRange.min || 0,
              lte: preferences.preferredPriceRange.max || 999999
            }
          } : {}
        ]
      },
      orderBy: [
        { rating: 'desc' },
        { reviewCount: 'desc' }
      ],
      take: limit * 2
    });

    return products.map(product => ({
      productId: product.id,
      score: this.calculatePersonalizedScore(product, preferences, categoryInteractions),
      reason: 'ব্যক্তিগত পছন্দের ভিত্তিতে সুপারিশ',
      type: 'PERSONALIZED' as RecommendationType,
      product
    })).sort((a, b) => b.score - a.score);
  }

  static async getAlsoViewedRecommendations(
    productId: string,
    limit: number,
    excludeProductIds: string[]
  ): Promise<RecommendationResult[]> {
    // Get users who viewed this product
    const viewedBy = await prisma.userBehavior.findMany({
      where: {
        productId,
        actionType: 'VIEW'
      },
      select: { userId: true },
      distinct: ['userId'],
      take: 1000
    });

    if (viewedBy.length === 0) {
      return this.getFallbackRecommendations(productId, limit, excludeProductIds);
    }

    // Get what else these users viewed
    const alsoViewed = await prisma.userBehavior.groupBy({
      by: ['productId'],
      where: {
        userId: { in: viewedBy.map(u => u.userId) },
        productId: { notIn: [productId, ...excludeProductIds] },
        actionType: 'VIEW'
      },
      _count: { userId: true },
      orderBy: { _count: { userId: 'desc' } },
      take: limit
    });

    const products = await prisma.product.findMany({
      where: {
        id: { in: alsoViewed.map(av => av.productId) },
        inStock: true
      }
    });

    return alsoViewed.map(av => {
      const product = products.find(p => p.id === av.productId);
      if (!product) return null;
      
      return {
        productId: av.productId,
        score: av._count.userId / viewedBy.length,
        reason: `${av._count.userId} জন এই পণ্যটিও দেখেছেন`,
        type: 'ALSO_VIEWED' as RecommendationType,
        product
      };
    }).filter(Boolean) as RecommendationResult[];
  }

  static async getAlsoBoughtRecommendations(
    productId: string,
    limit: number,
    excludeProductIds: string[]
  ): Promise<RecommendationResult[]> {
    // Get users who bought this product
    const boughtBy = await prisma.userBehavior.findMany({
      where: {
        productId,
        actionType: 'PURCHASE'
      },
      select: { userId: true },
      distinct: ['userId'],
      take: 1000
    });

    if (boughtBy.length === 0) {
      return this.getAlsoViewedRecommendations(productId, limit, excludeProductIds);
    }

    // Get what else these users bought
    const alsoBought = await prisma.userBehavior.groupBy({
      by: ['productId'],
      where: {
        userId: { in: boughtBy.map(u => u.userId) },
        productId: { notIn: [productId, ...excludeProductIds] },
        actionType: 'PURCHASE'
      },
      _count: { userId: true },
      orderBy: { _count: { userId: 'desc' } },
      take: limit
    });

    const products = await prisma.product.findMany({
      where: {
        id: { in: alsoBought.map(ab => ab.productId) },
        inStock: true
      }
    });

    return alsoBought.map(ab => {
      const product = products.find(p => p.id === ab.productId);
      if (!product) return null;
      
      return {
        productId: ab.productId,
        score: ab._count.userId / boughtBy.length,
        reason: `${ab._count.userId} জন এই পণ্যটিও কিনেছেন`,
        type: 'ALSO_BOUGHT' as RecommendationType,
        product
      };
    }).filter(Boolean) as RecommendationResult[];
  }

  static async getSimilarProducts(
    productId: string,
    limit: number,
    excludeProductIds: string[]
  ): Promise<RecommendationResult[]> {
    // First try to get pre-calculated similarities
    const similarities = await prisma.productSimilarity.findMany({
      where: {
        productId,
        similarProductId: { notIn: excludeProductIds }
      },
      orderBy: { similarityScore: 'desc' },
      take: limit,
      include: {
        // We need to manually fetch the similar product
      }
    });

    if (similarities.length > 0) {
      const products = await prisma.product.findMany({
        where: {
          id: { in: similarities.map(s => s.similarProductId) },
          inStock: true
        }
      });

      return similarities.map(sim => {
        const product = products.find(p => p.id === sim.similarProductId);
        if (!product) return null;

        return {
          productId: sim.similarProductId,
          score: sim.similarityScore,
          reason: 'অনুরূপ পণ্য',
          type: 'SIMILAR_PRODUCTS' as RecommendationType,
          product
        };
      }).filter(Boolean) as RecommendationResult[];
    }

    // Fallback to category-based similarity
    const currentProduct = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!currentProduct) return [];

    const similarProducts = await prisma.product.findMany({
      where: {
        category: currentProduct.category,
        id: { notIn: [productId, ...excludeProductIds] },
        inStock: true
      },
      orderBy: [
        { rating: 'desc' },
        { reviewCount: 'desc' }
      ],
      take: limit
    });

    return similarProducts.map(product => ({
      productId: product.id,
      score: 0.7, // Base similarity score for same category
      reason: 'একই ক্যাটাগরির পণ্য',
      type: 'SIMILAR_PRODUCTS' as RecommendationType,
      product
    }));
  }

  static async getTrendingProducts(
    limit: number,
    excludeProductIds: string[]
  ): Promise<RecommendationResult[]> {
    // Get products with most views/purchases in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const trending = await prisma.userBehavior.groupBy({
      by: ['productId'],
      where: {
        createdAt: { gte: sevenDaysAgo },
        actionType: { in: ['VIEW', 'PURCHASE', 'ADD_TO_CART'] },
        productId: { notIn: excludeProductIds }
      },
      _count: { productId: true },
      orderBy: { _count: { productId: 'desc' } },
      take: limit
    });

    const products = await prisma.product.findMany({
      where: {
        id: { in: trending.map(t => t.productId) },
        inStock: true
      }
    });

    return trending.map(t => {
      const product = products.find(p => p.id === t.productId);
      if (!product) return null;

      return {
        productId: t.productId,
        score: t._count.productId / 100, // Normalize score
        reason: 'এই সপ্তাহের জনপ্রিয় পণ্য',
        type: 'TRENDING' as RecommendationType,
        product
      };
    }).filter(Boolean) as RecommendationResult[];
  }

  static async getNewArrivals(
    limit: number,
    excludeProductIds: string[]
  ): Promise<RecommendationResult[]> {
    const products = await prisma.product.findMany({
      where: {
        id: { notIn: excludeProductIds },
        inStock: true
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    return products.map(product => ({
      productId: product.id,
      score: 1.0,
      reason: 'নতুন এসেছে',
      type: 'NEW_ARRIVALS' as RecommendationType,
      product
    }));
  }

  static async getPriceDropProducts(
    limit: number,
    excludeProductIds: string[]
  ): Promise<RecommendationResult[]> {
    const products = await prisma.product.findMany({
      where: {
        id: { notIn: excludeProductIds },
        inStock: true,
        salePrice: { not: null }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    return products.map(product => {
      const discountPercent = product.salePrice 
        ? ((product.price - product.salePrice) / product.price) * 100
        : 0;

      return {
        productId: product.id,
        score: discountPercent / 100,
        reason: `${Math.round(discountPercent)}% ছাড়`,
        type: 'PRICE_DROP' as RecommendationType,
        product
      };
    }).sort((a, b) => b.score - a.score);
  }

  static async getCartAbandonmentRecommendations(
    userId: string,
    limit: number
  ): Promise<RecommendationResult[]> {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true }
    });

    if (cartItems.length === 0) return [];

    return cartItems.slice(0, limit).map(item => ({
      productId: item.productId,
      score: 1.0,
      reason: 'আপনার কার্টে রয়েছে',
      type: 'CART_ABANDONMENT' as RecommendationType,
      product: item.product
    }));
  }

  static async getMixedRecommendations(
    userId?: string,
    productId?: string,
    limit: number = 10,
    excludeProductIds: string[] = []
  ): Promise<RecommendationResult[]> {
    const recommendations: RecommendationResult[] = [];
    const perType = Math.ceil(limit / 3);

    // Get trending products (33%)
    const trending = await this.getTrendingProducts(perType, excludeProductIds);
    recommendations.push(...trending);

    // Get personalized or similar products (33%)
    if (userId) {
      const personalized = await this.getPersonalizedRecommendations(
        userId, 
        perType, 
        [...excludeProductIds, ...recommendations.map(r => r.productId)]
      );
      recommendations.push(...personalized);
    } else if (productId) {
      const similar = await this.getSimilarProducts(
        productId, 
        perType, 
        [...excludeProductIds, ...recommendations.map(r => r.productId)]
      );
      recommendations.push(...similar);
    }

    // Get new arrivals (34%)
    const newArrivals = await this.getNewArrivals(
      limit - recommendations.length, 
      [...excludeProductIds, ...recommendations.map(r => r.productId)]
    );
    recommendations.push(...newArrivals);

    return recommendations.slice(0, limit);
  }

  static async getFallbackRecommendations(
    productId: string,
    limit: number,
    excludeProductIds: string[]
  ): Promise<RecommendationResult[]> {
    // Get products from same category
    const currentProduct = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!currentProduct) {
      return this.getTrendingProducts(limit, excludeProductIds);
    }

    const categoryProducts = await prisma.product.findMany({
      where: {
        category: currentProduct.category,
        id: { notIn: [productId, ...excludeProductIds] },
        inStock: true
      },
      orderBy: [
        { rating: 'desc' },
        { reviewCount: 'desc' }
      ],
      take: limit
    });

    return categoryProducts.map(product => ({
      productId: product.id,
      score: 0.5,
      reason: 'একই ক্যাটাগরির পণ্য',
      type: 'SIMILAR_PRODUCTS' as RecommendationType,
      product
    }));
  }

  // User behavior tracking
  static async trackUserBehavior(
    userId: string,
    productId: string,
    actionType: UserActionType,
    metadata?: any
  ) {
    try {
      await prisma.userBehavior.create({
        data: {
          userId,
          productId,
          actionType,
          sessionId: metadata?.sessionId,
          deviceType: metadata?.deviceType,
          source: metadata?.source,
          duration: metadata?.duration,
          metadata
        }
      });
    } catch (error) {
      console.error('Error tracking user behavior:', error);
    }
  }

  // Helper methods
  private static async getUserPreferences(userId: string) {
    let preferences = await prisma.userPreferences.findUnique({
      where: { userId }
    });

    if (!preferences) {
      // Create default preferences based on user behavior
      preferences = await this.createDefaultPreferences(userId);
    }

    return preferences;
  }

  private static async createDefaultPreferences(userId: string) {
    const userBehavior = await prisma.userBehavior.findMany({
      where: { userId },
      include: { 
        // We need to manually join with product data
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    // Analyze user's historical behavior to infer preferences
    const categoryCount: Record<string, number> = {};
    
    // We'll need to fetch products separately to get categories
    const productIds = userBehavior.map(b => b.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, category: true, price: true }
    });

    const productMap = new Map(products.map(p => [p.id, p]));

    userBehavior.forEach(behavior => {
      const product = productMap.get(behavior.productId);
      if (product) {
        categoryCount[product.category] = (categoryCount[product.category] || 0) + 1;
      }
    });

    const preferredCategories = Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([category]) => category);

    return await prisma.userPreferences.create({
      data: {
        userId,
        preferredCategories,
        shoppingStyle: 'BALANCED'
      }
    });
  }

  private static analyzeUserCategories(userBehavior: any[]): Record<string, number> {
    const categoryCount: Record<string, number> = {};
    
    userBehavior.forEach(behavior => {
      // This would need product data to get categories
      // For now, return empty object
    });

    return categoryCount;
  }

  private static calculatePersonalizedScore(
    product: Product,
    preferences: any,
    categoryInteractions: Record<string, number>
  ): number {
    let score = 0.5; // Base score

    // Category preference
    if (preferences.preferredCategories.includes(product.category)) {
      score += 0.3;
    }

    // Price preference
    if (preferences.preferredPriceRange) {
      const { min = 0, max = 999999 } = preferences.preferredPriceRange;
      if (product.price >= min && product.price <= max) {
        score += 0.2;
      }
    }

    // Product quality (rating)
    score += (product.rating / 5) * 0.3;

    // Popularity (review count) - normalized
    const popularityScore = Math.min(product.reviewCount / 100, 1) * 0.2;
    score += popularityScore;

    return Math.min(score, 1);
  }

  private static async storeRecommendations(
    userId: string,
    recommendations: RecommendationResult[],
    type?: RecommendationType,
    context?: any
  ) {
    try {
      const data = recommendations.map(rec => ({
        userId,
        productId: rec.productId,
        type: rec.type,
        score: rec.score,
        reason: rec.reason,
        context,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      }));

      await prisma.recommendation.createMany({
        data,
        skipDuplicates: true
      });
    } catch (error) {
      console.error('Error storing recommendations:', error);
    }
  }

  // Analytics methods
  static async markRecommendationShown(userId: string, productId: string, type: RecommendationType) {
    try {
      await prisma.recommendation.updateMany({
        where: {
          userId,
          productId,
          type,
          isShown: false
        },
        data: {
          isShown: true,
          shownAt: new Date()
        }
      });
    } catch (error) {
      console.error('Error marking recommendation as shown:', error);
    }
  }

  static async markRecommendationClicked(userId: string, productId: string, type: RecommendationType) {
    try {
      await prisma.recommendation.updateMany({
        where: {
          userId,
          productId,
          type
        },
        data: {
          isClicked: true,
          clickedAt: new Date()
        }
      });
    } catch (error) {
      console.error('Error marking recommendation as clicked:', error);
    }
  }

  static async markRecommendationPurchased(userId: string, productId: string) {
    try {
      await prisma.recommendation.updateMany({
        where: {
          userId,
          productId
        },
        data: {
          isPurchased: true,
          purchasedAt: new Date()
        }
      });
    } catch (error) {
      console.error('Error marking recommendation as purchased:', error);
    }
  }
}