import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyOtp } from "@/lib/otp";

const IS_VERCEL = process.env.VERCEL === "1";

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and 6-digit verification code are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // --- Vercel Demo-Mode Fallback ---
    // Accept any 6-digit OTP when running on Vercel (SQLite read-only)
    if (IS_VERCEL) {
      const trimmed = otp.trim();
      if (!/^\d{6}$/.test(trimmed)) {
        return NextResponse.json(
          { error: "Invalid verification code. Enter the 6-digit code shown on screen." },
          { status: 400 }
        );
      }
      console.log(`[DEMO MODE] Email OTP accepted for ${normalizedEmail}: ${trimmed}`);
      return NextResponse.json({
        success: true,
        message: "Email verified successfully",
        user: {
          id: `demo-user`,
          email: normalizedEmail,
          name: "Demo Officer",
          isEmailVerified: true,
        },
      });
    }

    // --- Local / Postgres Production Flow ---
    const isValid = await verifyOtp(normalizedEmail, otp.trim(), "EMAIL");

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid or expired verification code" },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { email: normalizedEmail },
      data: { isEmailVerified: true },
    });

    return NextResponse.json({
      success: true,
      message: "Email verified successfully",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (err: any) {
    console.error("Verify email error:", err);
    return NextResponse.json(
      { error: "Internal server error during email verification" },
      { status: 500 }
    );
  }
}
