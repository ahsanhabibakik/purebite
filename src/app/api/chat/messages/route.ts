import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import ChatService from '@/lib/chat';
import { ChatMessageType } from '@prisma/client';
import { prisma } from '@/lib/db';

// Send a message
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
    const { roomId, message, messageType, fileUrl, fileName, fileSize } = body;

    if (!roomId || !message) {
      return NextResponse.json(
        { error: 'roomId and message are required' },
        { status: 400 }
      );
    }

    // Verify user has access to this room
    const room = await prisma.chatRoom.findUnique({
      where: { id: roomId },
      select: { userId: true, assignedTo: true },
    });

    if (!room) {
      return NextResponse.json({ error: 'Chat room not found' }, { status: 404 });
    }

    // Check access
    const hasAccess = room.userId === user.id || 
                     room.assignedTo === user.id || 
                     user.role === 'ADMIN';

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const newMessage = await ChatService.sendMessage({
      roomId,
      senderId: user.id,
      message,
      messageType: messageType as ChatMessageType,
      fileUrl,
      fileName,
      fileSize,
    });

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

// Search messages
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
    const query = searchParams.get('q');
    const roomId = searchParams.get('roomId');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    const messages = await ChatService.searchMessages(query, roomId || undefined, limit);

    // Filter results based on user access if not admin
    if (user.role !== 'ADMIN') {
      const filteredMessages = messages.filter(msg => 
        msg.room.user?.email === session.user?.email || msg.senderId === user.id
      );
      return NextResponse.json(filteredMessages);
    }

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error searching messages:', error);
    return NextResponse.json(
      { error: 'Failed to search messages' },
      { status: 500 }
    );
  }
}