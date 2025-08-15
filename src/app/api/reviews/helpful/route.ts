import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import ReviewService from '@/lib/review';
import { prisma } from '@/lib/db';

// Mark review as helpful/not helpful
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
    const { reviewId, isHelpful } = body;

    if (!reviewId || typeof isHelpful !== 'boolean') {
      return NextResponse.json(
        { error: 'Review ID and isHelpful boolean are required' },
        { status: 400 }
      );
    }

    await ReviewService.markReviewHelpful(reviewId, user.id, isHelpful);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking review as helpful:', error);
    return NextResponse.json(
      { error: 'Failed to mark review as helpful' },
      { status: 500 }
    );
  }
}