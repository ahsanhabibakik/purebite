import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (order.userId !== user?.id && user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Add tracking timeline based on order status
    const trackingSteps = getTrackingSteps(order.status as string, order.createdAt, order.updatedAt);

    return NextResponse.json({
      ...order,
      trackingSteps,
      shippingAddress: order.shippingAddress ? JSON.parse(order.shippingAddress as string) : null,
      billingAddress: order.billingAddress ? JSON.parse(order.billingAddress as string) : null,
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const data = await request.json();
    const { status, trackingNumber, estimatedDelivery } = data;

    const order = await prisma.order.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(trackingNumber && { trackingNumber }),
        ...(estimatedDelivery && { estimatedDelivery: new Date(estimatedDelivery) }),
        ...(status === 'DELIVERED' && { deliveredAt: new Date() }),
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    // Create notification for status update
    if (status) {
      await prisma.notification.create({
        data: {
          userId: order.userId,
          title: 'অর্ডার স্ট্যাটাস আপডেট',
          message: `আপনার অর্ডার #${order.orderNumber} এর স্ট্যাটাস ${getStatusLabel(status)} এ পরিবর্তিত হয়েছে`,
          type: 'ORDER_UPDATE',
          data: {
            orderId: order.id,
            orderNumber: order.orderNumber,
            status,
          },
        },
      });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

function getTrackingSteps(status: string, createdAt: Date, updatedAt: Date) {
  const steps = [
    {
      status: 'PENDING',
      label: 'অর্ডার গৃহীত',
      date: createdAt.toISOString(),
      completed: true,
    },
    {
      status: 'CONFIRMED',
      label: 'অর্ডার নিশ্চিত',
      date: status !== 'PENDING' ? updatedAt.toISOString() : '',
      completed: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(status),
    },
    {
      status: 'PROCESSING',
      label: 'প্রস্তুতি চলছে',
      date: ['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(status) ? updatedAt.toISOString() : '',
      completed: ['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(status),
    },
    {
      status: 'SHIPPED',
      label: 'পাঠানো হয়েছে',
      date: ['SHIPPED', 'DELIVERED'].includes(status) ? updatedAt.toISOString() : '',
      completed: ['SHIPPED', 'DELIVERED'].includes(status),
    },
    {
      status: 'DELIVERED',
      label: 'ডেলিভার সম্পন্ন',
      date: status === 'DELIVERED' ? updatedAt.toISOString() : '',
      completed: status === 'DELIVERED',
    },
  ];

  return steps;
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: 'অপেক্ষমাণ',
    CONFIRMED: 'নিশ্চিত',
    PROCESSING: 'প্রস্তুতি চলছে',
    SHIPPED: 'পাঠানো হয়েছে',
    DELIVERED: 'ডেলিভার সম্পন্ন',
    CANCELLED: 'বাতিল',
    REFUNDED: 'রিফান্ড করা হয়েছে',
  };
  return labels[status] || status;
}