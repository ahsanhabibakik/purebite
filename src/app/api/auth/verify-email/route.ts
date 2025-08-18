import { NextRequest, NextResponse } from "next/server";
import { verifyEmailToken, resendEmailVerification } from "@/lib/emailVerification";
import { z } from "zod";

const verifyTokenSchema = z.object({
  token: z.string().min(1, "যাচাইকরণ টোকেন প্রয়োজন"),
});

const resendSchema = z.object({
  email: z.string().email("সঠিক ইমেইল ঠিকানা দিন"),
});

// POST - Verify email with token
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = verifyTokenSchema.safeParse(body);
    
    if (!parseResult.success) {
      return NextResponse.json(
        { 
          error: parseResult.error.errors[0]?.message || "অবৈধ তথ্য",
          code: 'VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }

    const { token } = parseResult.data;
    const result = await verifyEmailToken(token);

    if (result.success) {
      return NextResponse.json({
        message: "ইমেইল সফলভাবে যাচাই করা হয়েছে",
        email: result.email
      });
    } else {
      return NextResponse.json(
        { 
          error: result.error,
          code: 'VERIFICATION_FAILED'
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { 
        error: "যাচাইকরণ প্রক্রিয়ায় সমস্যা হয়েছে",
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}

// PUT - Resend verification email
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = resendSchema.safeParse(body);
    
    if (!parseResult.success) {
      return NextResponse.json(
        { 
          error: parseResult.error.errors[0]?.message || "অবৈধ তথ্য",
          code: 'VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }

    const { email } = parseResult.data;
    const result = await resendEmailVerification(email);

    if (result.success) {
      return NextResponse.json({
        message: "যাচাইকরণ ইমেইল পুনঃপ্রেরণ করা হয়েছে"
      });
    } else {
      return NextResponse.json(
        { 
          error: result.error,
          code: 'RESEND_FAILED'
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error("Email resend error:", error);
    return NextResponse.json(
      { 
        error: "ইমেইল পুনঃপ্রেরণে সমস্যা হয়েছে",
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}