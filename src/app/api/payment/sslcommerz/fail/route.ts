import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const tranId = formData.get('tran_id') as string;
    const failedReason = formData.get('failedreason') as string;
    
    console.log('Payment failed:', {
      tranId,
      failedReason
    });

    // TODO: Update order status to failed in database
    // TODO: Log failed payment attempt
    
    return NextResponse.redirect(
      new URL(`/payment/failed?tran_id=${tranId}&reason=${encodeURIComponent(failedReason || 'Payment failed')}`, request.url)
    );
    
  } catch (error) {
    console.error('Payment fail handler error:', error);
    return NextResponse.redirect(
      new URL('/payment/failed?reason=processing_error', request.url)
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tranId = searchParams.get('tran_id');
  const reason = searchParams.get('failedreason');
  
  return NextResponse.redirect(
    new URL(`/payment/failed?tran_id=${tranId}&reason=${encodeURIComponent(reason || 'Payment failed')}`, request.url)
  );
}