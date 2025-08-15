import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if already subscribed
    const existingSubscription = await prisma.newsletterSubscription.findUnique({
      where: { email },
    });

    if (existingSubscription) {
      if (existingSubscription.isActive) {
        return NextResponse.json(
          { error: 'Email is already subscribed to newsletter' },
          { status: 400 }
        );
      } else {
        // Reactivate subscription
        await prisma.newsletterSubscription.update({
          where: { email },
          data: {
            isActive: true,
            name: name || existingSubscription.name,
            updatedAt: new Date(),
          },
        });

        // Send welcome email
        try {
          await fetch(`${process.env.NEXTAUTH_URL}/api/email/send`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type: 'newsletter_welcome',
              data: { email, name: name || existingSubscription.name },
            }),
          });
        } catch (emailError) {
          console.error('Failed to send welcome email:', emailError);
        }

        return NextResponse.json({
          success: true,
          message: 'Successfully reactivated newsletter subscription',
        });
      }
    }

    // Create new subscription
    await prisma.newsletterSubscription.create({
      data: {
        email,
        name: name || null,
        isActive: true,
        subscribedAt: new Date(),
      },
    });

    // Send welcome email
    try {
      await fetch(`${process.env.NEXTAUTH_URL}/api/email/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'newsletter_welcome',
          data: { email, name },
        }),
      });
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail the subscription if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to newsletter',
    });

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe to newsletter' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Deactivate subscription instead of deleting (for compliance)
    const subscription = await prisma.newsletterSubscription.findUnique({
      where: { email },
    });

    if (!subscription || !subscription.isActive) {
      return NextResponse.json(
        { error: 'Email is not subscribed to newsletter' },
        { status: 400 }
      );
    }

    await prisma.newsletterSubscription.update({
      where: { email },
      data: {
        isActive: false,
        unsubscribedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed from newsletter',
    });

  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    return NextResponse.json(
      { error: 'Failed to unsubscribe from newsletter' },
      { status: 500 }
    );
  }
}