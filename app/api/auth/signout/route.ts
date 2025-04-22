import { NextRequest, NextResponse } from 'next/server';
import { signOut } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    // Sign out - assumes signOut throws on failure
    await signOut({ 
      // redirect: false, // Typically not needed for API route signout, default might be fine
      // Note: Check next-auth docs if specific options are needed here
    }); 

    // If signOut doesn't throw, it succeeded
    return NextResponse.json({ success: true });

  } catch (error) {
    // Handle potential errors during sign out (less common)
    console.error('Signout API: Error:', error);
    // Don't expose detailed errors, just indicate failure
    return NextResponse.json({ error: 'Sign out failed' }, { status: 500 });
  }
} 