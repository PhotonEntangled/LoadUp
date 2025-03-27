import { NextRequest, NextResponse } from 'next/server';
import { auth, signIn } from '@/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Credentials callback: Received request with body:', body);
    
    const { email, password, callbackUrl } = body;
    
    if (!email || !password) {
      console.error('Credentials callback: Missing email or password');
      return NextResponse.json(
        { error: 'Missing email or password' },
        { status: 400 }
      );
    }
    
    try {
      console.log('Credentials callback: Attempting to sign in with:', email);
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      
      console.log('Credentials callback: Sign-in result:', result);
      
      if (!result?.ok) {
        console.error('Credentials callback: Sign-in failed:', result?.error);
        return NextResponse.json(
          { error: result?.error || 'Authentication failed' },
          { status: 401 }
        );
      }
      
      return NextResponse.json({ 
        success: true, 
        url: callbackUrl || '/dashboard' 
      });
    } catch (signInError) {
      console.error('Credentials callback: Sign-in error:', signInError);
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Credentials callback: Error processing request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 