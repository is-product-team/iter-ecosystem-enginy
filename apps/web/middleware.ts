import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Basic middleware - could be expanded for Auth protection if needed
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - api (API routes)
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico, logo.png (static files)
    '/((?!api|_next/static|_next/image|favicon.ico|logo.png|.*\\.png$).*)',
  ],
};
