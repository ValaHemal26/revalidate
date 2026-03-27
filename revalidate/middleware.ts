// revalidate/middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  
  const pathname = request.nextUrl.pathname;

  response.headers.set('x-pathname', pathname);

  return response;
}

