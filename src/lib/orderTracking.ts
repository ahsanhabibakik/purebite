import { prisma } from '@/lib/db';
import { OrderStatus, DeliveryAttemptStatus } from '@prisma/client';

interface TrackingEvent {
  timestamp: string;
  status: string;
  location: string;
  description: string;
  details?: string;
}

interface UpdateOrderStatusData {
  orderId: string;
  status: OrderStatus;
  description?: string;
  location?: string;
  estimatedDelivery?: Date;
  updatedBy?: string;
  isVisible?: boolean;
}

interface CreateTrackingData {
  orderId: string;
  trackingNumber: string;
  carrierId?: string;
  currentLocation?: string;
  estimatedDelivery?: Date;
  recipientName?: string;
  recipientPhone?: string;
}

interface DeliveryAttemptData {
  orderId: string;
  status: DeliveryAttemptStatus;
  reason?: string;
  nextAttempt?: Date;
  location?: string;
  notes?: string;
  driverName?: string;
  driverPhone?: string;
}

export class OrderTrackingService {
  
  /**
   * Update order status and create status history record
   */
  static async updateOrderStatus(data: UpdateOrderStatusData) {
    return prisma.$transaction(async (tx) => {
      // Get current order
      const currentOrder = await tx.order.findUnique({
        where: { id: data.orderId },
        select: { status: true, shippedAt: true, deliveredAt: true },
      });

      if (!currentOrder) {
        throw new Error('Order not found');
      }

      const updateData: any = {
        status: data.status,
        updatedAt: new Date(),
      };

      // Set shipped/delivered timestamps
      if (data.status === OrderStatus.SHIPPED && !currentOrder.shippedAt) {
        updateData.shippedAt = new Date();
      }
      if (data.status === OrderStatus.DELIVERED && !currentOrder.deliveredAt) {
        updateData.deliveredAt = new Date();
      }

      // Update order
      const updatedOrder = await tx.order.update({
        where: { id: data.orderId },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          tracking: true,
        },
      });

      // Create status history record
      await tx.orderStatusHistory.create({
        data: {
          orderId: data.orderId,
          status: data.status,
          previousStatus: currentOrder.status,
          description: data.description,
          location: data.location,
          estimatedDelivery: data.estimatedDelivery,
          updatedBy: data.updatedBy,
          isVisible: data.isVisible ?? true,
        },
      });

      // Update tracking if delivered
      if (data.status === OrderStatus.DELIVERED && updatedOrder.tracking) {
        await tx.orderTracking.update({
          where: { orderId: data.orderId },
          data: {
            isDelivered: true,
            actualDelivery: new Date(),
            lastUpdated: new Date(),
          },
        });
      }

      return updatedOrder;
    });
  }

  /**
   * Create order tracking record
   */
  static async createOrderTracking(data: CreateTrackingData) {
    return prisma.orderTracking.create({
      data: {
        orderId: data.orderId,
        trackingNumber: data.trackingNumber,
        carrierId: data.carrierId,
        currentLocation: data.currentLocation,
        estimatedDelivery: data.estimatedDelivery,
        recipientName: data.recipientName,
        recipientPhone: data.recipientPhone,
        trackingEvents: [],
      },
      include: {
        carrier: true,
        order: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Update tracking information
   */
  static async updateTracking(
    orderId: string,
    updates: {
      currentLocation?: string;
      estimatedDelivery?: Date;
      trackingEvents?: TrackingEvent[];
      isDelivered?: boolean;
      deliveryProof?: string;
      recipientName?: string;
      recipientPhone?: string;
    }
  ) {
    return prisma.orderTracking.update({
      where: { orderId },
      data: {
        ...updates,
        lastUpdated: new Date(),
      },
      include: {
        carrier: true,
        order: {
          select: {
            orderNumber: true,
            status: true,
          },
        },
      },
    });
  }

  /**
   * Get order tracking information
   */
  static async getOrderTracking(orderId: string) {
    const tracking = await prisma.orderTracking.findUnique({
      where: { orderId },
      include: {
        carrier: true,
        order: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            statusHistory: {
              where: { isVisible: true },
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
    });

    if (!tracking) {
      return null;
    }

    return tracking;
  }

  /**
   * Get order tracking by tracking number
   */
  static async getTrackingByNumber(trackingNumber: string) {
    return prisma.orderTracking.findUnique({
      where: { trackingNumber },
      include: {
        carrier: true,
        order: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            statusHistory: {
              where: { isVisible: true },
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
    });
  }

  /**
   * Get order status history
   */
  static async getOrderStatusHistory(orderId: string, includeHidden = false) {
    const where: any = { orderId };
    if (!includeHidden) {
      where.isVisible = true;
    }

    return prisma.orderStatusHistory.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Record delivery attempt
   */
  static async recordDeliveryAttempt(data: DeliveryAttemptData) {
    return prisma.deliveryAttempt.create({
      data: {
        orderId: data.orderId,
        attemptDate: new Date(),
        status: data.status,
        reason: data.reason,
        nextAttempt: data.nextAttempt,
        location: data.location,
        notes: data.notes,
        driverName: data.driverName,
        driverPhone: data.driverPhone,
      },
    });
  }

  /**
   * Get delivery attempts for an order
   */
  static async getDeliveryAttempts(orderId: string) {
    return prisma.deliveryAttempt.findMany({
      where: { orderId },
      orderBy: { attemptDate: 'desc' },
    });
  }

  /**
   * Create or update shipping carrier
   */
  static async createShippingCarrier(data: {
    name: string;
    code: string;
    trackingUrl?: string;
    apiUrl?: string;
    apiKey?: string;
    isActive?: boolean;
  }) {
    return prisma.shippingCarrier.create({
      data,
    });
  }

  /**
   * Get all shipping carriers
   */
  static async getShippingCarriers(activeOnly = true) {
    const where = activeOnly ? { isActive: true } : {};
    
    return prisma.shippingCarrier.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Generate tracking URL for carrier
   */
  static generateTrackingUrl(trackingNumber: string, trackingUrlTemplate?: string) {
    if (!trackingUrlTemplate) {
      return null;
    }
    
    return trackingUrlTemplate.replace('{trackingNumber}', trackingNumber);
  }

  /**
   * Get orders with tracking information
   */
  static async getOrdersWithTracking(filters: {
    status?: OrderStatus;
    carrierId?: string;
    isDelivered?: boolean;
    dateFrom?: Date;
    dateTo?: Date;
    page?: number;
    limit?: number;
  } = {}) {
    const { page = 1, limit = 20, ...whereFilters } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (whereFilters.status) {
      where.order = { status: whereFilters.status };
    }
    if (whereFilters.carrierId) {
      where.carrierId = whereFilters.carrierId;
    }
    if (whereFilters.isDelivered !== undefined) {
      where.isDelivered = whereFilters.isDelivered;
    }
    if (whereFilters.dateFrom || whereFilters.dateTo) {
      where.createdAt = {};
      if (whereFilters.dateFrom) {
        where.createdAt.gte = whereFilters.dateFrom;
      }
      if (whereFilters.dateTo) {
        where.createdAt.lte = whereFilters.dateTo;
      }
    }

    const [trackings, total] = await Promise.all([
      prisma.orderTracking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { lastUpdated: 'desc' },
        include: {
          carrier: true,
          order: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      }),
      prisma.orderTracking.count({ where }),
    ]);

    return {
      trackings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get tracking statistics for dashboard
   */
  static async getTrackingStats() {
    const [
      totalShipments,
      inTransitShipments,
      deliveredToday,
      pendingDeliveries,
      failedDeliveries,
    ] = await Promise.all([
      prisma.orderTracking.count(),
      prisma.orderTracking.count({
        where: {
          isDelivered: false,
          order: {
            status: {
              in: [OrderStatus.SHIPPED, OrderStatus.PROCESSING],
            },
          },
        },
      }),
      prisma.orderTracking.count({
        where: {
          isDelivered: true,
          actualDelivery: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      prisma.orderTracking.count({
        where: {
          isDelivered: false,
          estimatedDelivery: {
            lte: new Date(),
          },
        },
      }),
      prisma.deliveryAttempt.count({
        where: {
          status: DeliveryAttemptStatus.FAILED,
          attemptDate: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      }),
    ]);

    return {
      totalShipments,
      inTransitShipments,
      deliveredToday,
      pendingDeliveries,
      failedDeliveries,
    };
  }

  /**
   * Simulate carrier API tracking update
   */
  static async simulateTrackingUpdate(trackingNumber: string, event: TrackingEvent) {
    const tracking = await prisma.orderTracking.findUnique({
      where: { trackingNumber },
      include: { order: true },
    });

    if (!tracking) {
      throw new Error('Tracking not found');
    }

    const currentEvents = Array.isArray(tracking.trackingEvents) 
      ? tracking.trackingEvents as TrackingEvent[]
      : [];

    const updatedEvents = [...currentEvents, event];

    await prisma.orderTracking.update({
      where: { trackingNumber },
      data: {
        trackingEvents: updatedEvents,
        currentLocation: event.location,
        lastUpdated: new Date(),
      },
    });

    // Auto-update order status based on tracking event
    if (event.status.toLowerCase().includes('delivered')) {
      await this.updateOrderStatus({
        orderId: tracking.orderId,
        status: OrderStatus.DELIVERED,
        description: event.description,
        location: event.location,
        isVisible: true,
      });
    } else if (event.status.toLowerCase().includes('shipped') || event.status.toLowerCase().includes('transit')) {
      await this.updateOrderStatus({
        orderId: tracking.orderId,
        status: OrderStatus.SHIPPED,
        description: event.description,
        location: event.location,
        isVisible: true,
      });
    }

    return tracking;
  }
}

export default OrderTrackingService;