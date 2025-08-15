import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get recommendation stats
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Total active recommendations
    const totalRecommendations = await prisma.recommendation.count({
      where: {
        expiresAt: { gt: new Date() }
      }
    });

    // Active users (users who have recommendations in last 7 days)
    const activeUsers = await prisma.recommendation.findMany({
      where: {
        createdAt: { gte: sevenDaysAgo }
      },
      select: { userId: true },
      distinct: ['userId']
    });

    // Click-through rate
    const totalShown = await prisma.recommendation.count({
      where: {
        isShown: true,
        createdAt: { gte: sevenDaysAgo }
      }
    });

    const totalClicked = await prisma.recommendation.count({
      where: {
        isClicked: true,
        createdAt: { gte: sevenDaysAgo }
      }
    });

    const clickThroughRate = totalShown > 0 ? (totalClicked / totalShown) * 100 : 0;

    // Conversion rate
    const totalPurchased = await prisma.recommendation.count({
      where: {
        isPurchased: true,
        createdAt: { gte: sevenDaysAgo }
      }
    });

    const conversionRate = totalClicked > 0 ? (totalPurchased / totalClicked) * 100 : 0;

    // Top recommendation type
    const recommendationTypes = await prisma.recommendation.groupBy({
      by: ['type'],
      where: {
        createdAt: { gte: sevenDaysAgo }
      },
      _count: { type: true },
      orderBy: { _count: { type: 'desc' } },
      take: 1
    });

    const topRecommendationType = recommendationTypes[0]?.type || 'PERSONALIZED';

    // Last similarity calculation
    const lastSimilarity = await prisma.productSimilarity.findFirst({
      orderBy: { lastUpdated: 'desc' },
      select: { lastUpdated: true }
    });

    const stats = {
      totalRecommendations,
      activeUsers: activeUsers.length,
      clickThroughRate,
      conversionRate,
      topRecommendationType,
      lastCalculated: lastSimilarity?.lastUpdated || null
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error fetching recommendation stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}