import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import ChatService from '@/lib/chat';
import { prisma } from '@/lib/db';

// Get chat statistics (admin only)
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

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const stats = await ChatService.getChatStats();

    // Get unread count for admin
    const unreadCount = await ChatService.getUnreadCount(user.id);

    return NextResponse.json({
      ...stats,
      unreadCount,
    });
  } catch (error) {
    console.error('Error fetching chat stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat stats' },
      { status: 500 }
    );
  }
}