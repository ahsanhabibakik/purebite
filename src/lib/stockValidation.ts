import { prisma } from '@/lib/db';

export interface StockValidationResult {
  valid: boolean;
  errors: StockValidationError[];
  warnings: StockValidationWarning[];
}

export interface StockValidationError {
  productId: string;
  productName: string;
  requestedQuantity: number;
  availableStock: number;
  message: string;
}

export interface StockValidationWarning {
  productId: string;
  productName: string;
  requestedQuantity: number;
  availableStock: number;
  message: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  productName?: string;
}

/**
 * Validate stock availability for cart items
 */
export async function validateStockAvailability(
  items: CartItem[]
): Promise<StockValidationResult> {
  const errors: StockValidationError[] = [];
  const warnings: StockValidationWarning[] = [];

  try {
    // Get all product IDs
    const productIds = items.map(item => item.productId);

    // Fetch current stock data
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds }
      },
      select: {
        id: true,
        name: true,
        stockCount: true,
        inStock: true,
        reservedStock: true,
      }
    });

    // Create a map for quick lookup
    const productMap = new Map(products.map(p => [p.id, p]));

    // Validate each item
    for (const item of items) {
      const product = productMap.get(item.productId);

      if (!product) {
        errors.push({
          productId: item.productId,
          productName: item.productName || 'Unknown Product',
          requestedQuantity: item.quantity,
          availableStock: 0,
          message: 'পণ্যটি পাওয়া যায়নি'
        });
        continue;
      }

      // Check if product is in stock
      if (!product.inStock) {
        errors.push({
          productId: item.productId,
          productName: product.name,
          requestedQuantity: item.quantity,
          availableStock: 0,
          message: 'পণ্যটি বর্তমানে স্টকে নেই'
        });
        continue;
      }

      // Calculate available stock (total - reserved)
      const availableStock = (product.stockCount || 0) - (product.reservedStock || 0);

      // Check if requested quantity exceeds available stock
      if (item.quantity > availableStock) {
        if (availableStock === 0) {
          errors.push({
            productId: item.productId,
            productName: product.name,
            requestedQuantity: item.quantity,
            availableStock,
            message: 'পণ্যটি স্টকে নেই'
          });
        } else {
          errors.push({
            productId: item.productId,
            productName: product.name,
            requestedQuantity: item.quantity,
            availableStock,
            message: `শুধুমাত্র ${availableStock} টি পণ্য স্টকে আছে`
          });
        }
        continue;
      }

      // Add warning if stock is low (less than 5 items remaining after this order)
      const remainingAfterOrder = availableStock - item.quantity;
      if (remainingAfterOrder < 5 && remainingAfterOrder > 0) {
        warnings.push({
          productId: item.productId,
          productName: product.name,
          requestedQuantity: item.quantity,
          availableStock,
          message: `এই অর্ডারের পর মাত্র ${remainingAfterOrder} টি পণ্য বাকি থাকবে`
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };

  } catch (error) {
    console.error('Stock validation error:', error);
    return {
      valid: false,
      errors: [{
        productId: 'system',
        productName: 'System Error',
        requestedQuantity: 0,
        availableStock: 0,
        message: 'স্টক যাচাইকরণে সিস্টেম ত্রুটি হয়েছে'
      }],
      warnings: []
    };
  }
}

/**
 * Reserve stock for order items
 */
export async function reserveStock(items: CartItem[]): Promise<{
  success: boolean;
  error?: string;
  reservationId?: string;
}> {
  try {
    // First validate stock availability
    const validation = await validateStockAvailability(items);
    
    if (!validation.valid) {
      return {
        success: false,
        error: `স্টক সমস্যা: ${validation.errors.map(e => e.message).join(', ')}`
      };
    }

    // Use transaction to reserve stock atomically
    const result = await prisma.$transaction(async (tx) => {
      const reservationId = `RES-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      
      for (const item of items) {
        // Get current stock with lock
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { stockCount: true, reservedStock: true }
        });

        if (!product) {
          throw new Error(`পণ্য পাওয়া যায়নি: ${item.productId}`);
        }

        const availableStock = (product.stockCount || 0) - (product.reservedStock || 0);
        
        if (item.quantity > availableStock) {
          throw new Error(`অপর্যাপ্ত স্টক: ${item.productName || item.productId}`);
        }

        // Update reserved stock
        await tx.product.update({
          where: { id: item.productId },
          data: {
            reservedStock: (product.reservedStock || 0) + item.quantity
          }
        });

        // Create stock reservation record
        await tx.stockReservation.create({
          data: {
            reservationId,
            productId: item.productId,
            quantity: item.quantity,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
            status: 'ACTIVE'
          }
        });
      }

      return reservationId;
    });

    return {
      success: true,
      reservationId: result
    };

  } catch (error) {
    console.error('Stock reservation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'স্টক রিজার্ভেশনে সমস্যা হয়েছে'
    };
  }
}

/**
 * Release stock reservation
 */
export async function releaseStockReservation(reservationId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await prisma.$transaction(async (tx) => {
      // Get all reservations for this ID
      const reservations = await tx.stockReservation.findMany({
        where: {
          reservationId,
          status: 'ACTIVE'
        }
      });

      for (const reservation of reservations) {
        // Release the reserved stock
        const product = await tx.product.findUnique({
          where: { id: reservation.productId },
          select: { reservedStock: true }
        });

        if (product) {
          await tx.product.update({
            where: { id: reservation.productId },
            data: {
              reservedStock: Math.max(0, (product.reservedStock || 0) - reservation.quantity)
            }
          });
        }

        // Mark reservation as released
        await tx.stockReservation.update({
          where: { id: reservation.id },
          data: { status: 'RELEASED' }
        });
      }
    });

    return { success: true };

  } catch (error) {
    console.error('Release stock reservation error:', error);
    return {
      success: false,
      error: 'স্টক রিলিজে সমস্যা হয়েছে'
    };
  }
}

/**
 * Confirm stock reservation (convert to actual stock reduction)
 */
export async function confirmStockReservation(reservationId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await prisma.$transaction(async (tx) => {
      // Get all reservations for this ID
      const reservations = await tx.stockReservation.findMany({
        where: {
          reservationId,
          status: 'ACTIVE'
        }
      });

      for (const reservation of reservations) {
        // Reduce actual stock and reserved stock
        const product = await tx.product.findUnique({
          where: { id: reservation.productId },
          select: { stockCount: true, reservedStock: true }
        });

        if (product) {
          const newStockCount = Math.max(0, (product.stockCount || 0) - reservation.quantity);
          const newReservedStock = Math.max(0, (product.reservedStock || 0) - reservation.quantity);

          await tx.product.update({
            where: { id: reservation.productId },
            data: {
              stockCount: newStockCount,
              reservedStock: newReservedStock,
              inStock: newStockCount > 0
            }
          });

          // Create stock movement record
          await tx.stockMovement.create({
            data: {
              productId: reservation.productId,
              type: 'SALE',
              quantity: -reservation.quantity,
              previousStock: product.stockCount || 0,
              newStock: newStockCount,
              reason: `Order confirmation - Reservation: ${reservationId}`,
              createdAt: new Date()
            }
          });
        }

        // Mark reservation as confirmed
        await tx.stockReservation.update({
          where: { id: reservation.id },
          data: { status: 'CONFIRMED' }
        });
      }
    });

    return { success: true };

  } catch (error) {
    console.error('Confirm stock reservation error:', error);
    return {
      success: false,
      error: 'স্টক নিশ্চিতকরণে সমস্যা হয়েছে'
    };
  }
}

/**
 * Clean up expired stock reservations
 */
export async function cleanupExpiredReservations(): Promise<void> {
  try {
    const expiredReservations = await prisma.stockReservation.findMany({
      where: {
        status: 'ACTIVE',
        expiresAt: {
          lt: new Date()
        }
      }
    });

    for (const reservation of expiredReservations) {
      await releaseStockReservation(reservation.reservationId);
    }

    console.log(`Cleaned up ${expiredReservations.length} expired stock reservations`);

  } catch (error) {
    console.error('Cleanup expired reservations error:', error);
  }
}