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
    // logger.warn("[Middleware] TEMP FIX: Skipping token retrieval via getToken. Relying on downstream auth checks.");
    // logger.info(`[Middleware] Route ${pathname} is protected. TEMP FIX: Allowing access without token check.`);
    // return NextResponse.next();

    // Original logic: Retrieve and validate the token
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    logger.info("[Middleware] Attempted to retrieve token.");

    if (!token) {
      logger.warn("[Middleware] No token found. Redirecting to sign-in page.");
      const signInUrl = new URL("/api/auth/signin", req.url);
      signInUrl.searchParams.set("callbackUrl", req.url); // Use full requested URL
      return NextResponse.redirect(signInUrl);
    }

    // Token exists, proceed to requested route
    logger.info("[Middleware] Token found. Allowing access to protected route.", { userId: token.sub }); // Log user ID if available
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