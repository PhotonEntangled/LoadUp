import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { signIn } from "@/lib/auth"; // Use the potentially corrected signIn
import { AuthError } from '@auth/core/errors';

const schema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const { email, password } = parsed.data;

    // Attempt sign in - assumes signIn throws AuthError on failure
    await signIn('credentials', {
      email,
      password,
      redirect: false, // Keep redirect false for API route
    });

    // If signIn doesn't throw, it succeeded
    return NextResponse.json({ success: true });

  } catch (error) {
    if (error instanceof AuthError) {
        console.error('Credentials callback API: AuthError:', error.type, error.message);
         // Map specific error types if needed
        switch (error.type) {
            case 'CredentialsSignin':
            case 'CallbackRouteError':
                return NextResponse.json({ error: "Invalid email or password." }, { status: 401 }); // Unauthorized
            default:
                 return NextResponse.json({ error: "Authentication failed." }, { status: 500 });
        }
    }

    // Handle unexpected errors
    console.error('Credentials callback API: Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 