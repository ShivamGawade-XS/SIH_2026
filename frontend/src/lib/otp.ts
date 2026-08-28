/**
 * OTP Generation & Verification via Prisma OtpCode model
 * Supports EMAIL and PHONE OTP with 10-minute expiry
 */

import prisma from "./db";

const OTP_EXPIRY_MINUTES = 10;

/**
 * Generate a 6-digit OTP code
 */
export function generateOtpCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/**
 * Create and store an OTP for a target (email or phone)
 * Invalidates any existing unused OTPs for the same target+type
 */
export async function createOtp(
  target: string,
  type: "EMAIL" | "PHONE"
): Promise<string> {
  // Invalidate old unused OTPs
  await prisma.otpCode.updateMany({
    where: { target, type, used: false },
    data: { used: true },
  });

  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await prisma.otpCode.create({
    data: { target, code, type, expiresAt },
  });

  return code;
}

/**
 * Verify an OTP code
 * Returns true if the code is valid, not expired, and not already used
 */
export async function verifyOtp(
  target: string,
  code: string,
  type: "EMAIL" | "PHONE"
): Promise<boolean> {
  const otpRecord = await prisma.otpCode.findFirst({
    where: {
      target,
      code,
      type,
      used: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!otpRecord) return false;

  // Mark as used
  await prisma.otpCode.update({
    where: { id: otpRecord.id },
    data: { used: true },
  });

  return true;
}
