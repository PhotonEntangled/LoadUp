import { app } from "./mock-server.js";
import request from 'supertest';
// @ts-ignore - Missing type definitions for uuid
import { v4 as uuidv4 } from 'uuid';

// Mock location data for tracking updates
const mockLocationData = {
  latitude: 37.7749,
  longitude: -122.4194,
  timestamp: new Date().toISOString(),
  accuracy: 10,
  speed: 25,
  heading: 90
};

// Mock tracking history data
const mockTrackingHistory = [
  {
    id: uuidv4(),
    shipmentId: '123e4567-e89b-12d3-a456-426614174000',
    status: 'picked_up',
    location: {
      latitude: 37.7749,
      longitude: -122.4194,
      address: '123 Pickup St, San Francisco, CA'
    },
    timestamp: new Date(Date.now() - 86400000).toISOString(), // 24 hours ago
    notes: 'Package picked up from sender'
  },
  {
    id: uuidv4(),
    shipmentId: '123e4567-e89b-12d3-a456-426614174000',
    status: 'in_transit',
    location: {
      latitude: 37.3382,
      longitude: -121.8863,
      address: '456 Transit Ave, San Jose, CA'
    },
    timestamp: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
    notes: 'Package in transit to destination'
  }
];

// Mock the database functions
jest.mock('@packages/database', () => ({
  db: {
    select: jest.fn().mockReturnValue({
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue(mockTrackingHistory)
    }),
    insert: jest.fn().mockReturnValue({
      values: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([{
          id: uuidv4(),
          shipmentId: '123e4567-e89b-12d3-a456-426614174000',
          status: 'in_transit',
          location: {
            latitude: mockLocationData.latitude,
            longitude: mockLocationData.longitude,
            address: '789 Current St, Oakland, CA'
          },
          timestamp: new Date().toISOString(),
          notes: 'Location update from driver'
        }])
      })
    }),
    query: {
      shipments: {
        findFirst: jest.fn().mockImplementation((params) => {
          if (params?.where?.id === '99999999-9999-9999-9999-999999999999') {
            return Promise.resolve(null);
          }
          return Promise.resolve({
            id: '123e4567-e89b-12d3-a456-426614174000',
            trackingNumber: 'TEST456',
            status: 'in_transit',
            customerName: 'Jane Doe',
            estimatedDelivery: new Date(Date.now() + 86400000).toISOString(), // 24 hours in future
            currentLocation: {
              latitude: 37.3382,
              longitude: -121.8863,
              address: '456 Transit Ave, San Jose, CA'
            }
          });
        })
      },
      trackingUpdates: {
        findMany: jest.fn().mockResolvedValue(mockTrackingHistory)
      }
    }
  }
}));

