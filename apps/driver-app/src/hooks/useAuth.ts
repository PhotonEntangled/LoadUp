import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-expo';
import { useCallback, useEffect, useState } from 'react';
import api from '../utils/api';

interface User {
  id: string;
  email: string;
  role: string;
}

interface UseAuthResult {
  user: User | null;
  isLoading: boolean;
  isSignedIn: boolean;
  isDriver: boolean;
}

/**
 * Custom hook for authentication
 */
export function useAuth(): UseAuthResult {
  const { isLoaded, isSignedIn } = useClerkAuth();
  const { user: clerkUser } = useUser();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchUserData = useCallback(async () => {
    if (!isSignedIn || !clerkUser) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const userData = await api.auth.getCurrentUser();
      setUser({
        id: userData.userId,
        email: clerkUser.primaryEmailAddress?.emailAddress || '',
        role: userData.role,
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn, clerkUser]);

  useEffect(() => {
    if (isLoaded) {
      fetchUserData();
    }
  }, [isLoaded, fetchUserData]);

  return {
    user,
    isLoading: !isLoaded || isLoading,
    isSignedIn: !!isSignedIn,
    isDriver: user?.role === 'driver',
  };
} 