import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import InventoryService from '@/lib/inventory';
import { StockMovementType } from '@prisma/client';
import { prisma } from '@/lib/db';

// Get stock information
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const type = searchParams.get('type');

    if (productId && type === 'check') {
      const quantity = parseInt(searchParams.get('quantity') || '1');
      const availability = await InventoryService.checkAvailability(productId, quantity);
      return NextResponse.json(availability);
    }

    if (productId && type === 'history') {
      const history = await InventoryService.getStockHistory(productId);
      return NextResponse.json(history);
    }

    if (type === 'low-stock') {
      const lowStockProducts = await InventoryService.getLowStockProducts();
      return NextResponse.json(lowStockProducts);
    }

    if (type === 'alerts') {
      const alerts = await InventoryService.getActiveAlerts();
      return NextResponse.json(alerts);
    }

    return NextResponse.json({ error: 'Invalid request parameters' }, { status: 400 });

  } catch (error) {
    console.error('Stock check error:', error);
    return NextResponse.json(
      { error: 'Failed to check stock' },
      { status: 500 }
    );
  }
}

// Update stock
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true, id: true },
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { productId, type, quantity, reason, reference } = body;

    if (!productId || !type || quantity === undefined) {
      return NextResponse.json(
        { error: 'productId, type, and quantity are required' },
        { status: 400 }
      );
    }

    switch (type) {
      case 'add':
        await InventoryService.addStock(
          productId,
          quantity,
          StockMovementType.PURCHASE,
          reason || 'Stock added by admin',
          reference,
          user.id
        );
        break;

      case 'adjust':
        await InventoryService.adjustStock(
          productId,
          quantity,
          reason || 'Stock adjustment by admin',
          user.id
        );
        break;

      case 'reserve':
        await InventoryService.reserveStock(productId, quantity, reference);
        break;

      case 'release':
        await InventoryService.releaseStock(productId, quantity, reference);
        break;

      default:
        return NextResponse.json({ error: 'Invalid stock operation type' }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Stock updated successfully' 
    });

  } catch (error) {
    console.error('Stock update error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update stock' },
      { status: 500 }
    );
  }
}