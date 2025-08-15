import { prisma } from '@/lib/db';

// Simple token generator
function generateToken(length = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

interface CreateSharedWishlistData {
  title?: string;
  description?: string;
  isPublic?: boolean;
  expiresAt?: Date;
}

interface WishlistProduct {
  id: string;
  name: string;
  price: number;
  salePrice?: number;
  image: string;
  inStock: boolean;
  createdAt: string;
}

interface SharedWishlistData {
  id: string;
  shareToken: string;
  title: string;
  description?: string;
  isPublic: boolean;
  isActive: boolean;
  expiresAt?: string;
  viewCount: number;
  lastViewAt?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name?: string;
    email: string;
  };
  products: WishlistProduct[];
}

export class WishlistService {
  
  /**
   * Create a shared wishlist
   */
  static async createSharedWishlist(
    userId: string,
    data: CreateSharedWishlistData = {}
  ) {
    const shareToken = generateToken(16);
    
    return prisma.sharedWishlist.create({
      data: {
        userId,
        shareToken,
        title: data.title || 'আমার উইশলিস্ট',
        description: data.description,
        isPublic: data.isPublic || false,
        expiresAt: data.expiresAt,
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
  }

  /**
   * Get user's shared wishlists
   */
  static async getUserSharedWishlists(userId: string) {
    return prisma.sharedWishlist.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
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
  }

  /**
   * Get shared wishlist by token
   */
  static async getSharedWishlistByToken(shareToken: string): Promise<SharedWishlistData | null> {
    const sharedWishlist = await prisma.sharedWishlist.findUnique({
      where: { shareToken },
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

    if (!sharedWishlist) return null;

    // Check if expired
    if (sharedWishlist.expiresAt && sharedWishlist.expiresAt < new Date()) {
      return null;
    }

    // Check if active
    if (!sharedWishlist.isActive) {
      return null;
    }

    // Get wishlist products
    const wishlistItems = await prisma.wishlist.findMany({
      where: { userId: sharedWishlist.userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            salePrice: true,
            image: true,
            inStock: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Update view count
    await prisma.sharedWishlist.update({
      where: { id: sharedWishlist.id },
      data: {
        viewCount: { increment: 1 },
        lastViewAt: new Date(),
      },
    });

    return {
      id: sharedWishlist.id,
      shareToken: sharedWishlist.shareToken,
      title: sharedWishlist.title,
      description: sharedWishlist.description,
      isPublic: sharedWishlist.isPublic,
      isActive: sharedWishlist.isActive,
      expiresAt: sharedWishlist.expiresAt?.toISOString(),
      viewCount: sharedWishlist.viewCount + 1,
      lastViewAt: sharedWishlist.lastViewAt?.toISOString(),
      createdAt: sharedWishlist.createdAt.toISOString(),
      updatedAt: sharedWishlist.updatedAt.toISOString(),
      user: sharedWishlist.user,
      products: wishlistItems.map(item => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        salePrice: item.product.salePrice,
        image: item.product.image,
        inStock: item.product.inStock,
        createdAt: item.product.createdAt.toISOString(),
      })),
    };
  }

  /**
   * Update shared wishlist
   */
  static async updateSharedWishlist(
    shareToken: string,
    userId: string,
    data: Partial<CreateSharedWishlistData>
  ) {
    return prisma.sharedWishlist.updateMany({
      where: {
        shareToken,
        userId, // Ensure only owner can update
      },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Delete shared wishlist
   */
  static async deleteSharedWishlist(shareToken: string, userId: string) {
    return prisma.sharedWishlist.deleteMany({
      where: {
        shareToken,
        userId, // Ensure only owner can delete
      },
    });
  }

  /**
   * Toggle shared wishlist status
   */
  static async toggleSharedWishlistStatus(shareToken: string, userId: string) {
    const sharedWishlist = await prisma.sharedWishlist.findFirst({
      where: { shareToken, userId },
    });

    if (!sharedWishlist) {
      throw new Error('Shared wishlist not found');
    }

    return prisma.sharedWishlist.update({
      where: { id: sharedWishlist.id },
      data: {
        isActive: !sharedWishlist.isActive,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Get user's wishlist items
   */
  static async getUserWishlist(userId: string) {
    return prisma.wishlist.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            salePrice: true,
            image: true,
            images: true,
            inStock: true,
            category: true,
            rating: true,
            reviewCount: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Add product to wishlist
   */
  static async addToWishlist(userId: string, productId: string) {
    return prisma.wishlist.upsert({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
      create: {
        userId,
        productId,
      },
      update: {
        // No updates needed for existing items
      },
    });
  }

  /**
   * Remove product from wishlist
   */
  static async removeFromWishlist(userId: string, productId: string) {
    return prisma.wishlist.deleteMany({
      where: {
        userId,
        productId,
      },
    });
  }

  /**
   * Clear user's wishlist
   */
  static async clearWishlist(userId: string) {
    return prisma.wishlist.deleteMany({
      where: { userId },
    });
  }

  /**
   * Check if product is in user's wishlist
   */
  static async isInWishlist(userId: string, productId: string) {
    const item = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    return !!item;
  }

  /**
   * Get public shared wishlists
   */
  static async getPublicSharedWishlists(limit = 20, offset = 0) {
    return prisma.sharedWishlist.findMany({
      where: {
        isPublic: true,
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
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
      orderBy: [
        { lastViewAt: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit,
      skip: offset,
    });
  }

  /**
   * Generate share URL
   */
  static generateShareUrl(shareToken: string, baseUrl: string = '') {
    return `${baseUrl}/wishlist/shared/${shareToken}`;
  }

  /**
   * Get wishlist sharing statistics
   */
  static async getWishlistStats(userId: string) {
    const [totalShared, totalViews, totalProducts] = await Promise.all([
      prisma.sharedWishlist.count({
        where: { userId, isActive: true },
      }),
      prisma.sharedWishlist.aggregate({
        where: { userId },
        _sum: { viewCount: true },
      }),
      prisma.wishlist.count({
        where: { userId },
      }),
    ]);

    return {
      totalShared,
      totalViews: totalViews._sum.viewCount || 0,
      totalProducts,
    };
  }
}

export default WishlistService;