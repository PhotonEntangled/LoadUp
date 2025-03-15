import { useSession as useNextAuthSession, signIn, signOut } from "next-auth/react";
import { useCallback, useEffect, useState } from 'react';
import api from '../api';
import { UserRole } from '@loadup/shared';

interface User {
  id: string;
  email: string | null | undefined;
  role: string;
  name?: string | null | undefined;
}

interface UseAuthResult {
  user: User | null;
  isLoading: boolean;
  isSignedIn: boolean;
  isAdmin: boolean;
  isDriver: boolean;
  signIn: (credentials: { email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
}

/**
 * Custom hook for authentication in the LoadUp admin dashboard
 * Uses NextAuth for authentication and session management
 */
export function useAuth(): UseAuthResult {
  const { data: session, status } = useNextAuthSession();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchUserData = useCallback(async () => {
    if (!session?.user) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      // If we have user data in the session, use it directly
      if (session.user.id && session.user.role) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          role: session.user.role,
          name: session.user.name
        });
        setIsLoading(false);
        return;
      }
      
      // Fallback to API call if session doesn't have all the data
      const userData = await api.auth.getCurrentUser();
      setUser({
        id: userData.userId || session.user.id,
        email: session.user.email,
        role: userData.role || session.user.role || UserRole.USER,
        name: session.user.name
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Use session data as fallback if API call fails
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          role: session.user.role,
          name: session.user.name
        });
      } else {
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  // Handle authentication
  const handleSignIn = async (credentials: { email: string; password: string }) => {
    await signIn('credentials', {
      email: credentials.email,
      password: credentials.password,
      callbackUrl: '/dashboard'
    });
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  useEffect(() => {
    if (status !== 'loading') {
      fetchUserData();
    }
  }, [status, fetchUserData]);

  return {
    user,
    isLoading: status === 'loading' || isLoading,
    isSignedIn: status === 'authenticated',
    isAdmin: user?.role === UserRole.ADMIN,
    isDriver: user?.role === UserRole.DRIVER,
    signIn: handleSignIn,
    signOut: handleSignOut
  };
} 