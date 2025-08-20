import { NextRequest, NextResponse } from 'next/server';

// IPN (Instant Payment Notification) handler
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const tranId = formData.get('tran_id') as string;
    const valId = formData.get('val_id') as string;
    const amount = formData.get('amount') as string;
    const status = formData.get('status') as string;
    
    console.log('SSLCommerz IPN received:', {
      tranId,
      valId,
      amount,
      status
    });

    // Verify the IPN with SSLCommerz
    const storeId = process.env.SSLCOMMERZ_STORE_ID;
    const storePassword = process.env.SSLCOMMERZ_STORE_PASSWORD;
    const isSandbox = process.env.SSLCOMMERZ_IS_SANDBOX === 'true';
    
    const baseUrl = isSandbox 
      ? process.env.SSLCOMMERZ_SANDBOX_URL 
      : process.env.SSLCOMMERZ_LIVE_URL;

    const validationUrl = `${baseUrl}/validator/api/validationserverAPI.php?val_id=${valId}&store_id=${storeId}&store_passwd=${storePassword}&format=json`;
    
    const validationResponse = await fetch(validationUrl);
    const validationResult = await validationResponse.json();
    
    if (validationResult.status === 'VALID' || validationResult.status === 'VALIDATED') {
      try {
        // Import prisma client
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();

        // Find the order by transaction ID
        const order = await prisma.order.findFirst({
          where: { paymentReference: tranId },
          include: { items: true, user: true }
        });

        if (order) {
          // Update order status
          await prisma.order.update({
            where: { id: order.id },
            data: {
              status: status === 'VALID' ? 'CONFIRMED' : 'PROCESSING',
              paymentStatus: 'COMPLETED',
              updatedAt: new Date()
            }
          });

          // Update inventory for each item
          for (const item of order.items) {
            await prisma.product.update({
              where: { id: item.productId },
              data: {
                stockCount: {
                  decrement: item.quantity
                }
              }
            });

            // Create stock movement record
            await prisma.stockMovement.create({
              data: {
                productId: item.productId,
                type: 'SOLD',
                quantity: -item.quantity,
                reason: `Order ${order.id} - Payment confirmed`,
                userId: order.userId
              }
            });
          }

          // Clear user's cart (if exists)
          if (order.userId) {
            await prisma.cartItem.deleteMany({
              where: { userId: order.userId }
            });
          }

          console.log('IPN validation successful for transaction:', tranId);
          
          await prisma.$disconnect();
          return NextResponse.json({ status: 'success' });
        } else {
          console.error('Order not found for transaction:', tranId);
          return NextResponse.json({ status: 'order_not_found' }, { status: 404 });
        }
      } catch (dbError) {
        console.error('Database error during IPN processing:', dbError);
        return NextResponse.json({ status: 'database_error' }, { status: 500 });
      }
    } else {
      console.error('IPN validation failed:', validationResult);
      return NextResponse.json({ status: 'failed' }, { status: 400 });
    }
    
  } catch (error) {
    console.error('IPN handler error:', error);
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }
}