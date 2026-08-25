import { NextRequest, NextResponse } from "next/server";
import { createSession, DEMO_OFFICERS, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    const officer = DEMO_OFFICERS.find(
      (o) => o.email.toLowerCase() === email?.toLowerCase() && o.password === password
    );

    if (!officer) {
      return NextResponse.json(
        { error: "Invalid credentials. Use provided demo officer accounts." },
        { status: 401 }
      );
    }

    const token = await createSession({
      email: officer.email,
      name: officer.name,
      role: officer.role,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        email: officer.email,
        name: officer.name,
        role: officer.role,
      },
    });

    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
