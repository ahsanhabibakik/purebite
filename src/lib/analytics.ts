import { prisma } from './prisma';

// Analytics event types
export enum AnalyticsEvent {
  // Page views
  PAGE_VIEW = 'page_view',
  
  // Product interactions
  PRODUCT_VIEW = 'product_view',
  PRODUCT_ADD_TO_CART = 'product_add_to_cart',
  PRODUCT_REMOVE_FROM_CART = 'product_remove_from_cart',
  PRODUCT_ADD_TO_WISHLIST = 'product_add_to_wishlist',
  PRODUCT_SHARE = 'product_share',
  PRODUCT_COMPARE = 'product_compare',
  
  // Search and navigation
  SEARCH = 'search',
  CATEGORY_VIEW = 'category_view',
  FILTER_APPLIED = 'filter_applied',
  
  // Cart and checkout
  CART_VIEW = 'cart_view',
  CHECKOUT_START = 'checkout_start',
  CHECKOUT_COMPLETE = 'checkout_complete',
  CHECKOUT_ABANDON = 'checkout_abandon',
  
  // User actions
  USER_REGISTER = 'user_register',
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  
  // Reviews and ratings
  REVIEW_SUBMIT = 'review_submit',
  REVIEW_HELPFUL = 'review_helpful',
  
  // Recommendations
  RECOMMENDATION_VIEW = 'recommendation_view',
  RECOMMENDATION_CLICK = 'recommendation_click',
  
  // Chat and support
  CHAT_START = 'chat_start',
  CHAT_MESSAGE = 'chat_message',
  
  // Performance
  PERFORMANCE_METRIC = 'performance_metric',
  ERROR_OCCURRED = 'error_occurred',
  
  // A/B Testing
  EXPERIMENT_VIEW = 'experiment_view',
  EXPERIMENT_CONVERT = 'experiment_convert'
}

interface AnalyticsEventData {
  event: AnalyticsEvent;
  userId?: string;
  sessionId?: string;
  properties?: Record<string, any>;
  userAgent?: string;
  ipAddress?: string;
  referrer?: string;
  url?: string;
  timestamp?: Date;
}

interface PerformanceMetrics {
  pageLoadTime?: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  cumulativeLayoutShift?: number;
  firstInputDelay?: number;
  timeToInteractive?: number;
  totalBlockingTime?: number;
}

interface ErrorData {
  message: string;
  stack?: string;
  url?: string;
  lineNumber?: number;
  columnNumber?: number;
  userAgent?: string;
  userId?: string;
}

export class AnalyticsService {
  // Track any analytics event
  static async track(data: AnalyticsEventData): Promise<void> {
    try {
      await prisma.analytics.create({
        data: {
          event: data.event,
          userId: data.userId,
          data: {
            sessionId: data.sessionId,
            properties: data.properties || {},
            referrer: data.referrer,
            url: data.url,
            timestamp: data.timestamp || new Date()
          },
          userAgent: data.userAgent,
          ipAddress: data.ipAddress,
        }
      });
    } catch (error) {
      console.error('Failed to track analytics event:', error);
    }
  }

  // Track page views
  static async trackPageView(
    url: string,
    userId?: string,
    sessionId?: string,
    referrer?: string,
    userAgent?: string
  ): Promise<void> {
    await this.track({
      event: AnalyticsEvent.PAGE_VIEW,
      userId,
      sessionId,
      properties: { url },
      referrer,
      userAgent,
      url
    });
  }

  // Track product interactions
  static async trackProductView(
    productId: string,
    userId?: string,
    sessionId?: string,
    source?: string
  ): Promise<void> {
    await this.track({
      event: AnalyticsEvent.PRODUCT_VIEW,
      userId,
      sessionId,
      properties: {
        productId,
        source: source || 'direct'
      }
    });
  }

