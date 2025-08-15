import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import OrderTrackingService from '@/lib/orderTracking';
import { prisma } from '@/lib/db';
import { OrderStatus } from '@prisma/client';

// Update order status (admin only)
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
      status, 
      description, 
      location, 
      estimatedDelivery,
      isVisible = true 
    } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'orderId and status are required' },
        { status: 400 }
      );
    }

    // Validate status
    if (!Object.values(OrderStatus).includes(status)) {
      return NextResponse.json(
        { error: 'Invalid order status' },
        { status: 400 }
      );
    }

    const updatedOrder = await OrderTrackingService.updateOrderStatus({
      orderId,
      status,
      description,
      location,
      estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : undefined,
      updatedBy: user.id,
      isVisible,
    });

    // Send email notification if order status changed to shipped or delivered
    if (status === OrderStatus.SHIPPED || status === OrderStatus.DELIVERED) {
      try {
        const emailData = {
          orderNumber: updatedOrder.orderNumber,
          customerName: updatedOrder.user.name || 'Customer',
          customerEmail: updatedOrder.user.email,
          status,
          trackingNumber: updatedOrder.trackingNumber,
          estimatedDelivery: estimatedDelivery || updatedOrder.estimatedDelivery,
          currentLocation: location,
        };

        // Send notification email (fire and forget)
        fetch(`${process.env.NEXTAUTH_URL}/api/email/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'order_status_update',
            data: emailData,
          }),
        }).catch(error => {
          console.error('Failed to send status update email:', error);
        });
      } catch (emailError) {
        console.error('Email notification error:', emailError);
      }
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    );
  }
}

// Get order status history
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
    const includeHidden = searchParams.get('includeHidden') === 'true';

    if (!orderId) {
      return NextResponse.json(
        { error: 'orderId is required' },
        { status: 400 }
      );
    }

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

    const statusHistory = await OrderTrackingService.getOrderStatusHistory(
      orderId, 
      user.role === 'ADMIN' ? includeHidden : false
    );

    return NextResponse.json(statusHistory);
  } catch (error) {
    console.error('Error fetching order status history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order status history' },
      { status: 500 }
    );
  }
}