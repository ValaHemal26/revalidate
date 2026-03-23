// revalidate/middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Get the current pathname
  const pathname = request.nextUrl.pathname;

  // Set custom header 'x-pathname' so it can be read in AdminLayout
  response.headers.set('x-pathname', pathname);

  return response;
}

// Apply middleware to all admin routes (or entire site)
export const config = {
  matcher: '/admin/:path*', // only admin paths, adjust if needed
};