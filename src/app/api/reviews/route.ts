import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import ReviewService from '@/lib/review';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const userId = searchParams.get('userId');
    const rating = searchParams.get('rating');
    const verifiedOnly = searchParams.get('verifiedOnly') === 'true';
    const sortBy = searchParams.get('sortBy') as any;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (productId) {
      // Get reviews for a specific product
      const result = await ReviewService.getProductReviews(productId, {
        rating: rating ? parseInt(rating) : undefined,
        verifiedOnly,
        sortBy,
        page,
        limit,
      });
      return NextResponse.json(result);
    }

    if (userId) {
      // Get reviews by a specific user (requires authentication)
      const session = await getServerSession(authOptions);
      if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });

      if (!user || user.id !== userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      const result = await ReviewService.getUserReviews(userId, page, limit);
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { error: 'Product ID or User ID is required' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

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
    const {
      productId,
      orderId,
      rating,
      title,
      comment,
      pros,
      cons,
      images,
    } = body;

    if (!productId || !rating || !comment) {
      return NextResponse.json(
        { error: 'Product ID, rating, and comment are required' },
        { status: 400 }
      );
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const review = await ReviewService.createReview(user.id, {
      productId,
      orderId,
      rating,
      title,
      comment,
      pros,
      cons,
      images,
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}