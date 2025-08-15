import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import WishlistService from '@/lib/wishlist';
import { prisma } from '@/lib/db';

// Get shared wishlist by token
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const sharedWishlist = await WishlistService.getSharedWishlistByToken(params.token);

    if (!sharedWishlist) {
      return NextResponse.json(
        { error: 'Shared wishlist not found or expired' },
        { status: 404 }
      );
    }

    return NextResponse.json(sharedWishlist);
  } catch (error) {
    console.error('Error fetching shared wishlist:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shared wishlist' },
      { status: 500 }
    );
  }
}

// Update shared wishlist
export async function PUT(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
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

    const result = await WishlistService.updateSharedWishlist(
      params.token,
      user.id,
      {
        title,
        description,
        isPublic,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      }
    );

    if (result.count === 0) {
      return NextResponse.json(
        { error: 'Shared wishlist not found or not authorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating shared wishlist:', error);
    return NextResponse.json(
      { error: 'Failed to update shared wishlist' },
      { status: 500 }
    );
  }
}

// Delete shared wishlist
export async function DELETE(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
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

    const result = await WishlistService.deleteSharedWishlist(params.token, user.id);

    if (result.count === 0) {
      return NextResponse.json(
        { error: 'Shared wishlist not found or not authorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting shared wishlist:', error);
    return NextResponse.json(
      { error: 'Failed to delete shared wishlist' },
      { status: 500 }
    );
  }
}