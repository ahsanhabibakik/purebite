import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const tranId = formData.get('tran_id') as string;
    const valId = formData.get('val_id') as string;
    const amount = formData.get('amount') as string;
    const cardType = formData.get('card_type') as string;
    const status = formData.get('status') as string;
    const bankTranId = formData.get('bank_tran_id') as string;
    
    // Verify payment with SSLCommerz
    const storeId = process.env.SSLCOMMERZ_STORE_ID;
    const storePassword = process.env.SSLCOMMERZ_STORE_PASSWORD;
    const isSandbox = process.env.SSLCOMMERZ_IS_SANDBOX === 'true';
    
    const baseUrl = isSandbox 
      ? process.env.SSLCOMMERZ_SANDBOX_URL 
      : process.env.SSLCOMMERZ_LIVE_URL;

    // Validation API call
    const validationUrl = `${baseUrl}/validator/api/validationserverAPI.php?val_id=${valId}&store_id=${storeId}&store_passwd=${storePassword}&format=json`;
    
    const validationResponse = await fetch(validationUrl);
    const validationResult = await validationResponse.json();
    
    if (validationResult.status === 'VALID' || validationResult.status === 'VALIDATED') {
      // Payment is successful and verified
      
      // Update order status in database
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
            status: 'CONFIRMED',
            paymentStatus: 'PAID',
            paymentDetails: JSON.stringify({
              valId,
              bankTranId,
              cardType,
              amount,
              verificationStatus: validationResult.status,
              paidAt: new Date()
            })
          }
        });

        console.log('Order updated successfully:', order.id);
      }
      
      console.log('Payment successful:', {
        tranId,
        valId,
        amount,
        status: validationResult.status
      });

      // Redirect to success page with Bengali locale
      return NextResponse.redirect(
        new URL(`/bn/order-success?orderId=${order?.id}&transactionId=${tranId}&amount=${amount}`, request.url)
      );
    } else {
      // Payment verification failed
      console.error('Payment verification failed:', validationResult);
      
      return NextResponse.redirect(
        new URL(`/bn/order-failed?transactionId=${tranId}&reason=verification_failed`, request.url)
      );
    }
    
  } catch (error) {
    console.error('Payment success handler error:', error);
    return NextResponse.redirect(
      new URL('/bn/order-failed?reason=processing_error', request.url)
    );
  }
}

// Handle GET requests (direct access)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tranId = searchParams.get('tran_id');
  const amount = searchParams.get('amount');
  
  return NextResponse.redirect(
    new URL(`/bn/order-success?transactionId=${tranId}&amount=${amount}`, request.url)
  );
}