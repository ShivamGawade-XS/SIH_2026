import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { createSession, SESSION_COOKIE_NAME, DEMO_OFFICERS } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const demoOfficer = DEMO_OFFICERS.find(
      (o) => o.email.toLowerCase() === normalizedEmail && o.password === password
    );

    const user = await prisma.user
      .findUnique({
        where: { email: normalizedEmail },
      })
      .catch(() => null);

    let sessionPayload: any = null;
    let userInfo: any = null;

    if (user) {
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
