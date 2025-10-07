import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'es'],

  // Used when no locale matches
  defaultLocale: 'es'
});

export const config = {
  // Match only internationalized pathnames, exclude auth and api routes
  matcher: ['/((?!api|auth|_next|_vercel|.*\\..*).*)']
};
