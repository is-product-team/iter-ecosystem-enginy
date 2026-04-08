import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // A list of all locales that are supported
  locales: ['ca', 'es'],
 
  // Used when no locale matches
  defaultLocale: 'ca'
});

export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - api (API routes)
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - Static files from public folder (metadata, images, etc.)
    '/((?!api|_next/static|_next/image|favicon.ico|logo.png|.*\\.(?:svg|png|jpg|jpeg|webp|gif|ico|woff2?|ttf|otf|css|js)$).*)',
  ],
};

