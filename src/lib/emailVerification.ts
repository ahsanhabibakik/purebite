import crypto from 'crypto';
import { prisma } from '@/lib/db';
import { sendEmail } from '@/lib/email';

interface VerificationTokenData {
  email: string;
  token: string;
  expiresAt: Date;
  type: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET';
}

/**
 * Generate a secure verification token
 */
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Create an email verification token in database
 */
export async function createEmailVerificationToken(email: string): Promise<string> {
  const token = generateVerificationToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Delete any existing verification tokens for this email
  await prisma.verificationToken.deleteMany({
    where: {
      identifier: email,
      type: 'EMAIL_VERIFICATION'
    }
  });

  // Create new verification token
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires: expiresAt,
      type: 'EMAIL_VERIFICATION'
    }
  });

  return token;
}

/**
 * Verify an email verification token
 */
export async function verifyEmailToken(token: string): Promise<{
  success: boolean;
  email?: string;
  error?: string;
}> {
  try {
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        token,
        type: 'EMAIL_VERIFICATION',
        expires: {
          gt: new Date()
        }
      }
    });

    if (!verificationToken) {
      return {
        success: false,
        error: 'অবৈধ বা মেয়াদোত্তীর্ণ যাচাইকরণ লিংক'
      };
    }

    const email = verificationToken.identifier;

    // Update user as verified
    await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() }
    });

    // Delete the verification token
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id }
    });

    return {
      success: true,
      email
    };

  } catch (error) {
    console.error('Email verification error:', error);
    return {
      success: false,
      error: 'যাচাইকরণ প্রক্রিয়ায় সমস্যা হয়েছে'
    };
  }
}

/**
 * Send email verification email
 */
export async function sendEmailVerification(email: string, name: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const token = await createEmailVerificationToken(email);
    const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`;

    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #16a34a; font-size: 28px; margin-bottom: 10px;">PureBite</h1>
          <p style="color: #6b7280; font-size: 16px;">আপনার ইমেইল যাচাই করুন</p>
        </div>
        
        <div style="background: #f8fafc; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
          <h2 style="color: #1f2937; font-size: 20px; margin-bottom: 15px;">
            প্রিয় ${name},
          </h2>
          
          <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
            PureBite-এ আপনার অ্যাকাউন্ট তৈরির জন্য ধন্যবাদ! আপনার ইমেইল ঠিকানা যাচাই করতে 
            নিচের বাটনে ক্লিক করুন।
          </p>
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="${verificationUrl}" 
               style="background: #16a34a; color: white; padding: 12px 30px; text-decoration: none; 
                      border-radius: 6px; display: inline-block; font-weight: 600;">
              ইমেইল যাচাই করুন
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
            যদি বাটনটি কাজ না করে, তাহলে এই লিংকটি কপি করে ব্রাউজারে পেস্ট করুন:
            <br>
            <a href="${verificationUrl}" style="color: #16a34a; word-break: break-all;">
              ${verificationUrl}
            </a>
          </p>
        </div>
        
        <div style="background: #fef3c7; padding: 15px; border-radius: 6px; margin-bottom: 25px;">
          <p style="color: #92400e; font-size: 14px; margin: 0;">
            <strong>গুরুত্বপূর্ণ:</strong> এই লিংকটি ২৪ ঘন্টা পর মেয়াদ শেষ হয়ে যাবে।
          </p>
        </div>
        
        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; color: #6b7280; font-size: 12px;">
          <p>
            যদি আপনি এই অ্যাকাউন্ট তৈরি না করে থাকেন, তাহলে এই ইমেইলটি উপেক্ষা করুন।
          </p>
          <p style="margin-top: 10px;">
            PureBite টিম<br>
            <a href="mailto:${process.env.SUPPORT_EMAIL}" style="color: #16a34a;">
              ${process.env.SUPPORT_EMAIL}
            </a>
          </p>
        </div>
      </div>
    `;

    const result = await sendEmail({
      to: email,
      subject: 'আপনার ইমেইল যাচাই করুন - PureBite',
      html: emailContent
    });

    return result;

  } catch (error) {
    console.error('Error sending verification email:', error);
    return {
      success: false,
      error: 'যাচাইকরণ ইমেইল পাঠাতে সমস্যা হয়েছে'
    };
  }
}

/**
 * Resend email verification
 */
export async function resendEmailVerification(email: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { name: true, emailVerified: true }
    });

    if (!user) {
      return {
        success: false,
        error: 'ব্যবহারকারী পাওয়া যায়নি'
      };
    }

    if (user.emailVerified) {
      return {
        success: false,
        error: 'ইমেইল ইতিমধ্যে যাচাই করা হয়েছে'
      };
    }

    // Check if verification email was sent recently (within 5 minutes)
    const recentToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: email,
        type: 'EMAIL_VERIFICATION',
        createdAt: {
          gt: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
        }
      }
    });

    if (recentToken) {
      return {
        success: false,
        error: 'যাচাইকরণ ইমেইল সম্প্রতি পাঠানো হয়েছে। ৫ মিনিট পর আবার চেষ্টা করুন।'
      };
    }

    return await sendEmailVerification(email, user.name || 'ব্যবহারকারী');

  } catch (error) {
    console.error('Error resending verification email:', error);
    return {
      success: false,
      error: 'যাচাইকরণ ইমেইল পুনঃপ্রেরণে সমস্যা হয়েছে'
    };
  }
}

/**
 * Check if email verification is required for user
 */
export async function isEmailVerificationRequired(email: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { emailVerified: true }
    });

    return user ? !user.emailVerified : false;
  } catch (error) {
    console.error('Error checking email verification status:', error);
    return false;
  }
}