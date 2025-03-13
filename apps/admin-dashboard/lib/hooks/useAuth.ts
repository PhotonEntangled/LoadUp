import { useAuth as useClerkAuth } from '@clerk/nextjs';
import { useCallback, useEffect, useState } from 'react';
import api from '../api';

interface User {
  id: string;
  email: string;
  role: string;
}

interface UseAuthResult {
  user: User | null;
  isLoading: boolean;
  isSignedIn: boolean;
  isAdmin: boolean;
  isDriver: boolean;
}

/**
 * Custom hook for authentication
 */
export function useAuth(): UseAuthResult {
  const { userId, isLoaded, isSignedIn } = useClerkAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchUserData = useCallback(async () => {
    if (!userId) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const userData = await api.auth.getCurrentUser();
      setUser({
        id: userData.userId,
        email: '', // Clerk doesn't provide email in the API response
        role: userData.role,
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (isLoaded) {
      fetchUserData();
    }
  }, [isLoaded, fetchUserData]);

  return {
    user,
    isLoading: !isLoaded || isLoading,
    isSignedIn: !!isSignedIn,
    isAdmin: user?.role === 'admin',
    isDriver: user?.role === 'driver',
  };
} 