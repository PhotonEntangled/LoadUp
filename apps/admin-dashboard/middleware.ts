import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const isAuthRoute = request.nextUrl.pathname.startsWith('/sign-in') || 
                      request.nextUrl.pathname.startsWith('/sign-up');
  
  // If the user is not authenticated and trying to access a protected route
  if (!token && !isAuthRoute && request.nextUrl.pathname !== '/') {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  // If the user is authenticated and trying to access an auth route
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!.*\\..*|_next).*)',
    '/',
    '/(api|trpc)(.*)',
  ],
}; 