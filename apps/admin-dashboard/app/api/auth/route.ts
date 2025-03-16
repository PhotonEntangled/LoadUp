import { NextResponse } from 'next/server';
import { auth } from '@/../../../../auth';

export async function GET() {
  const { userId, sessionClaims } = auth();

  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  return NextResponse.json({
    authenticated: !!userId,
    userId,
    sessionClaims,
  });
} 