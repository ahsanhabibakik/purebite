import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { AnalyticsService } from '@/lib/analytics';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d';

    // Calculate date range based on period
    const now = new Date();
    const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1); // End of today
    let startDate: Date;

    switch (period) {
      case '1d':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case '7d':
        startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Get analytics data
    const [
      dashboardStats,
      pageViews,
      topProducts,
      conversionFunnel,
      performanceMetrics
    ] = await Promise.all([
      AnalyticsService.getDashboardStats(),
      AnalyticsService.getPageViews(startDate, endDate, 'day'),
      AnalyticsService.getTopProducts(startDate, endDate, 10),
      AnalyticsService.getConversionFunnel(startDate, endDate),
      AnalyticsService.getPerformanceMetrics(startDate, endDate)
    ]);

    // Get product details for top products
    const productIds = topProducts
      .map(p => p.productId)
      .filter(Boolean);

    const products = productIds.length > 0 ? await prisma.product.findMany({
      where: {
        id: { in: productIds }
      },
      select: {
        id: true,
        name: true,
        price: true,
        image: true
      }
    }) : [];

    const topProductsWithDetails = topProducts.map(product => ({
      ...product,
      product: products.find(p => p.id === product.productId)
    }));

    // Calculate conversion rates
    const conversionRates = {
      viewToCart: conversionFunnel.productViews > 0 
        ? (conversionFunnel.addToCarts / conversionFunnel.productViews) * 100 
        : 0,
      cartToCheckout: conversionFunnel.addToCarts > 0 
        ? (conversionFunnel.checkoutStarts / conversionFunnel.addToCarts) * 100 
        : 0,
      checkoutToPurchase: conversionFunnel.checkoutStarts > 0 
        ? (conversionFunnel.purchases / conversionFunnel.checkoutStarts) * 100 
        : 0,
      overallConversion: conversionFunnel.productViews > 0 
        ? (conversionFunnel.purchases / conversionFunnel.productViews) * 100 
        : 0
    };

    // Get recent errors
    const recentErrors = await prisma.analytics.findMany({
      where: {
        event: 'error_occurred',
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      select: {
        data: true,
        createdAt: true,
        userAgent: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    const formattedErrors = recentErrors.map(error => ({
      message: (error.data as any)?.properties?.message || 'Unknown error',
      url: (error.data as any)?.properties?.url,
      stack: (error.data as any)?.properties?.stack,
      timestamp: error.createdAt,
      userAgent: error.userAgent
    }));

    const response = {
      overview: dashboardStats,
      pageViews,
      topProducts: topProductsWithDetails,
      conversionFunnel,
      conversionRates,
      performanceMetrics,
      recentErrors: formattedErrors,
      period,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching analytics dashboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}