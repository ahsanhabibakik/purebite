import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Environment validation
function validateEnvironment() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is not set');
    return false;
  }
  return true;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');

    const skip = (page - 1) * limit;

    const where: any = {
      userId: user.id,
    };

    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: {
                select: {
                  name: true,
                  image: true,
                  price: true,
                },
              },
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check environment first
    if (!validateEnvironment()) {
      return NextResponse.json({ 
        error: 'সার্ভার কনফিগারেশন সমস্যা। দয়া করে আবার চেষ্টা করুন',
        code: 'SERVER_CONFIG_ERROR'
      }, { status: 503 });
    }

    const session = await getServerSession(authOptions);
    
    const data = await request.json();
    const { items, shippingAddress, paymentMethod, total, subtotal, tax, shipping } = data;

    // Enhanced validation with better error messages
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ 
        error: 'কার্টে কোন পণ্য নেই',
        code: 'EMPTY_CART'
      }, { status: 400 });
    }

    if (!shippingAddress) {
      return NextResponse.json({ 
        error: 'ডেলিভারি তথ্য প্রয়োজন',
        code: 'MISSING_SHIPPING_ADDRESS'
      }, { status: 400 });
    }

    if (!shippingAddress.fullName || shippingAddress.fullName.trim().length < 2) {
      return NextResponse.json({ 
        error: 'সম্পূর্ণ নাম প্রয়োজন',
        code: 'INVALID_NAME'
      }, { status: 400 });
    }

    if (!shippingAddress.phone || shippingAddress.phone.trim().length < 11) {
      return NextResponse.json({ 
        error: 'সঠিক মোবাইল নম্বর প্রয়োজন',
        code: 'INVALID_PHONE'
      }, { status: 400 });
    }

    if (!shippingAddress.street || shippingAddress.street.trim().length < 5) {
      return NextResponse.json({ 
        error: 'সম্পূর্ণ ঠিকানা প্রয়োজন',
        code: 'INVALID_ADDRESS'
      }, { status: 400 });
    }

    // Validate items structure
    for (const item of items) {
      if (!item.productId || !item.quantity || !item.price) {
        return NextResponse.json({ 
          error: 'পণ্যের তথ্য অসম্পূর্ণ',
          code: 'INVALID_ITEM_DATA'
        }, { status: 400 });
      }
    }

    // For guest orders or when user is not logged in, create order without user authentication
    let user = null;
    if (session?.user?.email) {
      user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
    }

    // Generate unique order number
    const orderNumber = `PB-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Validate and sanitize data before database operation
    const sanitizedTotal = Math.max(0, parseFloat(total?.toString() || '0'));
    const sanitizedSubtotal = Math.max(0, parseFloat(subtotal?.toString() || '0'));
    const sanitizedTax = Math.max(0, parseFloat(tax?.toString() || '0'));
    const sanitizedShipping = Math.max(0, parseFloat(shipping?.toString() || '0'));

    // Validate payment method
    const validPaymentMethods = ['CASH_ON_DELIVERY', 'MOBILE_BANKING', 'BANK_TRANSFER', 'ONLINE_PAYMENT'];
    const sanitizedPaymentMethod = validPaymentMethods.includes(paymentMethod) ? paymentMethod : 'CASH_ON_DELIVERY';

    // Create order with better error handling
    let order;
    try {
      order = await prisma.order.create({
        data: {
          userId: user?.id,
          orderNumber,
          total: sanitizedTotal,
          subtotal: sanitizedSubtotal,
          tax: sanitizedTax,
          shipping: sanitizedShipping,
          status: 'PENDING',
          paymentMethod: sanitizedPaymentMethod,
          shippingAddress: JSON.stringify({
            fullName: shippingAddress.fullName.trim(),
            phone: shippingAddress.phone.trim(),
            email: shippingAddress.email?.trim() || '',
            street: shippingAddress.street.trim(),
            area: shippingAddress.area?.trim() || '',
            city: shippingAddress.city?.trim() || '',
            district: shippingAddress.district?.trim() || '',
            postalCode: shippingAddress.postalCode?.trim() || '',
            specialInstructions: shippingAddress.specialInstructions?.trim() || ''
          }),
          currency: 'BDT',
          customerEmail: shippingAddress.email?.trim() || session?.user?.email || '',
          customerPhone: shippingAddress.phone.trim(),
          customerName: shippingAddress.fullName.trim(),
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              quantity: Math.max(1, parseInt(item.quantity?.toString() || '1')),
              price: Math.max(0, parseFloat(item.price?.toString() || '0')),
              productName: item.productName?.trim() || `Product ${item.productId}`,
            })),
          },
        },
        include: {
          items: true,
        },
      });
    } catch (dbError) {
      console.error('Database error creating order:', dbError);
      
      // Check for specific database errors
      if (dbError instanceof Error) {
        if (dbError.message.includes('duplicate')) {
          return NextResponse.json({ 
            error: 'অর্ডার নম্বর সংঘাতে। দয়া করে আবার চেষ্টা করুন',
            code: 'DUPLICATE_ORDER'
          }, { status: 409 });
        }
        
        if (dbError.message.includes('connection') || dbError.message.includes('timeout')) {
          return NextResponse.json({ 
            error: 'ডাটাবেস সংযোগ সমস্যা। দয়া করে কিছুক্ষণ পর আবার চেষ্টা করুন',
            code: 'DATABASE_CONNECTION'
          }, { status: 503 });
        }
      }
      
      throw dbError; // Re-throw to be caught by outer catch
    }

    // Send email notifications (optional)
    try {
      if (order.customerEmail) {
        const emailData = {
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          total: order.total,
          items: order.items.map(item => ({
            name: item.productName,
            quantity: item.quantity,
            price: item.price,
          })),
          shippingAddress: JSON.parse(order.shippingAddress),
          paymentMethod: order.paymentMethod,
          orderDate: order.createdAt.toISOString(),
          estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        };

        // Send email notifications (don't wait for them to complete)
        fetch(`${process.env.NEXTAUTH_URL}/api/email/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'order_confirmation',
            data: emailData,
          }),
        }).catch(error => {
          console.error('Failed to send order confirmation email:', error);
        });
      }
    } catch (emailError) {
      console.error('Email notification error:', emailError);
      // Don't fail the order creation if email fails
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        total: order.total,
        status: order.status,
        paymentMethod: order.paymentMethod,
        createdAt: order.createdAt,
      },
      message: 'অর্ডারটি সফলভাবে তৈরি হয়েছে'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    
    // Provide more specific error messages
    let errorMessage = 'অর্ডার তৈরি করতে সমস্যা হয়েছে';
    let statusCode = 500;
    let errorCode = 'UNKNOWN_ERROR';
    
    if (error instanceof Error) {
      if (error.message.includes('JSON')) {
        errorMessage = 'অবৈধ তথ্য প্রেরণ করা হয়েছে';
        errorCode = 'INVALID_JSON';
        statusCode = 400;
      } else if (error.message.includes('validation')) {
        errorMessage = 'তথ্য যাচাইকরণে সমস্যা হয়েছে';
        errorCode = 'VALIDATION_ERROR';
        statusCode = 400;
      } else if (error.message.includes('network') || error.message.includes('connection')) {
        errorMessage = 'নেটওয়ার্ক সমস্যা। দয়া করে আবার চেষ্টা করুন';
        errorCode = 'NETWORK_ERROR';
        statusCode = 503;
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        code: errorCode,
        ...(process.env.NODE_ENV === 'development' && { 
          details: error instanceof Error ? error.message : 'Unknown error' 
        })
      },
      { status: statusCode }
    );
  }
}