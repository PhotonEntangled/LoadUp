import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

export async function GET() {
  const { userId, sessionClaims } = auth();
  
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  return NextResponse.json({
    userId,
    role: sessionClaims?.role || 'user',
  });
} 