import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import middleware from '../middleware';

// Mock the auth module
jest.mock('@/lib/auth', () => ({
  auth: jest.fn(),
}));

// Mock NextResponse
jest.mock('next/server', () => {
  const originalModule = jest.requireActual('next/server');
  return {
    ...originalModule,
    NextResponse: {
      next: jest.fn(() => 'next_response'),
      redirect: jest.fn((url) => ({ redirectUrl: url })),
    },
  };
});

describe('Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createRequest = (path: string): NextRequest => {
    return {
      nextUrl: {
        pathname: path,
        origin: 'http://localhost:3000',
        clone: () => ({ pathname: path }),
      },
      cookies: {
        get: jest.fn(),
        getAll: jest.fn(),
        set: jest.fn(),
        delete: jest.fn(),
        clear: jest.fn(),
        toString: jest.fn(),
      },
    } as unknown as NextRequest;
  };

  it('should allow access to public routes', async () => {
    const request = createRequest('/sign-in');
    const authObj = jest.fn().mockResolvedValue({
      auth: null,
      nextUrl: request.nextUrl,
    });
    
    await authObj(middleware)(request);
    
    expect(NextResponse.next).toHaveBeenCalled();
  });

  it('should redirect unauthenticated users to sign-in for protected routes', async () => {
    const request = createRequest('/dashboard');
    const authObj = jest.fn().mockResolvedValue({
      auth: null,
      nextUrl: request.nextUrl,
    });
    
    await authObj(middleware)(request);
    
    expect(NextResponse.redirect).toHaveBeenCalledWith(expect.stringContaining('/sign-in'));
  });

  it('should allow admin users to access admin routes', async () => {
    const request = createRequest('/dashboard/admin');
    const authObj = jest.fn().mockResolvedValue({
      auth: {
        user: { role: 'admin' },
      },
      nextUrl: request.nextUrl,
    });
    
    await authObj(middleware)(request);
    
    expect(NextResponse.next).toHaveBeenCalled();
  });

  it('should redirect non-admin users from admin routes', async () => {
    const request = createRequest('/dashboard/admin');
    const authObj = jest.fn().mockResolvedValue({
      auth: {
        user: { role: 'customer' },
      },
      nextUrl: request.nextUrl,
    });
    
    await authObj(middleware)(request);
    
    expect(NextResponse.redirect).toHaveBeenCalledWith(expect.stringContaining('/dashboard'));
  });

  it('should allow driver users to access driver routes', async () => {
    const request = createRequest('/dashboard/drivers');
    const authObj = jest.fn().mockResolvedValue({
      auth: {
        user: { role: 'driver' },
      },
      nextUrl: request.nextUrl,
    });
    
    await authObj(middleware)(request);
    
    expect(NextResponse.next).toHaveBeenCalled();
  });

  it('should redirect non-driver users from driver routes', async () => {
    const request = createRequest('/dashboard/drivers');
    const authObj = jest.fn().mockResolvedValue({
      auth: {
        user: { role: 'customer' },
      },
      nextUrl: request.nextUrl,
    });
    
    await authObj(middleware)(request);
    
    expect(NextResponse.redirect).toHaveBeenCalledWith(expect.stringContaining('/dashboard'));
  });
}); 