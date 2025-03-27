"use client";

/**
 * Simple client-side authentication functions
 * These functions are safe to use in client components
 */

/**
 * Sign in with credentials
 */
export async function signIn(credentials: { 
  email: string; 
  password: string;
}) {
  try {
    console.log('simple-auth: Attempting to sign in with:', credentials.email);
    
    const baseUrl = window.location.origin;
    console.log('simple-auth: Using base URL:', baseUrl);
    
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
      credentials: 'same-origin',
    });

    console.log('simple-auth: Sign-in response status:', res.status);
    
    const redirectHeader = res.headers.get('X-Redirect-URL');
    if (redirectHeader) {
      console.log('simple-auth: Found redirect header:', redirectHeader);
    }
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('simple-auth: Sign-in error response:', errorText);
      throw new Error(errorText || 'Failed to sign in');
    }

    const data = await res.json();
    console.log('simple-auth: Sign-in success response:', data);
    
    // Return success immediately to allow the form to complete
    // The actual redirection will be handled by a separate function
    return { 
      success: true, 
      data,
      redirectTo: data.redirectTo || redirectHeader
    };
  } catch (error) {
    console.error('simple-auth: Sign in error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An error occurred' 
    };
  }
}

/**
 * Perform redirection after successful authentication
 * This is a separate function to avoid issues with Next.js navigation
 */
export function performRedirect(url: string) {
  console.log('simple-auth: Performing redirection to:', url);
  
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    console.log('simple-auth: Not in browser environment, skipping redirect');
    return;
  }
  
  // Try multiple approaches to ensure redirection works
  try {
    // Approach 1: Direct assignment to location.href
    window.location.href = url;
    
    // Approach 2: After a small delay, try again with location.replace
    setTimeout(() => {
      if (document.location.pathname.includes('sign-in')) {
        console.log('simple-auth: Fallback to location.replace');
        window.location.replace(url);
      }
    }, 100);
    
    // Approach 3: After another delay, try with form submission
    setTimeout(() => {
      if (document.location.pathname.includes('sign-in') && typeof document !== 'undefined') {
        console.log('simple-auth: Fallback to form submission');
        const form = document.createElement('form');
        form.method = 'GET';
        form.action = url;
        document.body.appendChild(form);
        form.submit();
      }
    }, 200);
  } catch (error) {
    console.error('simple-auth: Redirection error:', error);
    // Final fallback - direct assignment in try/catch
    window.location.href = url;
  }
}

/**
 * Sign out
 */
export async function signOut() {
  try {
    console.log('simple-auth: Attempting to sign out');
    
    const baseUrl = window.location.origin;
    
    const res = await fetch(`${baseUrl}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('simple-auth: Sign-out response status:', res.status);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('simple-auth: Sign-out error response:', errorText);
      throw new Error(errorText || 'Failed to sign out');
    }

    const data = await res.json();
    console.log('simple-auth: Sign-out success response:', data);
    
    window.location.href = '/sign-in';
    return { success: true };
  } catch (error) {
    console.error('simple-auth: Sign out error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An error occurred' 
    };
  }
}

/**
 * Get current user
 */
export async function getUser() {
  try {
    console.log('simple-auth: Attempting to get user');
    
    const baseUrl = window.location.origin;
    
    const res = await fetch(`${baseUrl}/api/auth/user`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('simple-auth: Get user response status:', res.status);
    
    if (!res.ok) {
      if (res.status === 401) {
        console.log('simple-auth: User not authenticated');
        return { success: false, authenticated: false };
      }
      
      const errorText = await res.text();
      console.error('simple-auth: Get user error response:', errorText);
      throw new Error(errorText || 'Failed to get user');
    }

    const data = await res.json();
    console.log('simple-auth: Get user success response:', data);
    
    return { success: true, authenticated: true, user: data.user };
  } catch (error) {
    console.error('simple-auth: Get user error:', error);
    return { 
      success: false, 
      authenticated: false,
      error: error instanceof Error ? error.message : 'An error occurred' 
    };
  }
} 