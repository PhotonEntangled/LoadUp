import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

// Mock fetch
const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
global.fetch = mockFetch;

// Simple API client for testing
const api = {
  baseUrl: 'https://api.example.com',
  
  async getShipments() {
    const response = await fetch(`${this.baseUrl}/shipments`);
    if (!response.ok) {
      throw new Error('Failed to fetch shipments');
    }
    return response.json();
  },
  
  async getShipmentById(id: string) {
    const response = await fetch(`${this.baseUrl}/shipments/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch shipment with id ${id}`);
    }
    return response.json();
  },
  
  async createShipment(data: any) {
    const response = await fetch(`${this.baseUrl}/shipments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error('Failed to create shipment');
    }
    
    return response.json();
  }
};

describe('API Client', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.resetAllMocks();
  });
  
  afterEach(() => {
    // Ensure all mocks were called as expected
    jest.clearAllMocks();
  });
  
  describe('getShipments', () => {
    it('should fetch all shipments', async () => {
      // Mock data
      const mockShipments = [
        { id: '1', origin: 'New York', destination: 'Los Angeles' },
        { id: '2', origin: 'Chicago', destination: 'Miami' }
      ];
      
      // Mock fetch response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockShipments
      } as unknown as Response);
      
      // Call the method
      const result = await api.getShipments();
      
      // Assertions
      expect(mockFetch).toHaveBeenCalledWith('https://api.example.com/shipments');
      expect(result).toEqual(mockShipments);
    });
    
    it('should throw an error when fetch fails', async () => {
      // Mock failed response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      } as unknown as Response);
      
      // Call the method and expect it to throw
      await expect(api.getShipments()).rejects.toThrow('Failed to fetch shipments');
      
      // Assertions
      expect(mockFetch).toHaveBeenCalledWith('https://api.example.com/shipments');
    });
  });
  
  describe('getShipmentById', () => {
    it('should fetch a shipment by ID', async () => {
      // Mock data
      const mockShipment = { id: '1', origin: 'New York', destination: 'Los Angeles' };
      
      // Mock fetch response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockShipment
      } as unknown as Response);
      
      // Call the method
      const result = await api.getShipmentById('1');
      
      // Assertions
      expect(mockFetch).toHaveBeenCalledWith('https://api.example.com/shipments/1');
      expect(result).toEqual(mockShipment);
    });
  });
  
  describe('createShipment', () => {
    it('should create a new shipment', async () => {
      // Mock data
      const shipmentData = { origin: 'Boston', destination: 'Seattle' };
      const mockResponse = { id: '3', origin: 'Boston', destination: 'Seattle' };
      
      // Mock fetch response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as unknown as Response);
      
      // Call the method
      const result = await api.createShipment(shipmentData);
      
      // Assertions
      expect(mockFetch).toHaveBeenCalledWith('https://api.example.com/shipments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(shipmentData)
      });
      expect(result).toEqual(mockResponse);
    });
  });
}); 