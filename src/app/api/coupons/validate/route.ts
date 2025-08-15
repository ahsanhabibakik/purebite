import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import CouponService from '@/lib/coupon';
import { prisma } from '@/lib/db';

// Validate coupon
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { couponCode, cartItems, subtotal } = body;

    if (!couponCode || !cartItems || subtotal === undefined) {
      return NextResponse.json(
        { error: 'Coupon code, cart items, and subtotal are required' },
        { status: 400 }
      );
    }

    // Validate cart items structure
    for (const item of cartItems) {
      if (!item.productId || !item.quantity || !item.price) {
        return NextResponse.json(
          { error: 'Invalid cart item structure' },
          { status: 400 }
        );
      }
    }

    // Get product categories for validation
    const productIds = cartItems.map((item: any) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, category: true },
    });

    // Add category information to cart items
    const enrichedCartItems = cartItems.map((item: any) => {
      const product = products.find(p => p.id === item.productId);
      return {
        ...item,
        category: product?.category,
      };
    });

    const validation = await CouponService.validateAndApplyCoupon(
      couponCode,
      enrichedCartItems,
      user.id,
      subtotal
    );

    return NextResponse.json(validation);
  } catch (error) {
    console.error('Error validating coupon:', error);
    return NextResponse.json(
      { error: 'Failed to validate coupon' },
      { status: 500 }
    );
  }
}