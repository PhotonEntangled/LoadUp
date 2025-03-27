import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { UserRole } from '@/auth';

// Mock user database
const users = [
  {
    id: '1',
    email: 'admin@loadup.com',
    password: 'admin123',
    name: 'Admin User',
    role: UserRole.ADMIN,
  },
  {
    id: '2',
    email: 'driver@loadup.com',
    password: 'driver123',
    name: 'Driver User',
    role: UserRole.DRIVER,
  },
  {
    id: '3',
    email: 'user@loadup.com',
    password: 'user123',
    name: 'Regular User',
    role: UserRole.USER,
  },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Login API: Received request with body:', body);
    
    const { email, password } = body;
    
    if (!email || !password) {
      console.error('Login API: Missing email or password');
      return NextResponse.json(
        { error: 'Missing email or password' },
        { status: 400 }
      );
    }
    
    // Find user by email and password
    const user = users.find(
      (u) => u.email === email && u.password === password
    );
    
    if (!user) {
      console.error('Login API: Invalid credentials for:', email);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    console.log('Login API: Login successful for:', email);
    
    // Create a session cookie
    const cookieStore = cookies();
    cookieStore.set('session', JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
      sameSite: 'lax', // Helps with CSRF protection
    });
    
    // Return user data without password
    const { password: _, ...userData } = user;
    
    // Determine redirect URL based on user role
    let redirectTo = '/';
    
    if (user.role === UserRole.ADMIN) {
      redirectTo = '/dashboard'; // Changed from '/' to '/dashboard' for consistency
    } else if (user.role === UserRole.DRIVER) {
      redirectTo = '/dashboard/driver/success';
    } else {
      redirectTo = '/dashboard/customer/success';
    }
    
    console.log('Login API: Redirecting to:', redirectTo);
    
    // Create the response with the JSON data
    const response = NextResponse.json({
      success: true,
      user: userData,
      redirectTo,
    });
    
    // Set a header to indicate the redirect URL
    // This can be used by the client as a fallback
    response.headers.set('X-Redirect-URL', redirectTo);
    
    return response;
  } catch (error) {
    console.error('Login API: Error processing request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 