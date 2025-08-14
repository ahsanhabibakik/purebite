import { NextRequest, NextResponse } from 'next/server';

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
      
      // TODO: Update order status in database
      // TODO: Clear user's cart
      // TODO: Send confirmation email
      
      console.log('Payment successful:', {
        tranId,
        valId,
        amount,
        status: validationResult.status
      });

      // Redirect to success page
      return NextResponse.redirect(
        new URL(`/payment/success?tran_id=${tranId}&amount=${amount}`, request.url)
      );
    } else {
      // Payment verification failed
      console.error('Payment verification failed:', validationResult);
      
      return NextResponse.redirect(
        new URL(`/payment/failed?tran_id=${tranId}&reason=verification_failed`, request.url)
      );
    }
    
  } catch (error) {
    console.error('Payment success handler error:', error);
    return NextResponse.redirect(
      new URL('/payment/failed?reason=processing_error', request.url)
    );
  }
}

// Handle GET requests (direct access)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tranId = searchParams.get('tran_id');
  const amount = searchParams.get('amount');
  
  return NextResponse.redirect(
    new URL(`/payment/success?tran_id=${tranId}&amount=${amount}`, request.url)
  );
}