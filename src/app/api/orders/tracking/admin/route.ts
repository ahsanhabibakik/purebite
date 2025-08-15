import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import OrderTrackingService from '@/lib/orderTracking';
import { prisma } from '@/lib/db';
import { OrderStatus } from '@prisma/client';

// Get all tracking information (admin only)
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') as OrderStatus | null;
    const carrierId = searchParams.get('carrierId');
    const isDelivered = searchParams.get('isDelivered');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    const filters: any = { page, limit };
    
    if (status) filters.status = status;
    if (carrierId) filters.carrierId = carrierId;
    if (isDelivered !== null) filters.isDelivered = isDelivered === 'true';
    if (dateFrom) filters.dateFrom = new Date(dateFrom);
    if (dateTo) filters.dateTo = new Date(dateTo);

    const result = await OrderTrackingService.getOrdersWithTracking(filters);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching admin tracking data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tracking data' },
      { status: 500 }
    );
  }
}