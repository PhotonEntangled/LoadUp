import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from './lib/auth';

// Define role-based route access
const roleBasedAccess: Record<string, UserRole[]> = {
  // ... (original role config)
};

// This function is called by the middleware to check if the user has access to the requested route
async function hasAccess(req: NextRequest) {
  // Placeholder for actual access logic based on user session/role
  // This needs to be implemented properly using next-auth session retrieval
  // For now, assume false to trigger redirect if needed
  console.warn('[hasAccess Check] Placeholder: Assuming user does NOT have access. Implement real check!');
  // const session = await getToken({ req, secret: process.env.NEXTAUTH_SECRET }); // Example
  // if (!session) return false;
  // Check roles/permissions based on session and req.nextUrl.pathname
  return false; 
}

export async function middleware(req: NextRequest) {
  // For development bypassing auth (controlled by env var)
  if (process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true' && process.env.NODE_ENV === 'development') {
    console.log('Middleware: Bypassing auth check due to NEXT_PUBLIC_BYPASS_AUTH=true');
    return NextResponse.next();
  } else {
    // --- RE-ENABLED AUTH CHECK --- 
    console.log('Middleware: Performing auth check...');
    try {
      // Check if user is authenticated and has access (using placeholder hasAccess for now)
      // We need a real way to check authentication status here, 
      // potentially redirecting based on session existence before even calling hasAccess.
      // This needs integration with NextAuth session checking.
      // For now, let's *assume* we need to check access for dashboard routes.
      
      const requiresAuth = req.nextUrl.pathname.startsWith('/dashboard') || req.nextUrl.pathname === '/';
      const { pathname } = req.nextUrl;
      
      // Allow access to auth routes explicitly
      if (pathname.startsWith('/api/auth') || pathname.startsWith('/auth')) {
         console.log('Middleware: Allowing access to auth route:', pathname);
         return NextResponse.next();
      }

      // Placeholder: Redirect to sign-in if trying to access a protected route
      // This needs a proper session check!
      if (requiresAuth) { // Simplified check for now
         console.log('Middleware: Route requires auth. Redirecting to default NextAuth sign-in page. Path:', pathname);
         // TODO: Replace this with a proper check using next-auth session
         // If no session -> redirect
         // If session -> NextResponse.next()
         const signInUrl = new URL('/api/auth/signin', req.nextUrl.origin);
         // Optionally add callbackUrl to redirect back after login
         signInUrl.searchParams.set('callbackUrl', req.nextUrl.href);
         return NextResponse.redirect(signInUrl);
      }
      
      console.log('Middleware: Route does not require auth or check is bypassed (placeholder). Path:', pathname);
      return NextResponse.next(); // Allow access to non-protected routes
    } catch (error) {
      console.error('Middleware error during auth check:', error);
      // Fallback: Allow request or redirect to an error page?
      return NextResponse.next(); // Allow request in case of error for now
    }
    // --- END RE-ENABLED AUTH CHECK ---
  }
}

// Keep matcher config
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}; 