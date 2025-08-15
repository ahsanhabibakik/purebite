import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import ChatService from '@/lib/chat';
import { ChatStatus } from '@prisma/client';
import { prisma } from '@/lib/db';

// Get a specific chat room
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const room = await ChatService.getChatRoom(params.id, user.id);

    // Mark messages as read
    await ChatService.markMessagesAsRead(params.id, user.id);

    return NextResponse.json(room);
  } catch (error) {
    console.error('Error fetching chat room:', error);
    
    if (error instanceof Error && error.message === 'Access denied') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    
    if (error instanceof Error && error.message === 'Chat room not found') {
      return NextResponse.json({ error: 'Chat room not found' }, { status: 404 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch chat room' },
      { status: 500 }
    );
  }
}

// Update chat room (assign agent, change status, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { action, status, assignedTo, isArchived } = body;

    switch (action) {
      case 'assign':
        if (user.role !== 'ADMIN') {
          return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }
        const assignedRoom = await ChatService.assignChatRoom(params.id, assignedTo);
        return NextResponse.json(assignedRoom);

      case 'status':
        const updatedRoom = await ChatService.updateChatRoomStatus(
          params.id,
          status as ChatStatus,
          user.id
        );
        return NextResponse.json(updatedRoom);

      case 'archive':
        if (user.role !== 'ADMIN') {
          return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }
        const archivedRoom = await ChatService.archiveChatRoom(params.id, isArchived);
        return NextResponse.json(archivedRoom);

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error updating chat room:', error);
    return NextResponse.json(
      { error: 'Failed to update chat room' },
      { status: 500 }
    );
  }
}