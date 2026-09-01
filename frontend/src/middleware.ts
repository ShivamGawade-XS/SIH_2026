import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const PROTECTED_ROUTES = ["/dashboard"];
if (!process.env.JWT_SECRET) {
  throw new Error("FATAL: JWT_SECRET environment variable is not set.");
}
const JWT_SECRET = process.env.JWT_SECRET;

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_ROUTES.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );

  // Allow public auth pages without auth loop
  if (
    pathname === "/dashboard/login" ||
    pathname === "/dashboard/register-account"
  ) {
    return NextResponse.next();
  }

  if (isProtected) {
    const token = req.cookies.get("honeychain_session")?.value;

    if (!token) {
      const loginUrl = new URL("/dashboard/login", req.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const secret = new TextEncoder().encode(JWT_SECRET);
      await jwtVerify(token, secret);
      return NextResponse.next();
    } catch {
      // Invalid / expired token
      const loginUrl = new URL("/dashboard/login", req.url);
      loginUrl.searchParams.set("from", pathname);
      const res = NextResponse.redirect(loginUrl);
      res.cookies.delete("honeychain_session");
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/officer/:path*"],
};
