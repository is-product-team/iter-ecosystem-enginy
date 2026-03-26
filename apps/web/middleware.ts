import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Detect localized paths that are not currently supported by folder structure
  const localePattern = /^\/(es|ca)(\/|$)/i;
  
  if (localePattern.test(pathname)) {
    // Remove the locale prefix and redirect to the flat route
    const newPathname = pathname.replace(localePattern, '/');
    const url = request.nextUrl.clone();
    url.pathname = newPathname || '/';
    
    return NextResponse.redirect(url, { status: 307 });
  }

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
