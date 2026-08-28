import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { createOtp } from "@/lib/otp";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name, role, phone, cooperative } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and full name are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password with bcrypt
    const passwordHash = await hashPassword(password);

    // Create user in database
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        name: name.trim(),
        role: role || "FIELD_OFFICER",
        phone: phone ? phone.trim() : null,
        cooperative: cooperative ? cooperative.trim() : null,
        isEmailVerified: false,
        isPhoneVerified: false,
      },
    });

    // Generate and send email OTP
    const otp = await createOtp(normalizedEmail, "EMAIL");
    const emailResult = await sendVerificationEmail(normalizedEmail, otp);

    return NextResponse.json({
      success: true,
      message: "Account created successfully. Please verify your email with the OTP sent.",
      userId: user.id,
      email: user.email,
      emailSent: emailResult.success,
      devMode: emailResult.devMode,
    });
  } catch (err: any) {
    console.error("Register route error:", err);
    return NextResponse.json(
      { error: "Internal server error during account registration" },
      { status: 500 }
    );
  }
}