  static async trackAddToCart(
    productId: string,
    quantity: number,
    price: number,
    userId?: string,
    sessionId?: string
  ): Promise<void> {
    await this.track({
      event: AnalyticsEvent.PRODUCT_ADD_TO_CART,
      userId,
      sessionId,
      properties: {
        productId,
        quantity,
        price,
        value: quantity * price
      }
    });
  }

  // Track search behavior
  static async trackSearch(
    query: string,
    results: number,
    userId?: string,
    sessionId?: string
  ): Promise<void> {
    await this.track({
      event: AnalyticsEvent.SEARCH,
      userId,
      sessionId,
      properties: {
        query,
        results,
        queryLength: query.length
      }
    });
  }

  // Track checkout funnel
  static async trackCheckoutStep(
    step: 'start' | 'complete' | 'abandon',
    orderId?: string,
    value?: number,
    userId?: string,
    sessionId?: string
  ): Promise<void> {
    const eventMap = {
      start: AnalyticsEvent.CHECKOUT_START,
      complete: AnalyticsEvent.CHECKOUT_COMPLETE,
      abandon: AnalyticsEvent.CHECKOUT_ABANDON
    };

    await this.track({
      event: eventMap[step],
      userId,
      sessionId,
      properties: {
        orderId,
        value,
        step
      }
    });
  }

  // Track performance metrics
  static async trackPerformance(
    metrics: PerformanceMetrics,
    url: string,
    userId?: string,
    sessionId?: string
  ): Promise<void> {
    await this.track({
      event: AnalyticsEvent.PERFORMANCE_METRIC,
      userId,
      sessionId,
      properties: {
        ...metrics,
        url
      },
      url
    });
  }

  // Track errors
  static async trackError(
    error: ErrorData,
    userId?: string,
    sessionId?: string
  ): Promise<void> {
    await this.track({
      event: AnalyticsEvent.ERROR_OCCURRED,
      userId,
      sessionId,
      properties: {
        message: error.message,
        stack: error.stack,
        url: error.url,
        lineNumber: error.lineNumber,
        columnNumber: error.columnNumber,
        userAgent: error.userAgent
      }
    });
  }

  // Get analytics reports
  static async getPageViews(
    startDate: Date,
    endDate: Date,
    groupBy: 'hour' | 'day' | 'week' = 'day'
  ) {
    // This would typically use a more efficient time-series query
    const events = await prisma.analytics.findMany({
      where: {
        event: AnalyticsEvent.PAGE_VIEW,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        createdAt: true,
        data: true
      }
    });

    return this.groupEventsByTime(events, groupBy);
  }

  static async getTopProducts(
    startDate: Date,
    endDate: Date,
    limit: number = 10
  ) {
    const events = await prisma.analytics.groupBy({
      by: ['data'],
      where: {
        event: AnalyticsEvent.PRODUCT_VIEW,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: limit
    });

    return events.map(event => ({
      productId: (event.data as any)?.properties?.productId,
      views: event._count.id
    }));
  }

  static async getConversionFunnel(
    startDate: Date,
    endDate: Date
  ) {
    const events = await prisma.analytics.groupBy({
      by: ['event'],
      where: {
        event: {
          in: [
            AnalyticsEvent.PRODUCT_VIEW,
            AnalyticsEvent.PRODUCT_ADD_TO_CART,
            AnalyticsEvent.CHECKOUT_START,
            AnalyticsEvent.CHECKOUT_COMPLETE
          ]
        },
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      _count: {
        id: true
      }
    });

    const funnelData = events.reduce((acc, event) => {
      acc[event.event] = event._count.id;
      return acc;
    }, {} as Record<string, number>);

    return {
      productViews: funnelData[AnalyticsEvent.PRODUCT_VIEW] || 0,
      addToCarts: funnelData[AnalyticsEvent.PRODUCT_ADD_TO_CART] || 0,
      checkoutStarts: funnelData[AnalyticsEvent.CHECKOUT_START] || 0,
      purchases: funnelData[AnalyticsEvent.CHECKOUT_COMPLETE] || 0
    };
  }

  static async getUserJourney(userId: string, limit: number = 50) {
    const events = await prisma.analytics.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        event: true,
        data: true,
        createdAt: true
      }
    });

