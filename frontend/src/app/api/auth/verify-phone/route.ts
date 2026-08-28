import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyOtp } from "@/lib/otp";

export async function POST(req: NextRequest) {
  try {
    const { phone, otp, email } = await req.json();

    if (!phone || !otp) {
      return NextResponse.json(
        { error: "Phone number and 6-digit OTP are required" },
        { status: 400 }
      );
    }

    const cleanPhone = phone.trim();
    const isValid = await verifyOtp(cleanPhone, otp.trim(), "PHONE");

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid or expired phone OTP code" },
        { status: 400 }
      );
    }

    // If an associated user email is provided, mark their phone as verified
    if (email) {
      await prisma.user.updateMany({
        where: { email: email.toLowerCase().trim() },
        data: { isPhoneVerified: true, phone: cleanPhone },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Phone number verified successfully",
    });
  } catch (err: any) {
    console.error("Verify phone error:", err);
    return NextResponse.json(
      { error: "Internal server error during phone verification" },
      { status: 500 }
    );
  }
}
