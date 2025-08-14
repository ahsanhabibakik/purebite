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
      // TODO: Update order status in database
      // TODO: Send confirmation email
      // TODO: Update inventory
      // TODO: Clear user's cart
      
      console.log('IPN validation successful for transaction:', tranId);
      
      return NextResponse.json({ status: 'success' });
    } else {
      console.error('IPN validation failed:', validationResult);
      return NextResponse.json({ status: 'failed' }, { status: 400 });
    }
    
  } catch (error) {
    console.error('IPN handler error:', error);
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }
}