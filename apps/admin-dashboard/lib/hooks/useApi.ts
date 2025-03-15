import { useState, useEffect, useCallback } from 'react';
import api from '../api.js';

interface UseApiOptions<T> {
  initialData?: T;
  fetchOnMount?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for making API requests
 */
export function useApi<T>(
  apiFunction: () => Promise<T>,
  options: UseApiOptions<T> = {}
): UseApiResult<T> {
  const { initialData = null, fetchOnMount = true, onSuccess, onError } = options;
  
  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiFunction();
      setData(result);
      if (onSuccess) onSuccess(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      if (onError) onError(error);
    } finally {
      setLoading(false);
    }
  }, [apiFunction, onSuccess, onError]);

  useEffect(() => {
    if (fetchOnMount) {
      fetchData();
    }
  }, [fetchOnMount, fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook for fetching all shipments
 */
export function useShipments() {
  return useApi(() => api.shipment.getAll());
}

/**
 * Hook for fetching a shipment by ID
 */
export function useShipment(id: string) {
  return useApi(() => api.shipment.getById(id));
}

/**
 * Hook for fetching all drivers
 */
export function useDrivers() {
  return useApi(() => api.driver.getAll());
}

/**
 * Hook for fetching a driver by ID
 */
export function useDriver(id: string) {
  return useApi(() => api.driver.getById(id));
}

/**
 * Hook for fetching the current user
 */
export function useCurrentUser() {
  return useApi(() => api.auth.getCurrentUser());
} 