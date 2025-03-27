import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    console.log('User API: Received request');
    
    // Get the session cookie
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('session');
    
    if (!sessionCookie) {
      console.log('User API: No session cookie found');
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    try {
      const session = JSON.parse(sessionCookie.value);
      console.log('User API: Session found:', session);
      
      return NextResponse.json({
        success: true,
        user: session,
      });
    } catch (error) {
      console.error('User API: Error parsing session cookie:', error);
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('User API: Error processing request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 