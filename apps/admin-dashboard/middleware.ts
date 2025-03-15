import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { UserRole } from '@/lib/auth.config';

// Define role-based route access
const roleBasedAccess: Record<string, UserRole[]> = {
  '/dashboard': ['admin', 'driver', 'customer'],
  '/dashboard/admin': ['admin'],
  '/dashboard/drivers': ['admin'],
  '/dashboard/customers': ['admin'],
  '/dashboard/shipments': ['admin', 'driver'],
  '/dashboard/settings': ['admin'],
  '/dashboard/profile': ['admin', 'driver', 'customer'],
};

export default auth((req) => {
  const { nextUrl, auth } = req;
  const isLoggedIn = !!auth?.user;
  const pathname = nextUrl.pathname;
  
  // Public routes - allow access
  if (
    pathname === '/' ||
    pathname === '/sign-in' ||
    pathname === '/sign-up' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth')
  ) {
    return NextResponse.next();
  }
  
  // Protected routes - check authentication
  if (pathname.startsWith('/dashboard')) {
    // Not logged in - redirect to sign-in
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/sign-in', nextUrl.origin));
    }
    
    // Check role-based access
    const userRole = auth.user.role as UserRole;
    
    // Check exact path match
    if (roleBasedAccess[pathname] && !roleBasedAccess[pathname].includes(userRole)) {
      return NextResponse.redirect(new URL('/dashboard', nextUrl.origin));
    }
    
    // Check parent paths
    for (const path in roleBasedAccess) {
      if (
        pathname.startsWith(path) && 
        path !== '/dashboard' && 
        !roleBasedAccess[path].includes(userRole)
      ) {
        return NextResponse.redirect(new URL('/dashboard', nextUrl.origin));
      }
    }
  }
  
  return NextResponse.next();
});

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}; 