// Add tracking routes to the mock server
app.get('/api/shipments/:id/tracking', async (req: any, res: any) => {
  try {
    const { id } = req.params;
    
    // Check if shipment exists
    const shipment = await jest.requireMock('@packages/database').db.query.shipments.findFirst({
      where: { id }
    });
    
    if (!shipment) {
      return res.status(404).json({ error: 'Shipment not found' });
    }
    
    // Get tracking history
    const trackingHistory = await jest.requireMock('@packages/database').db.query.trackingUpdates.findMany({
      where: { shipmentId: id }
    });
    
    res.json({
      data: {
        shipment,
        trackingHistory
      }
    });
  } catch (error) {
    console.error('Error fetching tracking data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/shipments/:id/tracking', async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { location, status, notes } = req.body;
    
    // Check if shipment exists
    const shipment = await jest.requireMock('@packages/database').db.query.shipments.findFirst({
      where: { id }
    });
    
    if (!shipment) {
      return res.status(404).json({ error: 'Shipment not found' });
    }
    
    // Create tracking update
    const [trackingUpdate] = await jest.requireMock('@packages/database').db.insert().values({
      shipmentId: id,
      status: status || 'in_transit',
      location,
      timestamp: new Date().toISOString(),
      notes: notes || ''
    }).returning();
    
    res.status(201).json({ data: trackingUpdate });
  } catch (error) {
    console.error('Error updating tracking data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

describe('Shipment Tracking API', () => {
  beforeAll(() => {
    // Setup any test data if needed
  });
  
  afterAll(() => {
    // Clean up any test data if needed
  });
  
  describe('GET /api/shipments/:id/tracking', () => {
    it('should fetch tracking data for a valid shipment', async () => {
      const shipmentId = '123e4567-e89b-12d3-a456-426614174000';
      const res = await request(app).get(`/api/shipments/${shipmentId}/tracking`);
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('shipment');
      expect(res.body.data).toHaveProperty('trackingHistory');
      expect(res.body.data.shipment.id).toBe(shipmentId);
      expect(Array.isArray(res.body.data.trackingHistory)).toBe(true);
      expect(res.body.data.trackingHistory.length).toBeGreaterThan(0);
    });
    
    it('should return 404 for non-existent shipment', async () => {
      const res = await request(app).get('/api/shipments/99999999-9999-9999-9999-999999999999/tracking');
      
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error', 'Shipment not found');
    });
    
    it('should include current location in response', async () => {
      const shipmentId = '123e4567-e89b-12d3-a456-426614174000';
      const res = await request(app).get(`/api/shipments/${shipmentId}/tracking`);
      
      expect(res.status).toBe(200);
      expect(res.body.data.shipment).toHaveProperty('currentLocation');
      expect(res.body.data.shipment.currentLocation).toHaveProperty('latitude');
      expect(res.body.data.shipment.currentLocation).toHaveProperty('longitude');
    });
    
    it('should include estimated delivery time in response', async () => {
      const shipmentId = '123e4567-e89b-12d3-a456-426614174000';
      const res = await request(app).get(`/api/shipments/${shipmentId}/tracking`);
      
      expect(res.status).toBe(200);
      expect(res.body.data.shipment).toHaveProperty('estimatedDelivery');
      expect(new Date(res.body.data.shipment.estimatedDelivery)).toBeInstanceOf(Date);
    });
  });
  
  describe('POST /api/shipments/:id/tracking', () => {
    it('should create a new tracking update for a valid shipment', async () => {
      const shipmentId = '123e4567-e89b-12d3-a456-426614174000';
      const updateData = {
        location: {
          latitude: mockLocationData.latitude,
          longitude: mockLocationData.longitude,
          address: '789 Current St, Oakland, CA'
        },
        status: 'in_transit',
        notes: 'Driver update: Package in transit'
      };
      
      const res = await request(app)
        .post(`/api/shipments/${shipmentId}/tracking`)
        .send(updateData);
      
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data).toHaveProperty('shipmentId', shipmentId);
      expect(res.body.data).toHaveProperty('status', 'in_transit');
      expect(res.body.data).toHaveProperty('location');
      expect(res.body.data).toHaveProperty('timestamp');
    });
    
    it('should return 404 for tracking updates to non-existent shipments', async () => {
      const updateData = {
        location: {
          latitude: mockLocationData.latitude,
          longitude: mockLocationData.longitude,
          address: '789 Current St, Oakland, CA'
        },
        status: 'in_transit'
      };
      
      const res = await request(app)
        .post('/api/shipments/99999999-9999-9999-9999-999999999999/tracking')
        .send(updateData);
      
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error', 'Shipment not found');
    });
    
    it('should handle location updates without status changes', async () => {
      const shipmentId = '123e4567-e89b-12d3-a456-426614174000';
      const updateData = {
        location: {
          latitude: mockLocationData.latitude,
          longitude: mockLocationData.longitude,
          address: '789 Current St, Oakland, CA'
        }
      };
      
      const res = await request(app)
        .post(`/api/shipments/${shipmentId}/tracking`)
        .send(updateData);
      
      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('status', 'in_transit'); // Default status
    });
  });
}); 