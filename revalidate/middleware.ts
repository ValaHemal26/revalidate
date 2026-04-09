import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }
  
  const token = request.cookies.get("userToken")?.value;
  
  const userRefreshToken = request.cookies.get("userRefreshToken")?.value;
  const admin = request.cookies.get("admin")?.value;
  
  if (pathname.startsWith("/track-ticket")) {
     
    const authPages = ["/track-ticket/login", "/track-ticket/otp"];
    const isAuthPage = authPages.includes(pathname);
    
    if (token) {
      try {
        const res = await fetch("http://localhost:5000/api/v1/user/verify-token", {
          method: "GET",
          headers: { Authorization: "Bearer " + token },
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          
          if (isAuthPage) return NextResponse.next();

          const response = NextResponse.redirect(
            new URL("/track-ticket/login", request.url)
          );
          response.cookies.delete("userToken");
          response.cookies.delete("userRefreshToken");
          return response;
        }

        if (isAuthPage) {
          return NextResponse.redirect(
            new URL("/track-ticket/dashboard", request.url)
          );
        }

        return NextResponse.next();

      } catch {
     
        if (isAuthPage) return NextResponse.next();

        return NextResponse.redirect(
          new URL("/track-ticket/login", request.url)
        );
      }
    }

    if (!token) {
      if (userRefreshToken) {
     
        try {
          const res = await fetch("http://localhost:5000/api/v1/user/refresh-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken: userRefreshToken }),
          });

          if (!res.ok) throw new Error("Refresh failed");
          const data = await res.json();

          const response = NextResponse.next();
          response.cookies.set("userToken", data.accessToken, {
            path: "/",
            maxAge: 60 * 15,
          });
          return response;
        } catch {
          return NextResponse.redirect(
            new URL("/track-ticket/login", request.url)
          );
        }
      }

      if (isAuthPage) return NextResponse.next();
      return NextResponse.redirect(new URL("/track-ticket/login", request.url));
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