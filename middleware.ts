import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from './apps/admin-dashboard/auth';

// Define role-based route access
const roleBasedAccess: Record<string, UserRole[]> = {
  '/dashboard': [UserRole.ADMIN, UserRole.DRIVER, UserRole.USER],
  '/dashboard/admin': [UserRole.ADMIN],
  '/dashboard/drivers': [UserRole.ADMIN],
  '/dashboard/customers': [UserRole.ADMIN],
  '/dashboard/shipments': [UserRole.ADMIN, UserRole.DRIVER],
  '/dashboard/settings': [UserRole.ADMIN],
  '/dashboard/profile': [UserRole.ADMIN, UserRole.DRIVER, UserRole.USER],
  '/dashboard/driver/success': [UserRole.DRIVER],
  '/dashboard/customer/success': [UserRole.USER],
  '/shipments': [UserRole.ADMIN, UserRole.DRIVER],
  '/documents': [UserRole.ADMIN, UserRole.DRIVER, UserRole.USER],
};

// This function is called by the middleware to check if the user has access to the requested route
async function hasAccess(req: NextRequest) {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;
  
  // Public routes - allow access
  if (
    pathname === '/sign-in' ||
    pathname === '/sign-up' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.includes('/sign-up/success')
  ) {
    return true;
  }
  
  // Root path check - verify authentication
  if (pathname === '/') {
    const sessionCookie = req.cookies.get('session');
    if (!sessionCookie) {
      console.log('Middleware: No session cookie found for root path');
      // Redirect to sign-in page
      return false;
    }
    
    try {
      const session = JSON.parse(sessionCookie.value);
      if (!session || !session.role) {
        console.log('Middleware: Invalid session data for root path');
        return false;
      }
      // Redirect to dashboard for authenticated users
      return true;
    } catch (e) {
      console.error('Middleware: Failed to parse session cookie for root path:', e);
      return false;
    }
  }
  
  // Protected routes - check authentication
  if (pathname.startsWith('/dashboard')) {
    try {
      // Get session cookie directly
      const sessionCookie = req.cookies.get('session');
      
      // If no session cookie, user is not logged in
      if (!sessionCookie) {
        console.log('Middleware: No session cookie found');
        return false;
      }
      
      // Parse session cookie
      let session;
      try {
        session = JSON.parse(sessionCookie.value);
      } catch (e) {
        console.error('Middleware: Failed to parse session cookie:', e);
        return false;
      }
      
      // Check if session has user data
      if (!session || !session.role) {
        console.log('Middleware: Invalid session data');
        return false;
      }
      
      const userRole = session.role as UserRole;
      console.log('Middleware: User role from session:', userRole);
      
      // Check exact path match
      if (roleBasedAccess[pathname] && !roleBasedAccess[pathname].includes(userRole)) {
        console.log('Middleware: User does not have access to this path');
        return false;
      }
      
      // Check parent paths
      for (const path in roleBasedAccess) {
        if (
          pathname.startsWith(path) && 
          path !== '/dashboard' && 
          !roleBasedAccess[path].includes(userRole)
        ) {
          console.log('Middleware: User does not have access to this parent path');
          return false;
        }
      }
      
      console.log('Middleware: User has access to this path');
      return true;
    } catch (error) {
      console.error('Middleware auth error:', error);
      return false;
    }
  }
  
  return true;
}

export async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  
  // For development bypassing auth (controlled by env var)
  if (process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true' && process.env.NODE_ENV === 'development') {
    console.log('Middleware: Bypassing auth check due to NEXT_PUBLIC_BYPASS_AUTH=true');
    return NextResponse.next();
  } else {
    console.log('Middleware: Auth bypass not enabled.', {
      bypassAuth: process.env.NEXT_PUBLIC_BYPASS_AUTH,
      nodeEnv: process.env.NODE_ENV
    });
  }
  
  try {
    const hasAccessResult = await hasAccess(req);
    
    // Redirect to sign-in page if not authenticated
    if (!hasAccessResult && (nextUrl.pathname.startsWith('/dashboard') || nextUrl.pathname === '/')) {
      console.log('Middleware: Redirecting to sign-in page from', nextUrl.pathname);
      return NextResponse.redirect(new URL('/sign-in', nextUrl.origin));
    }
    
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}; 