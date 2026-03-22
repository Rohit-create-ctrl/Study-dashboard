import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // 1. Redirect logged-in users away from auth pages
  if (token && (pathname === "/login" || pathname === "/register" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 2. Protect dashboard routes
  if (!token && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 3. Fallback for root path
  if (token && (pathname === "/" || pathname === "")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  if (!token && (pathname === "/" || pathname === "")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register", "/signup", "/"],
};
