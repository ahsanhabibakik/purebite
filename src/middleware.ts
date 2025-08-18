import createMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';

export default createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'bn'],
  
  // Used when no locale matches
  defaultLocale: 'bn',
  
  // Disable locale detection to prevent automatic redirects
  localeDetection: false,
  
  // Never show locale prefix in URL
  localePrefix: 'never'
});

export const config = {
  // Match only internationalized pathnames, excluding API routes and static files
  matcher: [
    // Enable a redirect to a matching locale at the root
    '/',
    
    // Match all routes except API, static files, and Next.js internals
    '/((?!api|_next|_vercel|.*\\..*).*)' 
  ]
};