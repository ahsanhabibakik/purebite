import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import CouponService from '@/lib/coupon';
import { prisma } from '@/lib/db';

// Get coupon by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const coupon = await CouponService.getCouponById(params.id);

    if (!coupon) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
    }

    return NextResponse.json(coupon);
  } catch (error) {
    console.error('Error fetching coupon:', error);
    return NextResponse.json(
      { error: 'Failed to fetch coupon' },
      { status: 500 }
    );
  }
}

// Update coupon
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      isActive,
      isPublic,
      autoApply,
      stackable,
      validFrom,
      validUntil,
      applicableProducts,
      excludedProducts,
      applicableCategories,
      firstTimeOnly,
    } = body;

    const updates: any = {};
    
    if (code !== undefined) updates.code = code;
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (type !== undefined) updates.type = type;
    if (value !== undefined) updates.value = value;
    if (minOrderValue !== undefined) updates.minOrderValue = minOrderValue;
    if (maxDiscountAmount !== undefined) updates.maxDiscountAmount = maxDiscountAmount;
    if (maxUses !== undefined) updates.maxUses = maxUses;
    if (maxUsesPerUser !== undefined) updates.maxUsesPerUser = maxUsesPerUser;
    if (isActive !== undefined) updates.isActive = isActive;
    if (isPublic !== undefined) updates.isPublic = isPublic;
    if (autoApply !== undefined) updates.autoApply = autoApply;
    if (stackable !== undefined) updates.stackable = stackable;
    if (validFrom !== undefined) updates.validFrom = new Date(validFrom);
    if (validUntil !== undefined) updates.validUntil = new Date(validUntil);
    if (applicableProducts !== undefined) updates.applicableProducts = applicableProducts;
    if (excludedProducts !== undefined) updates.excludedProducts = excludedProducts;
    if (applicableCategories !== undefined) updates.applicableCategories = applicableCategories;
    if (firstTimeOnly !== undefined) updates.firstTimeOnly = firstTimeOnly;

    const coupon = await CouponService.updateCoupon(params.id, updates);

    return NextResponse.json(coupon);
  } catch (error) {
    console.error('Error updating coupon:', error);
    
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
      { error: 'Failed to update coupon' },
      { status: 500 }
    );
  }
}

// Delete coupon
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    await CouponService.deleteCoupon(params.id);

    return NextResponse.json({ 
      success: true, 
      message: 'Coupon deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    return NextResponse.json(
      { error: 'Failed to delete coupon' },
      { status: 500 }
    );
  }
}