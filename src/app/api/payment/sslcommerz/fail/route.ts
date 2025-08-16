import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const tranId = formData.get('tran_id') as string;
    const failedReason = formData.get('failedreason') as string;
    
    console.log('Payment failed:', {
      tranId,
      failedReason
    });

    // Update order status to failed in database
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
            paymentStatus: 'FAILED',
            paymentDetails: JSON.stringify({
              failedReason,
              failedAt: new Date()
            })
          }
        });

        console.log('Order marked as failed:', order.id);
      }
    }
    
    return NextResponse.redirect(
      new URL(`/bn/order-failed?transactionId=${tranId}&reason=${encodeURIComponent(failedReason || 'Payment failed')}`, request.url)
    );
    
  } catch (error) {
    console.error('Payment fail handler error:', error);
    return NextResponse.redirect(
      new URL('/bn/order-failed?reason=processing_error', request.url)
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tranId = searchParams.get('tran_id');
  const reason = searchParams.get('failedreason');
  
  return NextResponse.redirect(
    new URL(`/bn/order-failed?transactionId=${tranId}&reason=${encodeURIComponent(reason || 'Payment failed')}`, request.url)
  );
}