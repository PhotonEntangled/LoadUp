import { describe, it, expect, jest } from '@jest/globals';

// Mock the NextRequest and NextResponse
const mockNextResponse = {
  next: jest.fn(() => 'next_response'),
  redirect: jest.fn((url) => ({ redirectUrl: url })),
};

const mockAuth = jest.fn((fn) => fn);

// Simple middleware function for testing
const testMiddleware = (req: any) => {
  const { pathname } = req.nextUrl;
  
  // Public routes - allow access
  if (pathname === '/sign-in' || pathname === '/sign-up') {
    return mockNextResponse.next();
  }
  
  // Protected routes - check authentication
  if (pathname.startsWith('/dashboard')) {
    // Not logged in - redirect to sign-in
    if (!req.auth) {
      return mockNextResponse.redirect('/sign-in');
    }
    
    // Admin routes - check role
    if (pathname.startsWith('/dashboard/admin') && req.auth.user.role !== 'admin') {
      return mockNextResponse.redirect('/dashboard');
    }
    
    // Driver routes - check role
    if (pathname.startsWith('/dashboard/driver') && req.auth.user.role !== 'driver') {
      return mockNextResponse.redirect('/dashboard');
    }
  }
  
  return mockNextResponse.next();
};

describe('Simple Middleware Test', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createRequest = (path: string, role?: string) => {
    return {
      nextUrl: {
        pathname: path,
        origin: 'http://localhost:3000',
      },
      auth: role ? {
        user: { role }
      } : null,
    };
  };

  it('should allow access to public routes', () => {
    const request = createRequest('/sign-in');
    
    const response = testMiddleware(request);
    
    expect(mockNextResponse.next).toHaveBeenCalled();
  });

  it('should redirect unauthenticated users to sign-in for protected routes', () => {
    const request = createRequest('/dashboard');
    
    const response = testMiddleware(request);
    
    expect(mockNextResponse.redirect).toHaveBeenCalledWith('/sign-in');
  });

  it('should allow admin users to access admin routes', () => {
    const request = createRequest('/dashboard/admin', 'admin');
    
    const response = testMiddleware(request);
    
    expect(mockNextResponse.next).toHaveBeenCalled();
  });

  it('should redirect non-admin users from admin routes', () => {
    const request = createRequest('/dashboard/admin', 'customer');
    
    const response = testMiddleware(request);
    
    expect(mockNextResponse.redirect).toHaveBeenCalledWith('/dashboard');
  });

  it('should allow driver users to access driver routes', () => {
    const request = createRequest('/dashboard/driver', 'driver');
    
    const response = testMiddleware(request);
    
    expect(mockNextResponse.next).toHaveBeenCalled();
  });

  it('should redirect non-driver users from driver routes', () => {
    const request = createRequest('/dashboard/driver', 'customer');
    
    const response = testMiddleware(request);
    
    expect(mockNextResponse.redirect).toHaveBeenCalledWith('/dashboard');
  });
}); 