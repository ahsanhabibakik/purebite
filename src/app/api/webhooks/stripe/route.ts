import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

const prisma = new PrismaClient();

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(secretKey, {
    apiVersion: '2024-11-20.acacia',
  });
}

const SANDBOX_MODE = process.env.STRIPE_SANDBOX_MODE === 'true' || process.env.NODE_ENV === 'development';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const sig = request.headers.get('stripe-signature');

    if (!sig) {
      return NextResponse.json(
        { error: 'Missing stripe signature' },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!endpointSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
    }
    const event = stripe.webhooks.constructEvent(body, sig, endpointSecret);

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        await handleSuccessfulPayment(session);
        break;
      
      case 'payment_intent.succeeded':
        const successIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentSucceeded(successIntent);
        break;
      
      case 'payment_intent.payment_failed':
        const failedIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentFailed(failedIntent);
        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice;
        console.log('Invoice payment succeeded:', invoice.id);
        break;

      default:
        console.log(`Unhandled event type ${event.type}${SANDBOX_MODE ? ' (sandbox mode)' : ''}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    );
  }
}

async function handleSuccessfulPayment(session: Stripe.Checkout.Session) {
  try {
    const { userId, items, shippingAddress, subtotal, tax, shipping, sandboxMode } = session.metadata!;

    const parsedItems = JSON.parse(items);
    const parsedShippingAddress = JSON.parse(shippingAddress);

    // Create order in database
    const order = await prisma.order.create({
      data: {
        userId,
        stripeSessionId: session.id,
        paymentIntentId: session.payment_intent as string,
        total: session.amount_total! / 100, // Convert from cents
        subtotal: parseFloat(subtotal),
        tax: parseFloat(tax),
        shipping: parseFloat(shipping),
        status: 'PROCESSING',
        paymentStatus: 'paid',
        currency: session.currency || 'usd',
        shippingAddress: parsedShippingAddress,
        isSandbox: sandboxMode === 'true',
        items: {
          create: parsedItems.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
          })),
        },
      },
    });

    // Update product stock only if not in sandbox mode
    if (sandboxMode !== 'true') {
      for (const item of parsedItems) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stockCount: {
              decrement: item.quantity,
            },
          },
        });
      }
    }

    console.log(`Order created successfully: ${order.id}${sandboxMode === 'true' ? ' (sandbox mode)' : ''}`);
  } catch (error) {
    console.error('Error handling successful payment:', error);
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    await prisma.order.updateMany({
      where: { paymentIntentId: paymentIntent.id },
      data: {
        paymentStatus: 'paid',
        status: 'CONFIRMED',
        updatedAt: new Date(),
      },
    });

    console.log('Payment succeeded for PaymentIntent:', paymentIntent.id);
  } catch (error) {
    console.error('Error updating payment status:', error);
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    await prisma.order.updateMany({
      where: { paymentIntentId: paymentIntent.id },
      data: {
        paymentStatus: 'failed',
        status: 'CANCELLED',
        updatedAt: new Date(),
      },
    });

    console.log('Payment failed for PaymentIntent:', paymentIntent.id);
  } catch (error) {
    console.error('Error updating payment failure:', error);
  }
}