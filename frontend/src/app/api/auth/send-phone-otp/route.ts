import { NextRequest, NextResponse } from "next/server";
import { createOtp } from "@/lib/otp";
import { sendPhoneOtp } from "@/lib/email";

const IS_VERCEL = process.env.VERCEL === "1";

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();

    if (!phone || phone.trim().length < 10) {
      return NextResponse.json(
        { error: "Valid 10-digit phone number is required" },
        { status: 400 }
      );
    }

    const cleanPhone = phone.trim();

    // --- Vercel Demo-Mode Fallback ---
    // SQLite OTP writes fail on Vercel; generate and return a demo OTP directly
    if (IS_VERCEL) {
      const demoOtp = String(Math.floor(100000 + Math.random() * 900000));
      console.log(`[DEMO MODE] Phone OTP for ${cleanPhone}: ${demoOtp}`);
      return NextResponse.json({
        success: true,
        message: "OTP sent successfully to phone number",
        devMode: true,
        devOtp: demoOtp,
      });
    }

    // --- Local / Postgres Production Flow ---
    const otp = await createOtp(cleanPhone, "PHONE");
    const result = await sendPhoneOtp(cleanPhone, otp);

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully to phone number",
      devMode: result.devMode,
      devOtp: result.devOtp,
    });
  } catch (err: any) {
    console.error("Send phone OTP error:", err);
    return NextResponse.json(
      { error: "Failed to send phone OTP" },
      { status: 500 }
    );
  }
}
