/**
 * API Service for Admin Dashboard
 * Handles all API requests to the backend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

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

  try {
    console.log(`API Request: ${options.method || 'GET'} ${url}`);
    
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Include cookies for authentication
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error (${response.status}): ${errorText || response.statusText}`);
      
      // Handle specific error codes
      if (response.status === 401) {
        throw new Error('Authentication required. Please sign in.');
      } else if (response.status === 403) {
        throw new Error('You do not have permission to access this resource.');
      } else if (response.status === 404) {
        throw new Error('The requested resource was not found.');
      } else if (response.status >= 500) {
        throw new Error('Server error. Please try again later.');
      }
      
      throw new Error(errorText || response.statusText);
    }

    return response.json();
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
}

/**
 * Shipment API functions
 */
export const shipmentAPI = {
  getAll: () => fetchAPI<{ data: any[] }>('/api/shipments'),
  
  getById: (id: string) => fetchAPI<{ data: any }>(`/api/shipments/${id}`),
  
  create: (data: any) => 
    fetchAPI<{ data: any }>('/api/shipments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: string, data: any) =>
    fetchAPI<{ data: any }>(`/api/shipments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string) =>
    fetchAPI<{ success: boolean }>(`/api/shipments/${id}`, {
      method: 'DELETE',
    }),
};

/**
 * Driver API functions
 */
export const driverAPI = {
  getAll: () => fetchAPI<{ data: any[] }>('/api/drivers'),
  
  getById: (id: string) => fetchAPI<{ data: any }>(`/api/drivers/${id}`),
  
  update: (id: string, data: any) =>
    fetchAPI<{ data: any }>(`/api/drivers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};

/**
 * ETL API functions
 */
export const etlAPI = {
  processShipmentSlips: (data: any[]) =>
    fetchAPI<{ success: boolean }>('/api/etl/process-shipment-slips', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

/**
 * Auth API functions
 */
export const authAPI = {
  getCurrentUser: () => fetchAPI<{ userId: string; role: string; email?: string; fullName?: string }>('/api/auth'),
  
  // Add a health check function to test API connectivity
  healthCheck: () => fetchAPI<{ status: string }>('/health'),
};

export default {
  shipment: shipmentAPI,
  driver: driverAPI,
  etl: etlAPI,
  auth: authAPI,
}; 