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

    // Get products with low stock or other issues
    const products = await prisma.product.findMany({
      where: {
        status: 'ACTIVE'
      },
      include: {
        orderItems: {
          where: {
            order: {
              createdAt: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
              }
            }
          }
        }
      }
    });

    const alerts = [];

    for (const product of products) {
      const currentStock = product.stockCount || 0;
      const reorderLevel = 10; // Default reorder level
      const maxStock = 100; // Default max stock
      
      // Calculate velocity (units sold per day)
      const totalSold = product.orderItems.reduce((sum, item) => sum + item.quantity, 0);
      const velocity = totalSold / 30; // Units per day over last 30 days
      
      // Calculate days until out of stock
      const daysUntilOutOfStock = velocity > 0 ? Math.floor(currentStock / velocity) : null;

      // Out of stock alert
      if (currentStock === 0) {
        alerts.push({
          id: `out_of_stock_${product.id}`,
          type: 'out_of_stock',
          productId: product.id,
          productName: product.name,
          currentStock,
          reorderLevel,
          priority: 'critical',
          message: 'এই পণ্যটি স্টকে নেই এবং অবিলম্বে পুনঃপূরণ প্রয়োজন',
          createdAt: new Date().toISOString(),
          actionRequired: true
        });
      }
      // Low stock alert
      else if (currentStock <= reorderLevel) {
        alerts.push({
          id: `low_stock_${product.id}`,
          type: 'low_stock',
          productId: product.id,
          productName: product.name,
          currentStock,
          reorderLevel,
          priority: currentStock <= reorderLevel / 2 ? 'high' : 'medium',
          message: `স্টক কম আছে। পুনঃঅর্ডার করার সময় হয়েছে`,
          createdAt: new Date().toISOString(),
          actionRequired: true,
          daysUntilOutOfStock
        });
      }
      // High demand alert
      else if (velocity > 5 && daysUntilOutOfStock && daysUntilOutOfStock <= 7) {
        alerts.push({
          id: `high_demand_${product.id}`,
          type: 'high_demand',
          productId: product.id,
          productName: product.name,
          currentStock,
          reorderLevel,
          velocity,
          priority: 'medium',
          message: `উচ্চ চাহিদার কারণে ${daysUntilOutOfStock} দিনে স্টক শেষ হয়ে যাবে`,
          createdAt: new Date().toISOString(),
          actionRequired: false,
          daysUntilOutOfStock
        });
      }
      // Reorder point alert
      else if (currentStock <= reorderLevel * 1.5) {
        alerts.push({
          id: `reorder_point_${product.id}`,
          type: 'reorder_point',
          productId: product.id,
          productName: product.name,
          currentStock,
          reorderLevel,
          priority: 'low',
          message: 'শীঘ্রই পুনঃঅর্ডার পয়েন্টে পৌঁছে যাবে',
          createdAt: new Date().toISOString(),
          actionRequired: false
        });
      }
    }

    // Sort alerts by priority
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    alerts.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return NextResponse.json({ alerts });

  } catch (error) {
    console.error('Error fetching inventory alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory alerts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId, type, message, priority = 'medium' } = await request.json();

    // Create custom inventory alert
    const alert = {
      id: `custom_${Date.now()}`,
      type,
      productId,
      productName: 'Custom Alert',
      currentStock: 0,
      reorderLevel: 0,
      priority,
      message,
      createdAt: new Date().toISOString(),
      actionRequired: false
    };

    // In a real application, you might store this in a database
    // For now, we'll just return the created alert
    return NextResponse.json({ alert }, { status: 201 });

  } catch (error) {
    console.error('Error creating inventory alert:', error);
    return NextResponse.json(
      { error: 'Failed to create inventory alert' },
      { status: 500 }
    );
  }
}