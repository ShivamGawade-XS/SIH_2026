import { SignJWT, jwtVerify } from "jose";
import { NextRequest } from "next/server";
import { UserSession } from "./types";
import { DEMO_OFFICERS, SESSION_COOKIE_NAME } from "./auth-constants";

export { DEMO_OFFICERS, SESSION_COOKIE_NAME };

if (!process.env.JWT_SECRET) {
  throw new Error(
    "FATAL: JWT_SECRET environment variable is not set. " +
    "Set it in .env or your hosting provider's environment variables."
  );
}
const secret = new TextEncoder().encode(process.env.JWT_SECRET);

/**
 * Sign a new JWT session for a user or field officer
 */
export async function createSession(payload: Omit<UserSession, "exp">): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

/**
 * Verify an existing session token
 */
export async function verifySession(token: string): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as UserSession;
  } catch {
    return null;
  }
}

/**
 * Extract and verify session from an incoming NextRequest (Cookie or Authorization Bearer header)
 */
export async function getSession(req: NextRequest): Promise<UserSession | null> {
  const token =
    req.cookies.get(SESSION_COOKIE_NAME)?.value ||
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  if (!token) return null;
  return verifySession(token);
}
