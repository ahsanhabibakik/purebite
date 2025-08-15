import { prisma } from '@/lib/db';
import { StockMovementType, StockAlertType } from '@prisma/client';

interface StockMovementData {
  productId: string;
  type: StockMovementType;
  quantity: number;
  reason?: string;
  reference?: string;
  userId?: string;
}

interface StockCheckResult {
  available: boolean;
  availableQuantity: number;
  requestedQuantity: number;
  isLowStock: boolean;
  isOutOfStock: boolean;
}

export class InventoryService {
  
  /**
   * Check if requested quantity is available for a product
   */
  static async checkAvailability(productId: string, requestedQuantity: number): Promise<StockCheckResult> {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        stockCount: true,
        reservedStock: true,
        lowStockThreshold: true,
        isStockTracked: true,
        inStock: true,
      },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    // If stock tracking is disabled, always return available
    if (!product.isStockTracked) {
      return {
        available: true,
        availableQuantity: requestedQuantity,
        requestedQuantity,
        isLowStock: false,
        isOutOfStock: false,
      };
    }

    const availableQuantity = product.stockCount - product.reservedStock;
    const available = availableQuantity >= requestedQuantity;
    const isLowStock = product.stockCount <= product.lowStockThreshold;
    const isOutOfStock = product.stockCount <= 0;

