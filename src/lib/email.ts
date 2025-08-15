import nodemailer from 'nodemailer';

// Email configuration interface
interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

// Email template interface
interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Order data interface for email templates
interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
  shippingAddress: {
    fullName: string;
    street: string;
    area: string;
    city: string;
    phone: string;
  };
  paymentMethod: string;
  orderDate: string;
  estimatedDelivery?: string;
}

// Create nodemailer transporter
function createTransporter(): nodemailer.Transporter {
  const config: EmailConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASSWORD || '',
    },
  };

  return nodemailer.createTransporter(config);
}

// Send email function
export async function sendEmail(template: EmailTemplate): Promise<boolean> {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"${process.env.SITE_NAME || 'PureBite'}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: template.to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

// Order confirmation email template
export function createOrderConfirmationEmail(data: OrderEmailData): EmailTemplate {
  const itemsHtml = data.items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e5e5;">
        <div style="display: flex; align-items: center;">
          ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px; margin-right: 12px;">` : ''}
          <div>
            <h4 style="margin: 0; font-size: 14px; color: #333;">${item.name}</h4>
            <p style="margin: 4px 0 0 0; color: #666; font-size: 12px;">Quantity: ${item.quantity}</p>
          </div>
        </div>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: right;">
        <span style="font-weight: bold; color: #16a34a;">৳${item.price * item.quantity}</span>
      </td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html lang="bn">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation - ${data.orderNumber}</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f9fafb;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; padding: 32px 24px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">PureBite</h1>
          <p style="margin: 8px 0 0 0; opacity: 0.9;">আপনার অর্ডার নিশ্চিত হয়েছে!</p>
        </div>

        <!-- Order Confirmation -->
        <div style="padding: 32px 24px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="background-color: #dcfce7; width: 80px; height: 80px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
              <span style="font-size: 40px;">✅</span>
            </div>
            <h2 style="margin: 0; color: #16a34a; font-size: 24px;">অর্ডার সফল!</h2>
            <p style="margin: 8px 0 0 0; color: #666;">আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে</p>
          </div>

          <!-- Order Details -->
          <div style="background-color: #f9fafb; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #374151; font-size: 18px;">অর্ডার বিবরণ</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div>
                <p style="margin: 0; color: #6b7280; font-size: 14px;">অর্ডার নম্বর</p>
                <p style="margin: 4px 0 0 0; font-weight: bold; color: #16a34a;">${data.orderNumber}</p>
              </div>
              <div>
                <p style="margin: 0; color: #6b7280; font-size: 14px;">অর্ডারের তারিখ</p>
                <p style="margin: 4px 0 0 0; font-weight: bold;">${new Date(data.orderDate).toLocaleDateString('bn-BD')}</p>
              </div>
              <div>
                <p style="margin: 0; color: #6b7280; font-size: 14px;">মোট টাকা</p>
                <p style="margin: 4px 0 0 0; font-weight: bold; color: #16a34a; font-size: 18px;">৳${data.total}</p>
              </div>
              <div>
                <p style="margin: 0; color: #6b7280; font-size: 14px;">পেমেন্ট পদ্ধতি</p>
                <p style="margin: 4px 0 0 0; font-weight: bold;">${data.paymentMethod}</p>
              </div>
            </div>
          </div>

          <!-- Order Items -->
          <div style="margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #374151; font-size: 18px;">অর্ডার আইটেম</h3>
            <table style="width: 100%; border-collapse: collapse; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
              <thead>
                <tr style="background-color: #f3f4f6;">
                  <th style="padding: 12px; text-align: left; font-size: 14px; color: #374151;">পণ্য</th>
                  <th style="padding: 12px; text-align: right; font-size: 14px; color: #374151;">মূল্য</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>

          <!-- Shipping Address -->
          <div style="background-color: #f0f9ff; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #374151; font-size: 18px;">ডেলিভারি ঠিকানা</h3>
            <div style="color: #4b5563;">
              <p style="margin: 0; font-weight: bold;">${data.shippingAddress.fullName}</p>
              <p style="margin: 4px 0;">${data.shippingAddress.street}</p>
              <p style="margin: 4px 0;">${data.shippingAddress.area}, ${data.shippingAddress.city}</p>
              <p style="margin: 4px 0; font-weight: bold;">📞 ${data.shippingAddress.phone}</p>
            </div>
          </div>

          <!-- Next Steps -->
          <div style="background-color: #fffbeb; border-radius: 12px; padding: 24px; margin-bottom: 24px; border-left: 4px solid #f59e0b;">
            <h3 style="margin: 0 0 16px 0; color: #92400e; font-size: 18px;">পরবর্তী ধাপ</h3>
            <ul style="margin: 0; padding-left: 20px; color: #92400e;">
              <li>আমরা আপনার অর্ডার প্রস্তুত করা শুরু করেছি</li>
              <li>১-২ ঘন্টার মধ্যে কনফার্মেশন কল পাবেন</li>
              <li>২৪ ঘন্টার মধ্যে ডেলিভারি হবে</li>
              <li>SMS এ ট্র্যাকিং তথ্য পাবেন</li>
            </ul>
          </div>

          <!-- Contact Information -->
          <div style="text-align: center; padding: 24px; background-color: #f9fafb; border-radius: 12px;">
            <h3 style="margin: 0 0 12px 0; color: #374151;">কোন প্রশ্ন আছে?</h3>
            <p style="margin: 0 0 16px 0; color: #6b7280;">আমাদের কাস্টমার সার্ভিস টিম ২৪/৭ আপনার সেবায় নিয়োজিত</p>
            <div style="display: inline-flex; gap: 16px; flex-wrap: wrap; justify-content: center;">
              <a href="tel:+8801788888888" style="color: #16a34a; text-decoration: none; font-weight: bold;">📞 ০১৭৮৮ ৮৮৮ ৮৮৮</a>
              <a href="mailto:${process.env.SUPPORT_EMAIL}" style="color: #16a34a; text-decoration: none; font-weight: bold;">✉️ সাপোর্ট ইমেইল</a>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #374151; color: white; padding: 24px; text-align: center;">
          <p style="margin: 0 0 8px 0; font-size: 14px;">ধন্যবাদ PureBite এর সাথে থাকার জন্য!</p>
          <p style="margin: 0; font-size: 12px; opacity: 0.8;">© ${new Date().getFullYear()} PureBite. সকল অধিকার সংরক্ষিত।</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
অর্ডার নিশ্চিতকরণ - ${data.orderNumber}

প্রিয় ${data.customerName},

আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে!

অর্ডার বিবরণ:
- অর্ডার নম্বর: ${data.orderNumber}
- মোট টাকা: ৳${data.total}
- পেমেন্ট: ${data.paymentMethod}

ডেলিভারি ঠিকানা:
${data.shippingAddress.fullName}
${data.shippingAddress.street}, ${data.shippingAddress.area}
${data.shippingAddress.city}
ফোন: ${data.shippingAddress.phone}

আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।

ধন্যবাদ,
PureBite টিম
  `;

  return {
    to: data.customerEmail,
    subject: `অর্ডার নিশ্চিত - ${data.orderNumber} | PureBite`,
    html,
    text,
  };
}

// Admin notification email template
export function createAdminNotificationEmail(data: OrderEmailData): EmailTemplate {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Order - ${data.orderNumber}</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f9fafb;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        
        <!-- Header -->
        <div style="background-color: #dc2626; color: white; padding: 24px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">🔔 New Order Alert</h1>
          <p style="margin: 8px 0 0 0;">A new order has been placed on PureBite</p>
        </div>

        <!-- Order Details -->
        <div style="padding: 24px;">
          <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin-bottom: 24px;">
            <h2 style="margin: 0 0 16px 0; color: #dc2626;">Order: ${data.orderNumber}</h2>
            <div style="grid-template-columns: 1fr 1fr; display: grid; gap: 16px;">
              <div>
                <strong>Customer:</strong> ${data.customerName}<br>
                <strong>Email:</strong> ${data.customerEmail}<br>
                <strong>Phone:</strong> ${data.shippingAddress.phone}
              </div>
              <div>
                <strong>Total:</strong> ৳${data.total}<br>
                <strong>Payment:</strong> ${data.paymentMethod}<br>
                <strong>Date:</strong> ${new Date(data.orderDate).toLocaleString()}
              </div>
            </div>
          </div>

          <!-- Items -->
          <h3>Order Items:</h3>
          <ul>
            ${data.items.map(item => `<li>${item.name} (${item.quantity}x) - ৳${item.price * item.quantity}</li>`).join('')}
          </ul>

          <!-- Shipping Address -->
          <h3>Shipping Address:</h3>
          <p>
            ${data.shippingAddress.fullName}<br>
            ${data.shippingAddress.street}<br>
            ${data.shippingAddress.area}, ${data.shippingAddress.city}<br>
            Phone: ${data.shippingAddress.phone}
          </p>

          <!-- Action Required -->
          <div style="background-color: #fffbeb; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin-top: 24px;">
            <h3 style="margin: 0 0 8px 0; color: #92400e;">Action Required:</h3>
            <ul style="margin: 0; color: #92400e;">
              <li>Call customer within 1-2 hours to confirm order</li>
              <li>Prepare items for delivery</li>
              <li>Update order status in admin dashboard</li>
            </ul>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return {
    to: process.env.ADMIN_EMAIL || 'admin@purebite.com',
    subject: `🚨 New Order: ${data.orderNumber} - ৳${data.total}`,
    html,
  };
}

// Password reset email template
export function createPasswordResetEmail(email: string, resetToken: string): EmailTemplate {
  const resetLink = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;
  
  const html = `
    <!DOCTYPE html>
    <html lang="bn">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset - PureBite</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f9fafb;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; padding: 32px 24px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">PureBite</h1>
          <p style="margin: 8px 0 0 0; opacity: 0.9;">পাসওয়ার্ড রিসেট</p>
        </div>

        <!-- Content -->
        <div style="padding: 32px 24px; text-align: center;">
          <div style="background-color: #fef3c7; width: 80px; height: 80px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 24px;">
            <span style="font-size: 40px;">🔐</span>
          </div>
          
          <h2 style="margin: 0 0 16px 0; color: #374151;">পাসওয়ার্ড রিসেট করুন</h2>
          <p style="margin: 0 0 24px 0; color: #6b7280;">আপনার পাসওয়ার্ড রিসেট করার জন্য নিচের বাটনে ক্লিক করুন।</p>
          
          <a href="${resetLink}" style="display: inline-block; background-color: #16a34a; color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-bottom: 24px;">পাসওয়ার্ড রিসেট করুন</a>
          
          <p style="margin: 0; color: #6b7280; font-size: 14px;">অথবা এই লিংকটি কপি করুন: <br><span style="word-break: break-all; font-family: monospace; background-color: #f3f4f6; padding: 4px 8px; border-radius: 4px;">${resetLink}</span></p>
          
          <div style="background-color: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px; padding: 16px; margin-top: 24px;">
            <p style="margin: 0; color: #dc2626; font-size: 14px;"><strong>নিরাপত্তা নোট:</strong> এই লিংকটি ২৪ ঘন্টার জন্য বৈধ। যদি আপনি পাসওয়ার্ড রিসেট অনুরোধ না করে থাকেন, তাহলে এই ইমেইলটি উপেক্ষা করুন।</p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #374151; color: white; padding: 24px; text-align: center;">
          <p style="margin: 0; font-size: 12px; opacity: 0.8;">© ${new Date().getFullYear()} PureBite. সকল অধিকার সংরক্ষিত।</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return {
    to: email,
    subject: 'পাসওয়ার্ড রিসেট অনুরোধ - PureBite',
    html,
  };
}

// Newsletter subscription email
export function createNewsletterWelcomeEmail(email: string, name?: string): EmailTemplate {
  const html = `
    <!DOCTYPE html>
    <html lang="bn">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to PureBite Newsletter</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f9fafb;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; padding: 32px 24px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">PureBite</h1>
          <p style="margin: 8px 0 0 0; opacity: 0.9;">নিউজলেটারে স্বাগতম!</p>
        </div>

        <!-- Content -->
        <div style="padding: 32px 24px; text-align: center;">
          <div style="background-color: #dcfce7; width: 80px; height: 80px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 24px;">
            <span style="font-size: 40px;">📧</span>
          </div>
          
          <h2 style="margin: 0 0 16px 0; color: #374151;">স্বাগতম${name ? `, ${name}` : ''}!</h2>
          <p style="margin: 0 0 24px 0; color: #6b7280;">আমাদের নিউজলেটারে সাবস্ক্রাইব করার জন্য ধন্যবাদ। এখন আপনি পাবেন:</p>
          
          <ul style="text-align: left; max-width: 400px; margin: 0 auto 24px auto; color: #4b5563;">
            <li>নতুন পণ্যের আপডেট</li>
            <li>বিশেষ ছাড় ও অফার</li>
            <li>স্বাস্থ্য টিপস ও রেসিপি</li>
            <li>একচেটিয়া প্রমো কোড</li>
          </ul>
          
          <a href="${process.env.NEXTAUTH_URL}/shop" style="display: inline-block; background-color: #16a34a; color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-bottom: 24px;">এখনই শপিং করুন</a>
        </div>

        <!-- Footer -->
        <div style="background-color: #374151; color: white; padding: 24px; text-align: center;">
          <p style="margin: 0 0 8px 0; font-size: 14px;">PureBite - স্বাস্থ্যকর খাবারের বিশ্বস্ত ঠিকানা</p>
          <p style="margin: 0; font-size: 12px; opacity: 0.8;">আনসাবস্ক্রাইব করতে <a href="${process.env.NEXTAUTH_URL}/unsubscribe?email=${email}" style="color: #93c5fd;">এখানে ক্লিক করুন</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  return {
    to: email,
    subject: 'PureBite নিউজলেটারে স্বাগতম! 🌿',
    html,
  };
}

// Test email connection
export async function testEmailConnection(): Promise<boolean> {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('Email server connection verified');
    return true;
  } catch (error) {
    console.error('Email server connection failed:', error);
    return false;
  }
}