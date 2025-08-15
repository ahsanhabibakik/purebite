import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import CouponService from '@/lib/coupon';
import { prisma } from '@/lib/db';
import { CouponType } from '@prisma/client';

// Get coupons
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'available' or 'all'
    const isActive = searchParams.get('isActive');
    const couponType = searchParams.get('couponType') as CouponType;
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (type === 'available') {
      // Get available coupons for the user
      const coupons = await CouponService.getAvailableCoupons(user.id);
      return NextResponse.json(coupons);
    } else {
      // Admin access required for all coupons
      if (user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
      }

      const filters = {
        isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
        type: couponType,
        search,
        page,
        limit,
      };

      const result = await CouponService.getAllCoupons(filters);
      return NextResponse.json(result);
    }
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json(
      { error: 'Failed to fetch coupons' },
      { status: 500 }
    );
  }
}

// Create coupon (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const {
      code,
      name,
      description,
      type,
      value,
      minOrderValue,
      maxDiscountAmount,
      maxUses,
      maxUsesPerUser,
      isPublic,
      autoApply,
      stackable,
      validFrom,
      validUntil,
      applicableProducts,
      excludedProducts,
      applicableCategories,
      firstTimeOnly,
      bulkCount,
    } = body;

    if (!code || !name || !type || value === undefined || !validFrom || !validUntil) {
      return NextResponse.json(
        { error: 'Code, name, type, value, validFrom, and validUntil are required' },
        { status: 400 }
      );
    }

    if (bulkCount && bulkCount > 1) {
      // Bulk create coupons
      const result = await CouponService.bulkCreateCoupons(
        {
          name,
          description,
          type,
          value,
          minOrderValue,
          maxDiscountAmount,
          maxUses,
          maxUsesPerUser,
          isPublic,
          autoApply,
          stackable,
          validFrom: new Date(validFrom),
          validUntil: new Date(validUntil),
          applicableProducts,
          excludedProducts,
          applicableCategories,
          firstTimeOnly,
          createdBy: user.id,
        },
        bulkCount,
        code
      );

      return NextResponse.json({
        success: true,
        message: `${bulkCount} coupons created successfully`,
        count: result.count,
      }, { status: 201 });
    } else {
      // Create single coupon
      const coupon = await CouponService.createCoupon({
        code,
        name,
        description,
        type,
        value,
        minOrderValue,
        maxDiscountAmount,
        maxUses,
        maxUsesPerUser,
        isPublic,
        autoApply,
        stackable,
        validFrom: new Date(validFrom),
        validUntil: new Date(validUntil),
        applicableProducts,
        excludedProducts,
        applicableCategories,
        firstTimeOnly,
        createdBy: user.id,
      });

      return NextResponse.json(coupon, { status: 201 });
    }
  } catch (error) {
    console.error('Error creating coupon:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('unique constraint')) {
        return NextResponse.json(
          { error: 'Coupon code already exists' },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create coupon' },
      { status: 500 }
    );
  }
}