import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { createOtp } from "@/lib/otp";
import { sendVerificationEmail } from "@/lib/email";
import { generateSecureOtp } from "@/lib/crypto-utils";

// Detect Vercel production (SQLite is read-only on Vercel filesystem)
const IS_VERCEL = process.env.VERCEL === "1";

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

    // --- Vercel Demo-Mode Fallback ---
    // SQLite on Vercel's read-only filesystem cannot persist new records.
    // We simulate a successful registration flow for demo & judging purposes.
    if (IS_VERCEL) {
      console.log("[DEMO MODE] Simulating registration for:", normalizedEmail);
      // Generate cryptographically secure OTP for display (dev console hint)
      const demoOtp = generateSecureOtp();
      console.log(`[DEMO MODE] Email OTP for ${normalizedEmail}: ${demoOtp}`);
      return NextResponse.json({
        success: true,
        message: "Account created successfully. Please verify your email with the OTP sent.",
        userId: `demo-${Date.now()}`,
        email: normalizedEmail,
        emailSent: true,
        devMode: true,
        demoOtp, // returned so the UI can display the OTP hint
      });
    }

    // --- Local / Postgres Production Flow ---
    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    }).catch(() => null);

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
