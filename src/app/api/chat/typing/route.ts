import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import ChatService from '@/lib/chat';
import { prisma } from '@/lib/db';

// Set typing status
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
    const { roomId, isTyping } = body;

    if (!roomId || isTyping === undefined) {
      return NextResponse.json(
        { error: 'roomId and isTyping are required' },
        { status: 400 }
      );
    }

    await ChatService.setTypingStatus(roomId, user.id, isTyping);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error setting typing status:', error);
    return NextResponse.json(
      { error: 'Failed to set typing status' },
      { status: 500 }
    );
  }
}

// Get typing users
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');

    if (!roomId) {
      return NextResponse.json(
        { error: 'roomId is required' },
        { status: 400 }
      );
    }

    const typingUsers = await ChatService.getTypingUsers(roomId);

    return NextResponse.json({ typingUsers });
  } catch (error) {
    console.error('Error getting typing users:', error);
    return NextResponse.json(
      { error: 'Failed to get typing users' },
      { status: 500 }
    );
  }
}