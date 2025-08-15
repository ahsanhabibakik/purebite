import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { RecommendationService } from '@/lib/recommendations';
import { RecommendationType } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    
    const type = searchParams.get('type') as RecommendationType | null;
    const productId = searchParams.get('productId');
    const limit = parseInt(searchParams.get('limit') || '10');
    const includeOutOfStock = searchParams.get('includeOutOfStock') === 'true';
    const excludeIds = searchParams.get('excludeIds')?.split(',').filter(Boolean) || [];

    // Get user ID if session exists
    let userId: string | undefined;
    if (session?.user?.email) {
      try {
        const userResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/users/profile`, {
          headers: {
            cookie: request.headers.get('cookie') || ''
          }
        });
        if (userResponse.ok) {
          const userData = await userResponse.json();
          userId = userData.id;
        }
      } catch (error) {
        console.error('Error getting user ID:', error);
      }
    }

    const recommendations = await RecommendationService.getRecommendations({
      userId,
      productId: productId || undefined,
      type: type || undefined,
      limit,
      includeOutOfStock,
      excludeProductIds: excludeIds,
      context: {
        userAgent: request.headers.get('user-agent'),
        referer: request.headers.get('referer')
      }
    });

    // Mark recommendations as shown if user is logged in
    if (userId && recommendations.length > 0) {
      for (const rec of recommendations) {
        await RecommendationService.markRecommendationShown(userId, rec.productId, rec.type);
      }
    }

    return NextResponse.json({
      recommendations,
      meta: {
        total: recommendations.length,
        userId: userId || null,
        type,
        productId
      }
    });

  } catch (error) {
    console.error('Error getting recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to get recommendations' },
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

    const body = await request.json();
    const { action, productId, type, metadata } = body;

    // Get user ID
    const userResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/users/profile`, {
      headers: {
        cookie: request.headers.get('cookie') || ''
      }
    });
    
    if (!userResponse.ok) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = await userResponse.json();
    const userId = userData.id;

    switch (action) {
      case 'track_view':
        await RecommendationService.trackUserBehavior(
          userId,
          productId,
          'VIEW',
          {
            ...metadata,
            userAgent: request.headers.get('user-agent'),
            referer: request.headers.get('referer')
          }
        );
        break;

      case 'track_click':
        if (type) {
          await RecommendationService.markRecommendationClicked(userId, productId, type);
        }
        await RecommendationService.trackUserBehavior(
          userId,
          productId,
          'VIEW',
          { source: 'recommendation', type, ...metadata }
        );
        break;

      case 'track_add_to_cart':
        if (type) {
          await RecommendationService.markRecommendationClicked(userId, productId, type);
        }
        await RecommendationService.trackUserBehavior(
          userId,
          productId,
          'ADD_TO_CART',
          { source: type ? 'recommendation' : 'direct', type, ...metadata }
        );
        break;

      case 'track_purchase':
        await RecommendationService.markRecommendationPurchased(userId, productId);
        await RecommendationService.trackUserBehavior(
          userId,
          productId,
          'PURCHASE',
          metadata
        );
        break;

      case 'track_wishlist_add':
        await RecommendationService.trackUserBehavior(
          userId,
          productId,
          'WISHLIST_ADD',
          metadata
        );
        break;

      case 'track_share':
        await RecommendationService.trackUserBehavior(
          userId,
          productId,
          'SHARE',
          metadata
        );
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error tracking recommendation action:', error);
    return NextResponse.json(
      { error: 'Failed to track action' },
      { status: 500 }
    );
  }
}