    return events.map(event => ({
      event: event.event,
      timestamp: event.createdAt,
      properties: (event.data as any)?.properties || {},
      url: (event.data as any)?.url
    }));
  }

  static async getPerformanceMetrics(
    startDate: Date,
    endDate: Date
  ) {
    const events = await prisma.analytics.findMany({
      where: {
        event: AnalyticsEvent.PERFORMANCE_METRIC,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        data: true,
        createdAt: true
      }
    });

    const metrics = events.map(event => (event.data as any)?.properties || {});
    
    return {
      averagePageLoadTime: this.calculateAverage(metrics, 'pageLoadTime'),
      averageFCP: this.calculateAverage(metrics, 'firstContentfulPaint'),
      averageLCP: this.calculateAverage(metrics, 'largestContentfulPaint'),
      averageCLS: this.calculateAverage(metrics, 'cumulativeLayoutShift'),
      averageFID: this.calculateAverage(metrics, 'firstInputDelay'),
      totalSamples: metrics.length
    };
  }

  // Helper methods
  private static groupEventsByTime(
    events: Array<{ createdAt: Date; data: any }>,
    groupBy: 'hour' | 'day' | 'week'
  ) {
    const groups: Record<string, number> = {};
    
    events.forEach(event => {
      let key: string;
      const date = new Date(event.createdAt);
      
      switch (groupBy) {
        case 'hour':
          key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}-${date.getHours()}`;
          break;
        case 'day':
          key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
          break;
        case 'week':
          const week = Math.floor(date.getDate() / 7);
          key = `${date.getFullYear()}-${date.getMonth() + 1}-W${week}`;
          break;
      }
      
      groups[key] = (groups[key] || 0) + 1;
    });

    return Object.entries(groups).map(([date, count]) => ({
      date,
      count
    }));
  }

  private static calculateAverage(
    metrics: Array<Record<string, any>>,
    field: string
  ): number {
    const values = metrics
      .map(m => m[field])
      .filter(v => typeof v === 'number' && !isNaN(v));
    
    return values.length > 0 
      ? values.reduce((sum, val) => sum + val, 0) / values.length
      : 0;
  }

  // Real-time analytics
  static async getDashboardStats() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      todayViews,
      yesterdayViews,
      weekViews,
      todayOrders,
      weekOrders,
      errors
    ] = await Promise.all([
      // Today's page views
      prisma.analytics.count({
        where: {
          event: AnalyticsEvent.PAGE_VIEW,
          createdAt: { gte: today }
        }
      }),
      
      // Yesterday's page views
      prisma.analytics.count({
        where: {
          event: AnalyticsEvent.PAGE_VIEW,
          createdAt: { gte: yesterday, lt: today }
        }
      }),
      
      // This week's page views
      prisma.analytics.count({
        where: {
          event: AnalyticsEvent.PAGE_VIEW,
          createdAt: { gte: lastWeek }
        }
      }),
      
      // Today's orders
      prisma.analytics.count({
        where: {
          event: AnalyticsEvent.CHECKOUT_COMPLETE,
          createdAt: { gte: today }
        }
      }),
      
      // This week's orders
      prisma.analytics.count({
        where: {
          event: AnalyticsEvent.CHECKOUT_COMPLETE,
          createdAt: { gte: lastWeek }
        }
      }),
      
      // Recent errors
      prisma.analytics.count({
        where: {
          event: AnalyticsEvent.ERROR_OCCURRED,
          createdAt: { gte: today }
        }
      })
    ]);

    return {
      pageViews: {
        today: todayViews,
        yesterday: yesterdayViews,
        week: weekViews,
        change: yesterdayViews > 0 ? ((todayViews - yesterdayViews) / yesterdayViews) * 100 : 0
      },
      orders: {
        today: todayOrders,
        week: weekOrders
      },
      errors: {
        today: errors
      }
    };
  }
}