import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { registerSchema, validateInput } from "@/lib/validation"
import { sendEmailVerification } from "@/lib/emailVerification"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Validate input with Zod
    const validation = validateInput(registerSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }
    
    const { name, email, password } = validation.data

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      }
    })

    // Send email verification
    const emailResult = await sendEmailVerification(email, name);
    
    return NextResponse.json({
      message: "User created successfully",
      user,
      emailVerification: {
        sent: emailResult.success,
        message: emailResult.success 
          ? "যাচাইকরণ ইমেইল পাঠানো হয়েছে" 
          : "ইমেইল পাঠাতে সমস্যা হয়েছে কিন্তু অ্যাকাউন্ট তৈরি হয়েছে"
      }
    })
  } catch (error) {
    console.error("Registration error:", error)
    
    // Error handling is now done in validation function

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}