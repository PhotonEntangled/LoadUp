"use client";

/**
 * Client-side authentication functions
 * These functions are safe to use in client components
 */

/**
 * Sign in with credentials
 */
export async function signInWithCredentials(credentials: { 
  email: string; 
  password: string;
}) {
  try {
    console.log('auth-client: Attempting to sign in with:', credentials.email);
    
    // Use the correct URL with port 3000
    const baseUrl = window.location.origin;
    console.log('auth-client: Using base URL:', baseUrl);
    
    const res = await fetch(`${baseUrl}/api/auth/callback/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        json: true,
        ...credentials,
        callbackUrl: '/dashboard',
      }),
    });

    console.log('auth-client: Sign-in response status:', res.status);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('auth-client: Sign-in error response:', errorText);
      throw new Error(errorText || 'Failed to sign in');
    }

    const data = await res.json();
    console.log('auth-client: Sign-in success response:', data);
    
    // If we have a url in the response, we should redirect to it
    if (data.url) {
      console.log('auth-client: Redirecting to:', data.url);
      window.location.href = data.url;
      return { success: true };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('auth-client: Sign in error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An error occurred' 
    };
  }
}

/**
 * Sign out
 */
export async function signOutClient() {
  try {
    console.log('auth-client: Attempting to sign out');
    
    // Use the correct URL with port 3000
    const baseUrl = window.location.origin;
    
    const res = await fetch(`${baseUrl}/api/auth/signout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        json: true,
        callbackUrl: '/sign-in',
      }),
    });

    console.log('auth-client: Sign-out response status:', res.status);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('auth-client: Sign-out error response:', errorText);
      throw new Error(errorText || 'Failed to sign out');
    }

    const data = await res.json();
    console.log('auth-client: Sign-out success response:', data);
    
    // If we have a url in the response, we should redirect to it
    if (data.url) {
      console.log('auth-client: Redirecting to:', data.url);
      window.location.href = data.url;
      return { success: true };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('auth-client: Sign out error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An error occurred' 
    };
  }
} 