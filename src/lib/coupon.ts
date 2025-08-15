import { prisma } from '@/lib/db';
import { CouponType } from '@prisma/client';

interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  category?: string;
}

interface CouponValidationResult {
  isValid: boolean;
  errorMessage?: string;
  discount: number;
  finalAmount: number;
  couponId?: string;
}

interface CreateCouponData {
  code: string;
  name: string;
  description?: string;
  type: CouponType;
  value: number;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  maxUses?: number;
  maxUsesPerUser?: number;
  isPublic?: boolean;
  autoApply?: boolean;
  stackable?: boolean;
  validFrom: Date;
  validUntil: Date;
  applicableProducts?: string[];
  excludedProducts?: string[];
  applicableCategories?: string[];
  firstTimeOnly?: boolean;
  createdBy?: string;
}

interface CouponUsageStats {
  totalCoupons: number;
  activeCoupons: number;
  expiredCoupons: number;
  totalDiscountGiven: number;
  topPerformingCoupons: Array<{
    id: string;
    code: string;
    name: string;
    usedCount: number;
    totalDiscount: number;
  }>;
}

export class CouponService {
  
  /**
   * Create a new coupon
   */
  static async createCoupon(data: CreateCouponData) {
    // Validate dates
    if (data.validFrom >= data.validUntil) {
      throw new Error('Valid from date must be before valid until date');
    }

    // Validate coupon value
    if (data.type === CouponType.PERCENTAGE && (data.value <= 0 || data.value > 100)) {
      throw new Error('Percentage discount must be between 1 and 100');
    }

    if (data.type === CouponType.FIXED_AMOUNT && data.value <= 0) {
      throw new Error('Fixed amount discount must be greater than 0');
    }

    return prisma.coupon.create({
      data: {
        code: data.code.toUpperCase(),
        name: data.name,
        description: data.description,
        type: data.type,
        value: data.value,
        minOrderValue: data.minOrderValue,
        maxDiscountAmount: data.maxDiscountAmount,
        maxUses: data.maxUses,
        maxUsesPerUser: data.maxUsesPerUser,
        isPublic: data.isPublic || false,
        autoApply: data.autoApply || false,
        stackable: data.stackable || false,
        validFrom: data.validFrom,
        validUntil: data.validUntil,
        applicableProducts: data.applicableProducts || [],
        excludedProducts: data.excludedProducts || [],
        applicableCategories: data.applicableCategories || [],
        firstTimeOnly: data.firstTimeOnly || false,
        createdBy: data.createdBy,
      },
    });
  }

  /**
   * Update an existing coupon
   */
  static async updateCoupon(couponId: string, updates: Partial<CreateCouponData>) {
    return prisma.coupon.update({
      where: { id: couponId },
      data: {
        ...updates,
        code: updates.code?.toUpperCase(),
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Validate and apply coupon to cart
   */
  static async validateAndApplyCoupon(
    couponCode: string,
    cartItems: CartItem[],
    userId: string,
    subtotal: number
  ): Promise<CouponValidationResult> {
    const coupon = await prisma.coupon.findUnique({
      where: { code: couponCode.toUpperCase() },
      include: {
        userCoupons: {
          where: { userId },
        },
      },
    });

    if (!coupon) {
      return {
        isValid: false,
        errorMessage: 'Invalid coupon code',
        discount: 0,
        finalAmount: subtotal,
      };
    }

    // Check if coupon is active
    if (!coupon.isActive) {
      return {
        isValid: false,
        errorMessage: 'This coupon is no longer active',
        discount: 0,
        finalAmount: subtotal,
      };
    }

    // Check date validity
    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validUntil) {
      return {
        isValid: false,
        errorMessage: 'This coupon has expired or is not yet valid',
        discount: 0,
        finalAmount: subtotal,
      };
    }

    // Check maximum usage limit
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return {
        isValid: false,
        errorMessage: 'This coupon has reached its usage limit',
        discount: 0,
        finalAmount: subtotal,
      };
    }

    // Check per-user usage limit
    const userCoupon = coupon.userCoupons[0];
    if (coupon.maxUsesPerUser && userCoupon && userCoupon.usedCount >= coupon.maxUsesPerUser) {
      return {
        isValid: false,
        errorMessage: 'You have already used this coupon the maximum number of times',
        discount: 0,
        finalAmount: subtotal,
      };
    }

    // Check minimum order value
    if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
      return {
        isValid: false,
        errorMessage: `Minimum order value of ৳${coupon.minOrderValue} required`,
        discount: 0,
        finalAmount: subtotal,
      };
    }

    // Check if first-time only coupon
    if (coupon.firstTimeOnly) {
      const userOrderCount = await prisma.order.count({
        where: { userId },
      });

      if (userOrderCount > 0) {
        return {
          isValid: false,
          errorMessage: 'This coupon is only valid for first-time customers',
          discount: 0,
          finalAmount: subtotal,
        };
      }
    }

    // Check product/category applicability
    const applicableAmount = this.calculateApplicableAmount(coupon, cartItems);
    
    if (applicableAmount === 0) {
      return {
        isValid: false,
        errorMessage: 'This coupon is not applicable to any items in your cart',
        discount: 0,
        finalAmount: subtotal,
      };
    }

    // Calculate discount
    let discount = 0;
    if (coupon.type === CouponType.PERCENTAGE) {
      discount = (applicableAmount * coupon.value) / 100;
      
      // Apply maximum discount cap if set
      if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
        discount = coupon.maxDiscountAmount;
      }
    } else if (coupon.type === CouponType.FIXED_AMOUNT) {
      discount = Math.min(coupon.value, applicableAmount);
    } else if (coupon.type === CouponType.FREE_SHIPPING) {
      // Free shipping discount (would be handled in checkout logic)
      discount = 0; // Shipping cost would be set to 0
    }

    const finalAmount = Math.max(0, subtotal - discount);

    return {
      isValid: true,
      discount: Math.round(discount * 100) / 100,
      finalAmount: Math.round(finalAmount * 100) / 100,
      couponId: coupon.id,
    };
  }

