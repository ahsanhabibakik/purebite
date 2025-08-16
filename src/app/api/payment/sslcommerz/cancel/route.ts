import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const tranId = formData.get('tran_id') as string;
    
    console.log('Payment cancelled:', { tranId });

    // Update order status to cancelled in database
    if (tranId) {
      const order = await prisma.order.findFirst({
        where: { 
          OR: [
            { transactionId: tranId },
            { orderNumber: tranId }
          ]
        }
      });

      if (order) {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: 'CANCELLED',
            paymentStatus: 'CANCELLED',
            paymentDetails: JSON.stringify({
              cancelledAt: new Date(),
              reason: 'User cancelled payment'
            })
          }
        });

        console.log('Order marked as cancelled:', order.id);
      }
    }
    
    return NextResponse.redirect(
      new URL(`/bn/order-cancelled?transactionId=${tranId}`, request.url)
    );
    
  } catch (error) {
    console.error('Payment cancel handler error:', error);
    return NextResponse.redirect(
      new URL('/bn/order-cancelled', request.url)
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tranId = searchParams.get('tran_id');
  
  return NextResponse.redirect(
    new URL(`/bn/order-cancelled?transactionId=${tranId}`, request.url)
  );
}