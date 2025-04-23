import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from './lib/auth';

// Define role-based route access
const roleBasedAccess: Record<string, UserRole[]> = {
  // ... (original role config)
};

// This function is called by the middleware to check if the user has access to the requested route
async function hasAccess(req: NextRequest) {
  // ... (original hasAccess function logic)
  try {
    const hasAccessResult = await hasAccess(req);
    
    // Redirect to sign-in page if not authenticated
    if (!hasAccessResult && (req.nextUrl.pathname.startsWith('/dashboard') || req.nextUrl.pathname === '/')) {
      console.log('Middleware: Redirecting to sign-in page from', req.nextUrl.pathname);
      return NextResponse.redirect(new URL('/sign-in', req.nextUrl.origin));
    }
    
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

export async function middleware(req: NextRequest) {
  // For development bypassing auth (controlled by env var)
  if (process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true' && process.env.NODE_ENV === 'development') {
    console.log('Middleware: Bypassing auth check due to NEXT_PUBLIC_BYPASS_AUTH=true');
    return NextResponse.next();
  } else {
    // Auth checks would normally happen here, but user requested bypass for now.
    console.log('Middleware: Auth bypass ENV VAR not set/false OR NODE_ENV is not development, but bypassing auth checks anyway as requested.');
    // console.log('Middleware: Auth bypass not enabled.', { // Original log for reference
    //   bypassAuth: process.env.NEXT_PUBLIC_BYPASS_AUTH,
    //   nodeEnv: process.env.NODE_ENV
    // });
    return NextResponse.next(); // Bypass auth regardless of env var as requested
  }
}

// Keep matcher config
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}; 