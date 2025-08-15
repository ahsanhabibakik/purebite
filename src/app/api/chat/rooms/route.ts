import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import ChatService from '@/lib/chat';
import { ChatPriority, ChatStatus } from '@prisma/client';
import { prisma } from '@/lib/db';

// Get chat rooms
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') as ChatStatus | null;
    const assignedTo = searchParams.get('assignedTo');
    const isArchived = searchParams.get('archived') === 'true';

    const filters: any = {};
    
    if (status) filters.status = status;
    if (assignedTo !== null) filters.assignedTo = assignedTo;
    if (isArchived !== undefined) filters.isArchived = isArchived;

    // For non-admin users, only show their own chat rooms
    if (user.role !== 'ADMIN') {
      filters.userId = user.id;
    }

    const result = await ChatService.getChatRooms(filters, page, limit);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching chat rooms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat rooms' },
      { status: 500 }
    );
  }
}

// Create a new chat room
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { title, priority, initialMessage } = body;

    // Check if user already has an open chat room
    const existingRoom = await prisma.chatRoom.findFirst({
      where: {
        userId: user.id,
        status: {
          in: [ChatStatus.OPEN, ChatStatus.IN_PROGRESS],
        },
      },
    });

    if (existingRoom) {
      return NextResponse.json({
        error: 'You already have an active chat session',
        roomId: existingRoom.id,
      }, { status: 400 });
    }

    const room = await ChatService.createChatRoom({
      userId: user.id,
      title,
      priority: priority as ChatPriority,
      initialMessage,
    });

    return NextResponse.json(room, { status: 201 });
  } catch (error) {
    console.error('Error creating chat room:', error);
    return NextResponse.json(
      { error: 'Failed to create chat room' },
      { status: 500 }
    );
  }
}