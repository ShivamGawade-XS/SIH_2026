/**
 * Email Service — Nodemailer with Dev Fallback
 * Sends OTP verification emails via SMTP or logs to console in dev mode
 */

import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT) || 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || "noreply@honeychain.in";

const isConfigured = !!(SMTP_HOST && SMTP_USER && SMTP_PASS);

let transporter: nodemailer.Transporter | null = null;
if (isConfigured) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

/**
 * Send an email verification OTP
 * In dev mode (no SMTP configured), logs the OTP to console
 */
export async function sendVerificationEmail(
  email: string,
  otp: string
): Promise<{ success: boolean; devMode: boolean }> {
  const htmlBody = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; border: 2px solid #D4AF37; background: #F9F8F6;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; width: 48px; height: 48px; background: #1A1A1A; color: #D4AF37; font-size: 24px; font-weight: bold; line-height: 48px; font-style: italic;">H</div>
        <h2 style="margin: 8px 0 0; color: #1A1A1A; font-size: 18px; letter-spacing: 4px; text-transform: uppercase;">HoneyChain by TrueTag</h2>
        <p style="margin: 2px 0 0; color: #8A8478; font-size: 10px; letter-spacing: 3px; text-transform: uppercase;">KVIC • National Bee Board • SIH 2026</p>
      </div>
      <hr style="border: 1px solid #E5E2DC; margin: 20px 0;" />
      <p style="color: #1A1A1A; font-size: 14px; margin-bottom: 16px;">Your email verification code:</p>
      <div style="background: #1A1A1A; padding: 20px; text-align: center; margin-bottom: 16px;">
        <span style="color: #D4AF37; font-size: 36px; font-weight: bold; letter-spacing: 12px; font-family: monospace;">${otp}</span>
      </div>
      <p style="color: #8A8478; font-size: 12px; margin-bottom: 4px;">This code expires in <strong>10 minutes</strong>.</p>
      <p style="color: #8A8478; font-size: 12px;">If you didn't request this, you can safely ignore this email.</p>
      <hr style="border: 1px solid #E5E2DC; margin: 20px 0;" />
      <p style="color: #B8B2A8; font-size: 10px; text-align: center; letter-spacing: 2px; text-transform: uppercase;">Blockchain-Verified Honey Provenance</p>
    </div>
  `;

  if (!isConfigured || !transporter) {
    console.log("\n╔══════════════════════════════════════════════════╗");
    console.log("║  📧 DEV MODE — Email Verification OTP           ║");
    console.log(`║  To: ${email.padEnd(42)}║`);
    console.log(`║  OTP: ${otp}                                      ║`);
    console.log("║  (SMTP not configured, OTP logged to console)   ║");
    console.log("╚══════════════════════════════════════════════════╝\n");
    return { success: true, devMode: true };
  }

  try {
    await transporter.sendMail({
      from: `"HoneyChain by TrueTag" <${SMTP_FROM}>`,
      to: email,
      subject: "🍯 HoneyChain — Email Verification Code",
      html: htmlBody,
    });
    return { success: true, devMode: false };
  } catch (err) {
    console.error("Email send failed:", err);
    return { success: false, devMode: false };
  }
}

/**
 * Send phone OTP via SMS gateway
 * In dev mode (no SMS_API_KEY configured), returns the OTP in the response
 */
export async function sendPhoneOtp(
  phone: string,
  otp: string
): Promise<{ success: boolean; devMode: boolean; devOtp?: string }> {
  const smsApiKey = process.env.SMS_API_KEY;
  const smsProvider = process.env.SMS_PROVIDER || "fast2sms";

  if (!smsApiKey) {
    console.log("\n╔══════════════════════════════════════════════════╗");
    console.log("║  📱 DEV MODE — Phone Verification OTP           ║");
    console.log(`║  To: ${phone.padEnd(42)}║`);
    console.log(`║  OTP: ${otp}                                      ║`);
    console.log("║  (SMS gateway not configured)                   ║");
    console.log("╚══════════════════════════════════════════════════╝\n");
    return { success: true, devMode: true, devOtp: otp };
  }

  try {
    if (smsProvider === "fast2sms") {
      await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          authorization: smsApiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          route: "otp",
          variables_values: otp,
          numbers: phone.replace(/\D/g, "").slice(-10),
        }),
      });
    }
    return { success: true, devMode: false };
  } catch (err) {
    console.error("SMS send failed:", err);
    return { success: false, devMode: false };
  }
}
