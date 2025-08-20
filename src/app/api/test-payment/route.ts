import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { amount, orderId } = await request.json();

    // Simulate payment processing
    const isSuccess = Math.random() > 0.2; // 80% success rate
    
    if (isSuccess) {
      return NextResponse.json({
        success: true,
        message: 'Test payment successful',
        transactionId: `test_${Date.now()}`,
        amount,
        orderId,
        paymentUrl: `/order-success?orderId=${orderId}&payment=test`
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Test payment failed',
        orderId,
        paymentUrl: `/order-failed?orderId=${orderId}&payment=test`
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Test payment error:', error);
    return NextResponse.json({
      success: false,
      message: 'Payment processing error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Test payment endpoint is active',
    environment: 'development'
  });
}