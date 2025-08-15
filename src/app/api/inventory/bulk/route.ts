import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import InventoryService from '@/lib/inventory';
import { prisma } from '@/lib/db';
import { StockMovementType } from '@prisma/client';

// Bulk stock operations
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
    const { operation, items } = body;

    if (!operation || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'operation and items array are required' },
        { status: 400 }
      );
    }

    const results = [];
    const errors = [];

    for (const item of items) {
      try {
        const { productId, quantity, reason, reference } = item;

        if (!productId || quantity === undefined) {
          errors.push({ productId, error: 'productId and quantity are required' });
          continue;
        }

        switch (operation) {
          case 'bulk_add':
            await InventoryService.addStock(
              productId,
              quantity,
              StockMovementType.PURCHASE,
              reason || 'Bulk stock addition',
              reference,
              user.id
            );
            break;

          case 'bulk_adjust':
            await InventoryService.adjustStock(
              productId,
              quantity,
              reason || 'Bulk stock adjustment',
              user.id
            );
            break;

          case 'bulk_damage':
            await InventoryService.adjustStock(
              productId,
              -Math.abs(quantity), // Ensure negative
              reason || 'Bulk damage removal',
              user.id
            );
            break;

          default:
            errors.push({ productId, error: 'Invalid operation type' });
            continue;
        }

        results.push({ productId, success: true });

      } catch (error) {
        errors.push({ 
          productId: item.productId, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      errors: errors.length,
      results,
      errors,
    });

  } catch (error) {
    console.error('Bulk stock operation error:', error);
    return NextResponse.json(
      { error: 'Failed to process bulk stock operation' },
      { status: 500 }
    );
  }
}

// Export stock data
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';

    // Get all products with stock information
    const products = await prisma.product.findMany({
      where: { isStockTracked: true },
      select: {
        id: true,
        name: true,
        category: true,
        stockCount: true,
        reservedStock: true,
        lowStockThreshold: true,
        reorderLevel: true,
        inStock: true,
        price: true,
        updatedAt: true,
      },
      orderBy: { name: 'asc' },
    });

    if (format === 'csv') {
      // Generate CSV
      const csvHeaders = [
        'ID',
        'Name',
        'Category',
        'Stock Count',
        'Reserved Stock',
        'Available Stock',
        'Low Stock Threshold',
        'Reorder Level',
        'In Stock',
        'Price',
        'Last Updated'
      ].join(',');

      const csvRows = products.map(product => [
        product.id,
        `"${product.name}"`,
        `"${product.category}"`,
        product.stockCount,
        product.reservedStock,
        product.stockCount - product.reservedStock,
        product.lowStockThreshold,
        product.reorderLevel,
        product.inStock ? 'Yes' : 'No',
        product.price,
        product.updatedAt.toISOString(),
      ].join(',')).join('\n');

      const csv = `${csvHeaders}\n${csvRows}`;

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="stock-export-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    // Return JSON by default
    return NextResponse.json({
      exportDate: new Date().toISOString(),
      totalProducts: products.length,
      products: products.map(product => ({
        ...product,
        availableStock: product.stockCount - product.reservedStock,
      })),
    });

  } catch (error) {
    console.error('Stock export error:', error);
    return NextResponse.json(
      { error: 'Failed to export stock data' },
      { status: 500 }
    );
  }
}