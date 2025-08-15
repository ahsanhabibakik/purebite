import { NextRequest, NextResponse } from 'next/server';
import { 
  sendEmail, 
  createOrderConfirmationEmail, 
  createAdminNotificationEmail,
  createPasswordResetEmail,
  createNewsletterWelcomeEmail 
} from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    if (!type || !data) {
      return NextResponse.json(
        { error: 'Email type and data are required' },
        { status: 400 }
      );
    }

    let emailTemplate;
    let adminEmailTemplate;

    switch (type) {
      case 'order_confirmation':
        // Send customer confirmation email
        emailTemplate = createOrderConfirmationEmail(data);
        const customerEmailSent = await sendEmail(emailTemplate);

        // Send admin notification email
        adminEmailTemplate = createAdminNotificationEmail(data);
        const adminEmailSent = await sendEmail(adminEmailTemplate);

        if (customerEmailSent && adminEmailSent) {
          return NextResponse.json({ 
            success: true, 
            message: 'Order confirmation emails sent successfully' 
          });
        } else if (customerEmailSent) {
          return NextResponse.json({ 
            success: true, 
            message: 'Customer email sent, admin email failed',
            warning: 'Admin notification email failed to send'
          });
        } else {
          return NextResponse.json(
            { error: 'Failed to send customer confirmation email' },
            { status: 500 }
          );
        }

      case 'password_reset':
        if (!data.email || !data.resetToken) {
          return NextResponse.json(
            { error: 'Email and reset token are required' },
            { status: 400 }
          );
        }
        
        emailTemplate = createPasswordResetEmail(data.email, data.resetToken);
        const resetEmailSent = await sendEmail(emailTemplate);

        if (resetEmailSent) {
          return NextResponse.json({ 
            success: true, 
            message: 'Password reset email sent successfully' 
          });
        } else {
          return NextResponse.json(
            { error: 'Failed to send password reset email' },
            { status: 500 }
          );
        }

      case 'newsletter_welcome':
        if (!data.email) {
          return NextResponse.json(
            { error: 'Email is required' },
            { status: 400 }
          );
        }

        emailTemplate = createNewsletterWelcomeEmail(data.email, data.name);
        const newsletterEmailSent = await sendEmail(emailTemplate);

        if (newsletterEmailSent) {
          return NextResponse.json({ 
            success: true, 
            message: 'Newsletter welcome email sent successfully' 
          });
        } else {
          return NextResponse.json(
            { error: 'Failed to send newsletter welcome email' },
            { status: 500 }
          );
        }

      default:
        return NextResponse.json(
          { error: 'Invalid email type' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { error: 'Internal server error while sending email' },
      { status: 500 }
    );
  }
}

// Test email configuration endpoint
export async function GET() {
  try {
    const { testEmailConnection } = await import('@/lib/email');
    const isConnected = await testEmailConnection();

    if (isConnected) {
      return NextResponse.json({ 
        success: true, 
        message: 'Email server connection successful' 
      });
    } else {
      return NextResponse.json(
        { error: 'Email server connection failed' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Email connection test error:', error);
    return NextResponse.json(
      { error: 'Failed to test email connection' },
      { status: 500 }
    );
  }
}