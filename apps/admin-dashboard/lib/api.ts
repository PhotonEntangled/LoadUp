/**
 * API Service for Admin Dashboard
 * Handles all API requests to the backend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
  getCurrentUser: () => fetchAPI<{ userId: string; role: string }>('/api/auth'),
};

export default {
  shipment: shipmentAPI,
  driver: driverAPI,
  etl: etlAPI,
  auth: authAPI,
}; 