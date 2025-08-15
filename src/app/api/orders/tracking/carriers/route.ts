import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import OrderTrackingService from '@/lib/orderTracking';
import { prisma } from '@/lib/db';

// Get shipping carriers
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly') !== 'false';

    const carriers = await OrderTrackingService.getShippingCarriers(activeOnly);

    return NextResponse.json(carriers);
  } catch (error) {
    console.error('Error fetching carriers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch carriers' },
      { status: 500 }
    );
  }
}

// Create shipping carrier (admin only)
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
    const { name, code, trackingUrl, apiUrl, apiKey, isActive = true } = body;

    if (!name || !code) {
      return NextResponse.json(
        { error: 'name and code are required' },
        { status: 400 }
      );
    }

    const carrier = await OrderTrackingService.createShippingCarrier({
      name,
      code: code.toUpperCase(),
      trackingUrl,
      apiUrl,
      apiKey,
      isActive,
    });

    return NextResponse.json(carrier, { status: 201 });
  } catch (error) {
    console.error('Error creating carrier:', error);
    
    if (error instanceof Error && error.message.includes('unique')) {
      return NextResponse.json(
        { error: 'Carrier with this name or code already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create carrier' },
      { status: 500 }
    );
  }
}