import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Get all products with their order data
    const products = await prisma.product.findMany({
      where: {
        status: 'ACTIVE'
      },
      include: {
        orderItems: {
          where: {
            order: {
              createdAt: { gte: thirtyDaysAgo }
            }
          },
          include: {
            order: true
          }
        }
      }
    });

    // Calculate metrics
    let totalAlerts = 0;
    let criticalAlerts = 0;
    let lowStockProducts = 0;
    let outOfStockProducts = 0;
    let totalStockValue = 0;
    const fastMovingProducts = [];
    const slowMovingProducts = [];

    const reorderLevel = 10; // Default reorder level

    for (const product of products) {
      const currentStock = product.stockCount || 0;
      const stockValue = currentStock * product.price;
      totalStockValue += stockValue;

      // Calculate velocity
      const totalSold = product.orderItems.reduce((sum, item) => sum + item.quantity, 0);
      const velocity = totalSold / 30; // Units per day

      // Count alerts
      if (currentStock === 0) {
        outOfStockProducts++;
        criticalAlerts++;
        totalAlerts++;
      } else if (currentStock <= reorderLevel) {
        lowStockProducts++;
        if (currentStock <= reorderLevel / 2) {
          criticalAlerts++;
        }
        totalAlerts++;
      } else if (currentStock <= reorderLevel * 1.5) {
        totalAlerts++;
      }

      // Fast moving products (velocity > 3 units/day)
      if (velocity > 3) {
        fastMovingProducts.push({
          id: product.id,
          name: product.name,
          velocity
        });
      }

      // Slow moving products (no sales in last 30 days or very low velocity)
      if (velocity === 0 || velocity < 0.1) {
        const lastSale = product.orderItems.length > 0 
          ? product.orderItems[product.orderItems.length - 1].order.createdAt
          : product.createdAt;
        
        slowMovingProducts.push({
          id: product.id,
          name: product.name,
          lastSaleDate: lastSale.toISOString()
        });
      }
    }

    // Sort fast moving by velocity (descending)
    fastMovingProducts.sort((a, b) => b.velocity - a.velocity);

    // Sort slow moving by last sale date (ascending - oldest first)
    slowMovingProducts.sort((a, b) => 
      new Date(a.lastSaleDate).getTime() - new Date(b.lastSaleDate).getTime()
    );

    const metrics = {
      totalAlerts,
      criticalAlerts,
      totalStockValue: Math.round(totalStockValue),
      lowStockProducts,
      outOfStockProducts,
      fastMovingProducts: fastMovingProducts.slice(0, 10),
      slowMovingProducts: slowMovingProducts.slice(0, 10)
    };

    return NextResponse.json(metrics);

  } catch (error) {
    console.error('Error fetching inventory metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory metrics' },
      { status: 500 }
    );
  }
}