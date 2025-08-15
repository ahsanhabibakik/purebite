import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import ReviewService from '@/lib/review';
import { prisma } from '@/lib/db';
import { ReviewReportReason } from '@prisma/client';

// Report a review
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
    const { reviewId, reason, comment } = body;

    if (!reviewId || !reason) {
      return NextResponse.json(
        { error: 'Review ID and reason are required' },
        { status: 400 }
      );
    }

    // Validate reason
    if (!Object.values(ReviewReportReason).includes(reason)) {
      return NextResponse.json(
        { error: 'Invalid report reason' },
        { status: 400 }
      );
    }

    const report = await ReviewService.reportReview(
      reviewId,
      user.id,
      reason as ReviewReportReason,
      comment
    );

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error('Error reporting review:', error);
    return NextResponse.json(
      { error: 'Failed to report review' },
      { status: 500 }
    );
  }
}