import { NextRequest, NextResponse } from 'next/server';
import { auth, signOut } from '@/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Signout: Received request with body:', body);
    
    const { callbackUrl } = body;
    
    try {
      console.log('Signout: Attempting to sign out');
      const result = await signOut({
        redirect: false,
        redirectTo: callbackUrl || '/sign-in',
      });
      
      console.log('Signout: Sign-out result:', result);
      
      return NextResponse.json({ 
        success: true, 
        url: callbackUrl || '/sign-in' 
      });
    } catch (signOutError) {
      console.error('Signout: Sign-out error:', signOutError);
      return NextResponse.json(
        { error: 'Failed to sign out' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Signout: Error processing request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 