import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import WishlistService from '@/lib/wishlist';
import { prisma } from '@/lib/db';

// Create shared wishlist
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
    const { title, description, isPublic, expiresAt } = body;

    // Check if user has any wishlist items
    const wishlistCount = await prisma.wishlist.count({
      where: { userId: user.id },
    });

    if (wishlistCount === 0) {
      return NextResponse.json(
        { error: 'Cannot share empty wishlist' },
        { status: 400 }
      );
    }

    const sharedWishlist = await WishlistService.createSharedWishlist(user.id, {
      title,
      description,
      isPublic,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    });

    const shareUrl = WishlistService.generateShareUrl(
      sharedWishlist.shareToken,
      request.nextUrl.origin
    );

    return NextResponse.json({
      ...sharedWishlist,
      shareUrl,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating shared wishlist:', error);
    return NextResponse.json(
      { error: 'Failed to create shared wishlist' },
      { status: 500 }
    );
  }
}

// Get user's shared wishlists
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

    const sharedWishlists = await WishlistService.getUserSharedWishlists(user.id);

    // Add share URLs
    const wishlistsWithUrls = sharedWishlists.map(wishlist => ({
      ...wishlist,
      shareUrl: WishlistService.generateShareUrl(
        wishlist.shareToken,
        request.nextUrl.origin
      ),
    }));

    return NextResponse.json(wishlistsWithUrls);
  } catch (error) {
    console.error('Error fetching shared wishlists:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shared wishlists' },
      { status: 500 }
    );
  }
}