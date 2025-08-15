import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import OrderTrackingService from '@/lib/orderTracking';
import { prisma } from '@/lib/db';

// Simulate tracking update (admin only - for demo purposes)
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

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { trackingNumber, event } = body;

    if (!trackingNumber || !event) {
      return NextResponse.json(
        { error: 'trackingNumber and event are required' },
        { status: 400 }
      );
    }

    // Validate event structure
    if (!event.timestamp || !event.status || !event.location || !event.description) {
      return NextResponse.json(
        { error: 'Event must have timestamp, status, location, and description' },
        { status: 400 }
      );
    }

    const tracking = await OrderTrackingService.simulateTrackingUpdate(trackingNumber, {
      timestamp: event.timestamp,
      status: event.status,
      location: event.location,
      description: event.description,
      details: event.details,
    });

    return NextResponse.json({
      success: true,
      message: 'Tracking event simulated successfully',
      tracking,
    });
  } catch (error) {
    console.error('Error simulating tracking update:', error);
    
    if (error instanceof Error && error.message === 'Tracking not found') {
      return NextResponse.json(
        { error: 'Tracking number not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to simulate tracking update' },
      { status: 500 }
    );
  }
}