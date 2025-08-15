import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import ReviewService from '@/lib/review';
import { prisma } from '@/lib/db';

// Get reviewable products for the authenticated user
export async function GET(request: NextRequest) {
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

    const reviewableProducts = await ReviewService.getReviewableProducts(user.id);
    return NextResponse.json(reviewableProducts);
  } catch (error) {
    console.error('Error fetching reviewable products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviewable products' },
      { status: 500 }
    );
  }
}