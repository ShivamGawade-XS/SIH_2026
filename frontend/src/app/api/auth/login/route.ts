import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { createSession, SESSION_COOKIE_NAME, DEMO_OFFICERS } from "@/lib/auth";

// Sliding-window in-memory rate limiter (10 attempts per minute per IP)
const LOGIN_RATE_LIMIT: Record<string, number[]> = {};
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_LOGIN_ATTEMPTS = 10;

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const now = Date.now();

    // Check & prune rate limit timestamps
    const attempts = (LOGIN_RATE_LIMIT[ip] || []).filter((t) => now - t < RATE_LIMIT_WINDOW);
    if (attempts.length >= MAX_LOGIN_ATTEMPTS) {
      return NextResponse.json(
        { error: "Too many login attempts. Please wait 1 minute before retrying." },
        { status: 429 }
      );
    }
    attempts.push(now);
    LOGIN_RATE_LIMIT[ip] = attempts;

    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Check verified DB user first
    const user = await prisma.user
      .findUnique({ where: { email: normalizedEmail } })
      .catch(() => null);

    // 2. Check pre-seeded demo officers
    const demoOfficer = DEMO_OFFICERS.find(
      (o) => o.email.toLowerCase() === normalizedEmail && o.password === password
    );

    let sessionPayload: any = null;
    let userInfo: any = null;

    if (user) {
      // Real DB user found — verify bcrypt password
      const isValid = await verifyPassword(password, user.passwordHash);
      if (!isValid) {
        return NextResponse.json(
          { error: "Invalid credentials. Incorrect password." },
          { status: 401 }
        );
      }
      sessionPayload = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as any,
        cooperative: user.cooperative || undefined,
      };
      userInfo = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        cooperative: user.cooperative,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
      };
    } else if (demoOfficer) {
      // Pre-seeded demo officer login
      sessionPayload = {
        id: `demo-${demoOfficer.role.toLowerCase()}`,
        email: demoOfficer.email,
        name: demoOfficer.name,
        role: demoOfficer.role,
        cooperative: demoOfficer.cooperative,
      };
      userInfo = {
        id: `demo-${demoOfficer.role.toLowerCase()}`,
        email: demoOfficer.email,
        name: demoOfficer.name,
        role: demoOfficer.role,
        cooperative: demoOfficer.cooperative,
        isEmailVerified: true,
        isPhoneVerified: true,
      };
    } else {
      return NextResponse.json(
        { error: "Invalid credentials. Account not found." },
        { status: 401 }
      );
    }

    const token = await createSession(sessionPayload);

    const response = NextResponse.json({
      success: true,
      user: userInfo,
    });

    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("Login route error:", err);
    return NextResponse.json(
      { error: "Internal server error during authentication" },
      { status: 500 }
    );
  }
}
