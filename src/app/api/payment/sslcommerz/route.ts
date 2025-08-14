import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

interface SSLCommerzPaymentRequest {
  items: Array<{
    productId: string;
    product: {
      id: string;
      name: string;
      price: number;
      images: string[];
    };
    quantity: number;
  }>;
  customerInfo: {
    fullName: string;
    email: string;
    phone: string;
    street: string;
    area: string;
    city: string;
    district: string;
    postalCode?: string;
  };
  totalAmount: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: SSLCommerzPaymentRequest = await request.json();
    const { items, customerInfo, totalAmount } = body;

    // Generate unique transaction ID
    const transactionId = `PB-${Date.now()}-${uuidv4().substring(0, 8)}`;

    // SSLCommerz configuration
    const storeId = process.env.SSLCOMMERZ_STORE_ID;
    const storePassword = process.env.SSLCOMMERZ_STORE_PASSWORD;
    const isSandbox = process.env.SSLCOMMERZ_IS_SANDBOX === 'true';
    
    if (!storeId || !storePassword) {
      return NextResponse.json(
        { error: 'SSLCommerz configuration missing' },
        { status: 500 }
      );
    }

    const baseUrl = isSandbox 
      ? process.env.SSLCOMMERZ_SANDBOX_URL 
      : process.env.SSLCOMMERZ_LIVE_URL;

    // Prepare SSLCommerz payment data
    const paymentData = {
      // Store Information
      store_id: storeId,
      store_passwd: storePassword,
      
      // Transaction Information
      total_amount: totalAmount,
      currency: 'BDT',
      tran_id: transactionId,
      
      // Success/Fail/Cancel URLs
      success_url: `${process.env.NEXTAUTH_URL}/api/payment/sslcommerz/success`,
      fail_url: `${process.env.NEXTAUTH_URL}/api/payment/sslcommerz/fail`,
      cancel_url: `${process.env.NEXTAUTH_URL}/api/payment/sslcommerz/cancel`,
      ipn_url: `${process.env.NEXTAUTH_URL}/api/payment/sslcommerz/ipn`,
      
      // Customer Information
      cus_name: customerInfo.fullName,
      cus_email: customerInfo.email,
      cus_add1: customerInfo.street,
      cus_add2: customerInfo.area,
      cus_city: customerInfo.city,
      cus_state: customerInfo.district,
      cus_postcode: customerInfo.postalCode || '1000',
      cus_country: 'Bangladesh',
      cus_phone: customerInfo.phone,
      cus_fax: customerInfo.phone,
      
      // Shipping Information (same as customer)
      ship_name: customerInfo.fullName,
      ship_add1: customerInfo.street,
      ship_add2: customerInfo.area,
      ship_city: customerInfo.city,
      ship_state: customerInfo.district,
      ship_postcode: customerInfo.postalCode || '1000',
      ship_country: 'Bangladesh',
      ship_phone: customerInfo.phone,
      
      // Product Information
      product_name: items.map(item => item.product.name).join(', '),
      product_category: 'Food',
      product_profile: 'general',
      
      // Optional Parameters
      value_a: JSON.stringify(items), // Store cart items
      value_b: customerInfo.email,
      value_c: customerInfo.phone,
      value_d: transactionId,
    };

    // Make request to SSLCommerz
    const sslcommerzResponse = await fetch(`${baseUrl}/gwprocess/v4/api.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(paymentData).toString(),
    });

    const result = await sslcommerzResponse.json();

    if (result.status === 'SUCCESS') {
      // Store order in database before redirecting
      // TODO: Create order record in your database
      console.log('Order created for transaction:', transactionId);
      
      return NextResponse.json({
        status: 'success',
        data: {
          sessionkey: result.sessionkey,
          GatewayPageURL: result.GatewayPageURL,
          transactionId,
        }
      });
    } else {
      return NextResponse.json(
        { 
          error: 'Payment session creation failed',
          message: result.failedreason || 'Unknown error'
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('SSLCommerz payment error:', error);
    return NextResponse.json(
      { error: 'Payment processing failed' },
      { status: 500 }
    );
  }
}