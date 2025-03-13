/**
 * API Service for Driver App
 * Handles all API requests to the backend
 */
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.API_URL || 'http://localhost:3001';

/**
 * Generic fetch function with error handling
 */
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || response.statusText);
  }

  return response.json();
}

/**
 * Shipment API functions
 */
export const shipmentAPI = {
  getAll: () => fetchAPI<{ data: any[] }>('/api/shipments'),
  
  getById: (id: string) => fetchAPI<{ data: any }>(`/api/shipments/${id}`),
  
  updateStatus: (id: string, status: string) =>
    fetchAPI<{ data: any }>(`/api/shipments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};

/**
 * Driver API functions
 */
export const driverAPI = {
  getCurrentDriver: () => fetchAPI<{ data: any }>('/api/drivers/current'),
  
  updateLocation: (location: { latitude: number; longitude: number }) =>
    fetchAPI<{ success: boolean }>('/api/drivers/location', {
      method: 'POST',
      body: JSON.stringify(location),
    }),
  
  updateStatus: (status: 'active' | 'inactive') =>
    fetchAPI<{ success: boolean }>('/api/drivers/status', {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};

/**
 * Auth API functions
 */
export const authAPI = {
  getCurrentUser: () => fetchAPI<{ userId: string; role: string }>('/api/auth'),
};

export default {
  shipment: shipmentAPI,
  driver: driverAPI,
  auth: authAPI,
}; 