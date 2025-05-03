import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from './lib/auth';
// import { getToken } from 'next-auth/jwt'; // Commented out
import { logger } from '@/utils/logger';

// Define role-based route access
const roleBasedAccess: Record<string, UserRole[]> = {
  // ... (original role config)
};

const protectedRoutes = [
  '/dashboard',
  '/settings',
  '/documents',
  '/shipments',
  '/simulation',
  '/admin',
  // Add other routes that require authentication
];

const authRoutes = ['/auth/sign-in', '/auth/sign-up', '/auth/forgot-password'];

// Helper function to check if a route is protected
function isProtectedRoute(pathname: string): boolean {
  // Check if the path starts with any of the protected routes exactly or with a trailing slash
  return protectedRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));
}

export async function middleware(request: NextRequest) {
  // --- TEMPORARILY DISABLED AUTH LOGIC FOR TESTING ---
  logger.info('[Middleware] Auth check TEMPORARILY DISABLED');
  return NextResponse.next();
  // --- END TEMPORARY DISABLE ---
  
  /* // Original Auth Logic
  const { pathname } = request.nextUrl;
  logger.info(`--- MIDDLEWARE EXECUTION START ---`);
  logger.info(`[Middleware] Pathname: ${pathname}`);

  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    logger.error('[Middleware] FATAL: NEXTAUTH_SECRET is not set!');
    // Allow access but log error? Or redirect to an error page?
    // For now, let's allow access but this should be fixed.
    return NextResponse.next();
  }
  logger.debug(`[Middleware] NEXTAUTH_SECRET found (Length: ${secret.length}).`);

  const token = await getToken({ 
    req: request, 
    secret: secret,
    // Ensure cookie name matches what's set by NextAuth
    // Common names are '__Secure-next-auth.session-token' or 'next-auth.session-token'
    cookieName: process.env.NODE_ENV === 'production' 
      ? '__Secure-next-auth.session-token' 
      : 'next-auth.session-token', 
    raw: false // Get the parsed token object
  });

  logger.debug(`[Middleware] Token found by getToken: ${token ? JSON.stringify(token) : 'null'}`);

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute) {
    if (!token) {
      logger.warn(`[Middleware] No token found for protected route ${pathname}. Redirecting to sign-in.`);
      const signInUrl = new URL('/api/auth/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', request.url);
      return NextResponse.redirect(signInUrl);
    }
    logger.info(`[Middleware] Token found for ${token.email} on protected route ${pathname}. Allowing access.`);
  } else if (isAuthRoute) {
    if (token) {
      logger.info(`[Middleware] User ${token.email} already authenticated, accessing auth route ${pathname}. Redirecting to dashboard.`);
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    logger.info(`[Middleware] Unauthenticated user accessing auth route ${pathname}. Allowing access.`);
  } else {
    logger.info(`[Middleware] Route ${pathname} does not require auth or is not an auth route. Allowing access.`);
  }

  return NextResponse.next();
  */ // End Original Auth Logic
}

// Keep matcher config
export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - api (API routes)
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    '/((?!api|_next/static|_next/image|favicon.ico|favicon.png).*)',
  ],
}; 