  /**
   * Calculate applicable amount based on product/category restrictions
   */
  private static calculateApplicableAmount(coupon: any, cartItems: CartItem[]): number {
    let applicableAmount = 0;

    for (const item of cartItems) {
      let isApplicable = true;

      // Check if product is excluded
      if (coupon.excludedProducts.includes(item.productId)) {
        isApplicable = false;
      }

      // Check if specific products are defined and this product is not included
      if (coupon.applicableProducts.length > 0 && !coupon.applicableProducts.includes(item.productId)) {
        isApplicable = false;
      }

      // Check category restrictions
      if (coupon.applicableCategories.length > 0 && item.category) {
        if (!coupon.applicableCategories.includes(item.category)) {
          isApplicable = false;
        }
      }

      if (isApplicable) {
        applicableAmount += item.price * item.quantity;
      }
    }

    return applicableAmount;
  }

  /**
   * Use a coupon (increment usage count)
   */
  static async useCoupon(couponId: string, userId: string, discountAmount: number) {
    return prisma.$transaction(async (tx) => {
      // Increment coupon usage count
      await tx.coupon.update({
        where: { id: couponId },
        data: {
          usedCount: {
            increment: 1,
          },
        },
      });

      // Create or update user coupon usage
      await tx.userCoupon.upsert({
        where: {
          userId_couponId: {
            userId,
            couponId,
          },
        },
        create: {
          userId,
          couponId,
          usedCount: 1,
          lastUsedAt: new Date(),
        },
        update: {
          usedCount: {
            increment: 1,
          },
          lastUsedAt: new Date(),
        },
      });
    });
  }

