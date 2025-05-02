import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from './lib/auth';
import { getToken } from 'next-auth/jwt';

// Define role-based route access
const roleBasedAccess: Record<string, UserRole[]> = {
  // ... (original role config)
};

const protectedRoutes = ['/', '/dashboard', '/documents', '/shipments', '/tracking', '/simulation', '/settings', '/admin']; // Define protected base paths
const authRoutes = ['/api/auth']; // NextAuth's own routes

// Helper function to check if a route is protected
function isProtectedRoute(pathname: string): boolean {
  // Check if the path starts with any of the protected routes exactly or with a trailing slash
  return protectedRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));
}

export async function middleware(req: NextRequest) {
  // --- Force re-deploy comment ---
  console.log('--- MIDDLEWARE EXECUTION START ---');
  const { pathname } = req.nextUrl;
  const secret = process.env.NEXTAUTH_SECRET;

  // Skip checks for NextAuth's own API routes and static assets
  if (pathname.startsWith('/_next') || pathname.startsWith('/api/auth') || pathname.includes('.')) { // Basic check for static files
    return NextResponse.next();
  }

  // Check if the route is protected
  const requiresAuth = isProtectedRoute(pathname);

  if (requiresAuth) {
    console.log(`Middleware: Checking auth for protected route: ${pathname}`);
    
    // Log cookie names for debugging
    const cookieHeader = req.headers.get('cookie');
    const cookieNames = cookieHeader ? cookieHeader.split(';').map(c => c.split('=')[0].trim()) : [];
    console.log(`Middleware: Incoming cookie names: ${JSON.stringify(cookieNames)}`);

    // Log before getToken
    // <<< MODIFIED: Log more of the secret for verification >>>
    console.log(`Middleware: About to call getToken with secret starting: ${secret?.substring(0, 10)}... [Length: ${secret?.length}]`);
    // <<< END MODIFIED >>>

    const token = await getToken({ req, secret });

    if (!token) {
      // No token found, user is not authenticated
      console.log('Middleware: No token found. Redirecting to sign-in page.');
      const signInUrl = new URL('/api/auth/signin', req.nextUrl.origin);
      signInUrl.searchParams.set('callbackUrl', req.nextUrl.href); 
      return NextResponse.redirect(signInUrl);
    } else {
      // Token found, user is authenticated
      console.log(`Middleware: Token found for ${token.email}. Allowing access.`);
      // TODO: Implement role-based access checks here based on token.role if needed
      return NextResponse.next(); // Allow access
    }
  } else {
    // Route does not require authentication
    console.log(`Middleware: Route ${pathname} does not require auth. Allowing access.`);
    return NextResponse.next();
  }
}

// Keep matcher config
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}; 