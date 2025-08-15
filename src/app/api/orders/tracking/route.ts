import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import OrderTrackingService from '@/lib/orderTracking';
import { prisma } from '@/lib/db';
import { OrderStatus } from '@prisma/client';

// Get tracking information
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
    const orderId = searchParams.get('orderId');
    const trackingNumber = searchParams.get('trackingNumber');

    if (!orderId && !trackingNumber) {
      return NextResponse.json(
        { error: 'Either orderId or trackingNumber is required' },
        { status: 400 }
      );
    }

    let tracking;
    
    if (trackingNumber) {
      tracking = await OrderTrackingService.getTrackingByNumber(trackingNumber);
    } else if (orderId) {
      // Verify user owns this order or is admin
      if (user.role !== 'ADMIN') {
        const order = await prisma.order.findUnique({
          where: { id: orderId },
          select: { userId: true },
        });
        
        if (!order || order.userId !== user.id) {
          return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }
      }
      
      tracking = await OrderTrackingService.getOrderTracking(orderId);
    }

    if (!tracking) {
      return NextResponse.json({ error: 'Tracking information not found' }, { status: 404 });
    }

    // Generate tracking URL if available
    const trackingUrl = tracking.carrier?.trackingUrl 
      ? OrderTrackingService.generateTrackingUrl(tracking.trackingNumber, tracking.carrier.trackingUrl)
      : null;

    return NextResponse.json({
      ...tracking,
      trackingUrl,
    });
  } catch (error) {
    console.error('Error fetching tracking information:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tracking information' },
      { status: 500 }
    );
  }
}

// Create or update tracking information (admin only)
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
    const { 
      orderId, 
      trackingNumber, 
      carrierId, 
      currentLocation, 
      estimatedDelivery,
      recipientName,
      recipientPhone 
    } = body;

    if (!orderId || !trackingNumber) {
      return NextResponse.json(
        { error: 'orderId and trackingNumber are required' },
        { status: 400 }
      );
    }

    // Check if tracking already exists
    const existingTracking = await prisma.orderTracking.findUnique({
      where: { orderId },
    });

    let tracking;
    
    if (existingTracking) {
      // Update existing tracking
      tracking = await OrderTrackingService.updateTracking(orderId, {
        currentLocation,
        estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : undefined,
        recipientName,
        recipientPhone,
      });
    } else {
      // Create new tracking
      tracking = await OrderTrackingService.createOrderTracking({
        orderId,
        trackingNumber,
        carrierId,
        currentLocation,
        estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : undefined,
        recipientName,
        recipientPhone,
      });
    }

    return NextResponse.json(tracking, { status: existingTracking ? 200 : 201 });
  } catch (error) {
    console.error('Error creating/updating tracking:', error);
    return NextResponse.json(
      { error: 'Failed to create/update tracking information' },
      { status: 500 }
    );
  }
}