import { NextRequest, NextResponse } from 'next/server';
import { GET, POST } from '@/app/api/shipments/route';
import { ShipmentService } from '@loadup/database/services/shipmentService';
import { auth } from '@/lib/auth';

// Mock dependencies
jest.mock('@loadup/database/services/shipmentService');
jest.mock('@/lib/auth');

describe('Shipments API', () => {
  const mockShipmentService = ShipmentService as jest.MockedClass<typeof ShipmentService>;
  const mockAuth = auth as jest.MockedFunction<typeof auth>;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock auth to return a valid session
    mockAuth.mockResolvedValue({
      user: {
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin',
      },
    } as any);
    
    // Mock ShipmentService instance
    mockShipmentService.prototype.getShipments = jest.fn().mockResolvedValue({
      data: [
        {
          id: 'test-shipment-id',
          trackingNumber: 'TRACK123',
          status: 'pending',
          pickupLocation: {
            city: 'New York',
            state: 'NY',
          },
          deliveryLocation: {
            city: 'Boston',
            state: 'MA',
          },
          createdAt: new Date().toISOString(),
        },
      ],
      pagination: {
        total: 1,
        page: 1,
        limit: 50,
        totalPages: 1,
      },
    });
    
    mockShipmentService.prototype.createShipment = jest.fn().mockResolvedValue({
      id: 'new-shipment-id',
      trackingNumber: 'TRACK456',
      status: 'pending',
    });
  });
  
  describe('GET /api/shipments', () => {
    it('should return shipments for authenticated users', async () => {
      // Arrange
      const request = new NextRequest('http://localhost:3000/api/shipments');
      
      // Act
      const response = await GET(request);
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(200);
      expect(mockShipmentService.prototype.getShipments).toHaveBeenCalled();
      expect(data).toBeDefined();
    });
    
    it('should return 401 for unauthenticated users', async () => {
      // Arrange
      mockAuth.mockResolvedValueOnce(null);
      const request = new NextRequest('http://localhost:3000/api/shipments');
      
      // Act
      const response = await GET(request);
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });
  
  describe('POST /api/shipments', () => {
    it('should create a shipment for authenticated users', async () => {
      // Arrange
      const shipmentData = {
        customerId: 'test-customer-id',
        description: 'Test shipment',
        pickupLocation: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA',
        },
        pickupContact: {
          name: 'John Doe',
          phone: '555-1234',
          email: 'john@example.com',
        },
        deliveryLocation: {
          street: '456 Elm St',
          city: 'Boston',
          state: 'MA',
          zipCode: '02101',
          country: 'USA',
        },
        deliveryContact: {
          name: 'Jane Smith',
          phone: '555-5678',
          email: 'jane@example.com',
        },
        pickupDate: new Date().toISOString(),
        deliveryDate: new Date().toISOString(),
      };
      
      const request = new NextRequest('http://localhost:3000/api/shipments', {
        method: 'POST',
        body: JSON.stringify(shipmentData),
      });
      
      // Act
      const response = await POST(request);
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(201);
      expect(mockShipmentService.prototype.createShipment).toHaveBeenCalled();
      expect(data).toBeDefined();
      expect(data.id).toBe('new-shipment-id');
    });
    
    it('should return 401 for unauthenticated users', async () => {
      // Arrange
      mockAuth.mockResolvedValueOnce(null);
      const request = new NextRequest('http://localhost:3000/api/shipments', {
        method: 'POST',
        body: JSON.stringify({}),
      });
      
      // Act
      const response = await POST(request);
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });
}); 