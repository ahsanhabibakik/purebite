import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import CouponService from '@/lib/coupon';
import { prisma } from '@/lib/db';

// Get auto-applicable coupons
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
    const { cartItems, subtotal } = body;

    if (!cartItems || subtotal === undefined) {
      return NextResponse.json(
        { error: 'Cart items and subtotal are required' },
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

    const autoApplicableCoupons = await CouponService.getAutoApplicableCoupons(
      enrichedCartItems,
      subtotal,
      user.id
    );

    return NextResponse.json(autoApplicableCoupons);
  } catch (error) {
    console.error('Error getting auto-applicable coupons:', error);
    return NextResponse.json(
      { error: 'Failed to get auto-applicable coupons' },
      { status: 500 }
    );
  }
}