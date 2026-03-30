import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("userToken")?.value;
  const admin = request.cookies.get("admin")?.value;

  if (pathname.startsWith("/track-ticket")) {
    const isAuthPage =
      pathname === "/track-ticket/login" ||
      pathname === "/track-ticket/otp";

    if (token && isAuthPage) {
      return NextResponse.redirect(
        new URL("/track-ticket/dashboard", request.url)
      );
    }

    if (!token && !isAuthPage) {
      return NextResponse.redirect(
        new URL("/track-ticket/login", request.url)
      );
    }
  }

  if (pathname.startsWith("/admin")) {
    const isAdminAuthPage = pathname === "/admin/login";

    if (admin && isAdminAuthPage) {
      return NextResponse.redirect(
        new URL("/admin/dashboard", request.url)
      );
    }

    if (!admin && !isAdminAuthPage) {
      return NextResponse.redirect(
        new URL("/admin/login", request.url)
      );
    }
  }

  const response = NextResponse.next();
  response.headers.set("x-pathname", pathname);

  return response;
}

export const config = {
  matcher: ["/track-ticket/:path*", "/admin/:path*"],
};