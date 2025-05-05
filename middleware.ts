import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from './lib/auth';
import { getToken } from 'next-auth/jwt';
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

export async function middleware(req: NextRequest) {
  logger.info("--- MIDDLEWARE EXECUTION START ---");
  const pathname = req.nextUrl.pathname;
  logger.info(`[Middleware] Pathname: ${pathname}`);
  logger.info(`[Middleware] Request Headers: ${JSON.stringify(req.headers)}`); // Log all headers
  const rawCookieHeader = req.headers.get('cookie');
  logger.info(`[Middleware] Raw Cookie Header: ${rawCookieHeader}`); // Log raw cookie header

  // Define public paths
  const publicPaths = ["/auth/sign-in", "/auth/sign-up", "/auth/forgot-password"];
  const apiAuthPrefix = "/api/auth";

  // Allow access to API auth routes and public paths
  if (pathname.startsWith(apiAuthPrefix) || publicPaths.includes(pathname)) {
    logger.info(`[Middleware] Route ${pathname} is public or auth API. Allowing access.`);
    return NextResponse.next(); 
  }
  
  // Check for session token on protected routes
  try {
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      logger.error("[Middleware] FATAL: NEXTAUTH_SECRET is not set! Cannot verify token.");
      // Redirect to sign-in as we cannot verify
      const signInUrl = new URL("/api/auth/signin", req.url);
      signInUrl.searchParams.set("callbackUrl", req.url);
      return NextResponse.redirect(signInUrl);
    }

    logger.info("[Middleware] Attempting to retrieve token using getToken...");
    const token = await getToken({ req, secret: secret });
    // Log the result of getToken immediately after calling it
    logger.info(`[Middleware] Result of getToken: ${JSON.stringify(token)}`); 

    if (!token) {
      logger.warn("[Middleware] No valid token found by getToken. Redirecting to sign-in page.");
      const signInUrl = new URL("/api/auth/signin", req.url);
      signInUrl.searchParams.set("callbackUrl", req.url);
      return NextResponse.redirect(signInUrl);
    }

    // Token exists, proceed to requested route
    logger.info("[Middleware] Valid token found. Allowing access to protected route.", { userId: token.sub }); // Log user ID if available
    return NextResponse.next();

  } catch (error) {
    logger.error("[Middleware] Error during token retrieval or processing:", error);
    // Redirect to sign-in on error as a safety measure
    const signInUrl = new URL("/api/auth/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", req.url);
    return NextResponse.redirect(signInUrl);
  }
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