  /**
   * Get available coupons for a user
   */
  static async getAvailableCoupons(userId: string) {
    const now = new Date();
    
    return prisma.coupon.findMany({
      where: {
        isActive: true,
        isPublic: true,
        validFrom: { lte: now },
        validUntil: { gte: now },
        OR: [
          { maxUses: null },
          { maxUses: { gt: prisma.coupon.fields.usedCount } },
        ],
      },
      include: {
        userCoupons: {
          where: { userId },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get auto-applicable coupons
   */
  static async getAutoApplicableCoupons(cartItems: CartItem[], subtotal: number, userId: string) {
    const now = new Date();
    
    const coupons = await prisma.coupon.findMany({
      where: {
        isActive: true,
        autoApply: true,
        validFrom: { lte: now },
        validUntil: { gte: now },
        OR: [
          { minOrderValue: null },
          { minOrderValue: { lte: subtotal } },
        ],
      },
      include: {
        userCoupons: {
          where: { userId },
        },
      },
      orderBy: { value: 'desc' }, // Apply highest value coupon first
    });

    const applicableCoupons = [];

    for (const coupon of coupons) {
      const validation = await this.validateAndApplyCoupon(
        coupon.code,
        cartItems,
        userId,
        subtotal
      );

      if (validation.isValid) {
        applicableCoupons.push({
          ...coupon,
          calculatedDiscount: validation.discount,
        });
      }
    }

    return applicableCoupons;
  }

  /**
   * Get all coupons (admin)
   */
  static async getAllCoupons(filters: {
    isActive?: boolean;
    type?: CouponType;
    search?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const { page = 1, limit = 20, ...filterConditions } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filterConditions.isActive !== undefined) {
      where.isActive = filterConditions.isActive;
    }

    if (filterConditions.type) {
      where.type = filterConditions.type;
    }

    if (filterConditions.search) {
      where.OR = [
        { code: { contains: filterConditions.search, mode: 'insensitive' } },
        { name: { contains: filterConditions.search, mode: 'insensitive' } },
        { description: { contains: filterConditions.search, mode: 'insensitive' } },
      ];
    }

    const [coupons, total] = await Promise.all([
      prisma.coupon.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              userCoupons: true,
              orders: true,
            },
          },
        },
      }),
      prisma.coupon.count({ where }),
    ]);

    return {
      coupons,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get coupon by ID
   */
  static async getCouponById(couponId: string) {
    return prisma.coupon.findUnique({
      where: { id: couponId },
      include: {
        userCoupons: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        orders: {
          select: {
            id: true,
            orderNumber: true,
            total: true,
            discount: true,
            createdAt: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
  }

  /**
   * Delete a coupon
   */
  static async deleteCoupon(couponId: string) {
    return prisma.coupon.delete({
      where: { id: couponId },
    });
  }

  /**
   * Get coupon usage statistics
   */
  static async getCouponStats(): Promise<CouponUsageStats> {
    const now = new Date();

    const [
      totalCoupons,
      activeCoupons,
      expiredCoupons,
      topCoupons,
      totalDiscountData,
    ] = await Promise.all([
      prisma.coupon.count(),
      prisma.coupon.count({
        where: {
          isActive: true,
          validUntil: { gte: now },
        },
      }),
      prisma.coupon.count({
        where: {
          validUntil: { lt: now },
        },
      }),
      prisma.coupon.findMany({
        where: {
          usedCount: { gt: 0 },
        },
        orderBy: { usedCount: 'desc' },
        take: 10,
        select: {
          id: true,
          code: true,
          name: true,
          usedCount: true,
          orders: {
            select: {
              discount: true,
            },
          },
        },
      }),
      prisma.order.aggregate({
        _sum: {
          discount: true,
        },
        where: {
          couponId: { not: null },
        },
      }),
    ]);

    const topPerformingCoupons = topCoupons.map(coupon => ({
      id: coupon.id,
      code: coupon.code,
      name: coupon.name,
      usedCount: coupon.usedCount,
      totalDiscount: coupon.orders.reduce((sum, order) => sum + order.discount, 0),
    }));

    return {
      totalCoupons,
      activeCoupons,
      expiredCoupons,
      totalDiscountGiven: totalDiscountData._sum.discount || 0,
      topPerformingCoupons,
    };
  }

  /**
   * Generate a unique coupon code
   */
  static async generateUniqueCouponCode(prefix = 'SAVE'): Promise<string> {
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
      const code = `${prefix}${randomSuffix}`;

      const existingCoupon = await prisma.coupon.findUnique({
        where: { code },
      });

      if (!existingCoupon) {
        return code;
      }

      attempts++;
    }

    throw new Error('Failed to generate unique coupon code');
  }

  /**
   * Bulk create coupons
   */
  static async bulkCreateCoupons(
    baseData: Omit<CreateCouponData, 'code'>,
    count: number,
    codePrefix = 'BULK'
  ) {
    const coupons = [];

    for (let i = 0; i < count; i++) {
      const code = await this.generateUniqueCouponCode(codePrefix);
      coupons.push({
        ...baseData,
        code,
        name: `${baseData.name} #${i + 1}`,
      });
    }

    return prisma.coupon.createMany({
      data: coupons,
    });
  }
}

export default CouponService;