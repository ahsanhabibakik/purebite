import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const tranId = formData.get('tran_id') as string;
    
    console.log('Payment cancelled:', { tranId });

    // TODO: Update order status to cancelled in database
    
    return NextResponse.redirect(
      new URL(`/payment/cancelled?tran_id=${tranId}`, request.url)
    );
    
  } catch (error) {
    console.error('Payment cancel handler error:', error);
    return NextResponse.redirect(
      new URL('/payment/cancelled', request.url)
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tranId = searchParams.get('tran_id');
  
  return NextResponse.redirect(
    new URL(`/payment/cancelled?tran_id=${tranId}`, request.url)
  );
}