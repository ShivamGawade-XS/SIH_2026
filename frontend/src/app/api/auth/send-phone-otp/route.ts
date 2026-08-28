import { NextRequest, NextResponse } from "next/server";
import { createOtp } from "@/lib/otp";
import { sendPhoneOtp } from "@/lib/email";

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
    const otp = await createOtp(cleanPhone, "PHONE");
    const result = await sendPhoneOtp(cleanPhone, otp);

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully to phone number",
      devMode: result.devMode,
      devOtp: result.devOtp, // In dev mode, return OTP for instant testing
    });
  } catch (err: any) {
    console.error("Send phone OTP error:", err);
    return NextResponse.json(
      { error: "Failed to send phone OTP" },
      { status: 500 }
    );
  }
}