    return {
      available,
      availableQuantity: Math.max(0, availableQuantity),
      requestedQuantity,
      isLowStock,
      isOutOfStock,
    };
  }

  /**
   * Reserve stock for pending orders
   */
  static async reserveStock(productId: string, quantity: number, reference?: string): Promise<void> {
    const availability = await this.checkAvailability(productId, quantity);
    
    if (!availability.available) {
      throw new Error(`Insufficient stock. Available: ${availability.availableQuantity}, Requested: ${quantity}`);
    }

    await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: productId },
        select: { reservedStock: true, stockCount: true, isStockTracked: true },
      });

      if (!product || !product.isStockTracked) return;

      // Update reserved stock
      await tx.product.update({
        where: { id: productId },
        data: {
          reservedStock: product.reservedStock + quantity,
        },
      });

      // Record stock movement
      await this.recordStockMovement({
        productId,
        type: StockMovementType.RESERVE,
        quantity: -quantity, // Negative because it's reducing available stock
        reason: 'Stock reserved for order',
        reference,
      }, tx);
    });
  }

  /**
   * Release reserved stock (if order is cancelled)
   */
  static async releaseStock(productId: string, quantity: number, reference?: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: productId },
        select: { reservedStock: true, isStockTracked: true },
      });

      if (!product || !product.isStockTracked) return;

      const newReservedStock = Math.max(0, product.reservedStock - quantity);

      await tx.product.update({
        where: { id: productId },
        data: {
          reservedStock: newReservedStock,
        },
      });

      // Record stock movement
      await this.recordStockMovement({
        productId,
        type: StockMovementType.RELEASE,
        quantity: quantity, // Positive because it's adding back to available stock
        reason: 'Stock released from cancelled order',
        reference,
      }, tx);
    });
  }

  /**
   * Process stock movement for completed sale
   */
  static async processSale(productId: string, quantity: number, reference?: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: productId },
        select: { 
          stockCount: true, 
          reservedStock: true, 
          isStockTracked: true,
          lowStockThreshold: true,
          reorderLevel: true,
        },
      });

      if (!product || !product.isStockTracked) return;

      const newStockCount = Math.max(0, product.stockCount - quantity);
      const newReservedStock = Math.max(0, product.reservedStock - quantity);

      // Update stock counts
      await tx.product.update({
        where: { id: productId },
        data: {
          stockCount: newStockCount,
          reservedStock: newReservedStock,
          inStock: newStockCount > 0,
        },
      });

      // Record stock movement
      await this.recordStockMovement({
        productId,
        type: StockMovementType.SALE,
        quantity: -quantity,
        reason: 'Stock sold',
        reference,
      }, tx);

      // Check and create stock alerts
      await this.checkAndCreateAlerts(productId, newStockCount, product.lowStockThreshold, product.reorderLevel, tx);
    });
  }

  /**
   * Add stock (purchase, return, adjustment)
   */
  static async addStock(
    productId: string, 
    quantity: number, 
    type: StockMovementType = StockMovementType.PURCHASE,
    reason?: string,
    reference?: string,
    userId?: string
  ): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: productId },
        select: { stockCount: true, isStockTracked: true },
      });

      if (!product || !product.isStockTracked) return;

      const newStockCount = product.stockCount + quantity;

      await tx.product.update({
        where: { id: productId },
        data: {
          stockCount: newStockCount,
          inStock: newStockCount > 0,
        },
      });

      // Record stock movement
      await this.recordStockMovement({
        productId,
        type,
        quantity,
        reason,
        reference,
        userId,
      }, tx);

      // Resolve out of stock alerts
      await this.resolveAlerts(productId, StockAlertType.OUT_OF_STOCK, tx);
    });
  }

  /**
   * Adjust stock (can be positive or negative)
   */
  static async adjustStock(
    productId: string, 
    adjustment: number, 
    reason: string,
    userId?: string
  ): Promise<void> {
    if (adjustment === 0) return;

    const type = adjustment > 0 ? StockMovementType.ADJUSTMENT : StockMovementType.ADJUSTMENT;
    
    await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: productId },
        select: { 
          stockCount: true, 
          isStockTracked: true,
          lowStockThreshold: true,
          reorderLevel: true,
        },
      });

      if (!product || !product.isStockTracked) return;

      const newStockCount = Math.max(0, product.stockCount + adjustment);

      await tx.product.update({
        where: { id: productId },
        data: {
          stockCount: newStockCount,
          inStock: newStockCount > 0,
        },
      });

      // Record stock movement
      await this.recordStockMovement({
        productId,
        type,
        quantity: adjustment,
        reason,
        userId,
      }, tx);

      // Check alerts
      if (adjustment < 0) {
        await this.checkAndCreateAlerts(productId, newStockCount, product.lowStockThreshold, product.reorderLevel, tx);
      } else {
        await this.resolveAlerts(productId, StockAlertType.OUT_OF_STOCK, tx);
      }
    });
  }

  /**
   * Get low stock products
   */
  static async getLowStockProducts(limit = 50) {
    return prisma.product.findMany({
      where: {
        AND: [
          { isStockTracked: true },
          {
            OR: [
              { stockCount: { lte: prisma.product.fields.lowStockThreshold } },
              { stockCount: 0 },
            ],
          },
        ],
      },
      select: {
        id: true,
        name: true,
        image: true,
        stockCount: true,
        lowStockThreshold: true,
        reorderLevel: true,
        inStock: true,
      },
      orderBy: { stockCount: 'asc' },
      take: limit,
    });
  }

  /**
   * Get stock movement history for a product
   */
  static async getStockHistory(productId: string, limit = 100) {
    return prisma.stockMovement.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Get current stock alerts
   */
  static async getActiveAlerts() {
    return prisma.stockAlert.findMany({
      where: { isResolved: false },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Record stock movement (private method)
   */
  private static async recordStockMovement(
    data: StockMovementData, 
    tx?: any
  ): Promise<void> {
    const dbClient = tx || prisma;
    
    const product = await dbClient.product.findUnique({
      where: { id: data.productId },
      select: { stockCount: true },
    });

    if (!product) return;

    const previousStock = product.stockCount - data.quantity;
    
    await dbClient.stockMovement.create({
      data: {
        ...data,
        previousStock,
        newStock: product.stockCount,
      },
    });
  }

  /**
   * Check and create stock alerts (private method)
   */
  private static async checkAndCreateAlerts(
    productId: string,
    currentStock: number,
    lowStockThreshold: number,
    reorderLevel: number,
    tx?: any
  ): Promise<void> {
    const dbClient = tx || prisma;

    const alertsToCreate = [];

    if (currentStock === 0) {
      alertsToCreate.push({
        productId,
        type: StockAlertType.OUT_OF_STOCK,
        currentStock,
        threshold: 0,
      });
    } else if (currentStock <= lowStockThreshold) {
      alertsToCreate.push({
        productId,
        type: StockAlertType.LOW_STOCK,
        currentStock,
        threshold: lowStockThreshold,
      });
    }

    if (currentStock <= reorderLevel) {
      alertsToCreate.push({
        productId,
        type: StockAlertType.REORDER_POINT,
        currentStock,
        threshold: reorderLevel,
      });
    }

    for (const alert of alertsToCreate) {
      // Check if alert already exists and is not resolved
      const existingAlert = await dbClient.stockAlert.findFirst({
        where: {
          productId: alert.productId,
          type: alert.type,
          isResolved: false,
        },
      });

      if (!existingAlert) {
        await dbClient.stockAlert.create({ data: alert });
      }
    }
  }

  /**
   * Resolve stock alerts (private method)
   */
  private static async resolveAlerts(
    productId: string,
    alertType: StockAlertType,
    tx?: any
  ): Promise<void> {
    const dbClient = tx || prisma;

    await dbClient.stockAlert.updateMany({
      where: {
        productId,
        type: alertType,
        isResolved: false,
      },
      data: {
        isResolved: true,
        resolvedAt: new Date(),
      },
    });
  }
}

export default InventoryService;