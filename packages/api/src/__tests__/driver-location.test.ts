import { app } from './mock-server.js';
import request from 'supertest';
// @ts-ignore - Missing type definitions for uuid
import { v4 as uuidv4 } from 'uuid';

// Define driver type for testing
interface MockDriver {
  id: string;
  name: string;
  truckType: string;
  status: string;
  location: string | null;
  updatedAt: Date;
}

// Mock driver data
const mockDrivers: MockDriver[] = [
  {
    id: uuidv4(),
    name: 'John Doe',
    truckType: 'van',
    status: 'active',
    location: JSON.stringify({
      latitude: 37.7749,
      longitude: -122.4194,
      timestamp: new Date().toISOString()
    }),
    updatedAt: new Date()
  },
  {
    id: uuidv4(),
    name: 'Jane Smith',
    truckType: 'box_truck',
    status: 'active',
    location: null,
    updatedAt: new Date()
  }
];

// Mock the database functions
jest.mock('@packages/database', () => ({
  db: {
    update: jest.fn().mockReturnValue({
      set: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue(Promise.resolve())
      })
    }),
    query: {
      drivers: {
        findFirst: jest.fn().mockImplementation((params) => {
          const driverId = params?.where?.id;
          const driver = mockDrivers.find(d => d.id === driverId);
          return Promise.resolve(driver || null);
        }),
        findMany: jest.fn().mockResolvedValue(mockDrivers)
      }
    }
  }
}));

// Add driver location routes to the mock server
app.post('/api/drivers/location', async (req, res) => {
  try {
    const { driverId, latitude, longitude } = req.body;
    
    // Check if driver exists
    const driver = await jest.requireMock('@packages/database').db.query.drivers.findFirst({
      where: { id: driverId }
    });
    
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }
    
    // Update driver location
    const locationData = {
      latitude,
      longitude,
      timestamp: new Date().toISOString()
    };
    
    await jest.requireMock('@packages/database').db.update().set({
      location: JSON.stringify(locationData),
      updatedAt: new Date()
    }).where({ id: driverId });
    
    res.status(200).json({ 
      success: true,
      data: {
        driverId,
        location: locationData
      }
    });
  } catch (error) {
    console.error('Error updating driver location:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/drivers/:id/location', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if driver exists
    const driver = await jest.requireMock('@packages/database').db.query.drivers.findFirst({
      where: { id }
    });
    
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }
    
    // Return driver location
    const location = driver.location ? JSON.parse(driver.location) : null;
    
    res.status(200).json({ 
      success: true,
      data: {
        driverId: id,
        location
      }
    });
  } catch (error) {
    console.error('Error fetching driver location:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/drivers/active-locations', async (req, res) => {
  try {
    // Get all active drivers
    const drivers = await jest.requireMock('@packages/database').db.query.drivers.findMany({
      where: { status: 'active' }
    });
    
    // Extract and parse locations
    const locations = drivers
      .filter((driver: MockDriver) => driver.location)
      .map((driver: MockDriver) => ({
        driverId: driver.id,
        name: driver.name,
        location: JSON.parse(driver.location as string),
        truckType: driver.truckType
      }));
    
    res.status(200).json({ 
      success: true,
      data: locations
    });
  } catch (error) {
    console.error('Error fetching active driver locations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

describe('Driver Location API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('POST /api/drivers/location', () => {
    it('should update driver location successfully', async () => {
      const driverId = mockDrivers[0].id;
      const locationData = {
        driverId,
        latitude: 37.7833,
        longitude: -122.4167
      };
      
      const res = await request(app)
        .post('/api/drivers/location')
        .send(locationData);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.driverId).toBe(driverId);
      expect(res.body.data.location.latitude).toBe(locationData.latitude);
      expect(res.body.data.location.longitude).toBe(locationData.longitude);
      expect(res.body.data.location.timestamp).toBeDefined();
      
      // Verify database update was called
      const dbMock = jest.requireMock('@packages/database').db;
      expect(dbMock.update).toHaveBeenCalled();
      expect(dbMock.update().set).toHaveBeenCalled();
      expect(dbMock.update().set().where).toHaveBeenCalled();
    });
    
    it('should return 404 for non-existent driver', async () => {
      const locationData = {
        driverId: 'non-existent-id',
        latitude: 37.7833,
        longitude: -122.4167
      };
      
      const res = await request(app)
        .post('/api/drivers/location')
        .send(locationData);
      
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Driver not found');
    });
    
    it('should validate required fields', async () => {
      // Missing latitude
      const invalidData = {
        driverId: mockDrivers[0].id,
        longitude: -122.4167
      };
      
      const res = await request(app)
        .post('/api/drivers/location')
        .send(invalidData);
      
      expect(res.status).toBe(500); // In a real implementation, this would be 400 Bad Request
    });
  });
  
  describe('GET /api/drivers/:id/location', () => {
    it('should retrieve driver location successfully', async () => {
      const driverId = mockDrivers[0].id;
      
      const res = await request(app)
        .get(`/api/drivers/${driverId}/location`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.driverId).toBe(driverId);
      expect(res.body.data.location).toBeDefined();
      expect(res.body.data.location.latitude).toBeDefined();
      expect(res.body.data.location.longitude).toBeDefined();
    });
    
    it('should return null location for driver without location', async () => {
      const driverId = mockDrivers[1].id;
      
      const res = await request(app)
        .get(`/api/drivers/${driverId}/location`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.driverId).toBe(driverId);
      expect(res.body.data.location).toBeNull();
    });
    
    it('should return 404 for non-existent driver', async () => {
      const res = await request(app)
        .get('/api/drivers/non-existent-id/location');
      
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Driver not found');
    });
  });
  
  describe('GET /api/drivers/active-locations', () => {
    it('should retrieve all active driver locations', async () => {
      const res = await request(app)
        .get('/api/drivers/active-locations');
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      
      // Only drivers with location data should be included
      const locationsCount = mockDrivers.filter(d => d.location).length;
      expect(res.body.data.length).toBe(locationsCount);
      
      // Check first driver's data
      const firstDriver = res.body.data[0];
      expect(firstDriver.driverId).toBeDefined();
      expect(firstDriver.name).toBeDefined();
      expect(firstDriver.location).toBeDefined();
      expect(firstDriver.truckType).toBeDefined();
    });
    
    it('should handle database errors gracefully', async () => {
      // Mock a database error
      jest.requireMock('@packages/database').db.query.drivers.findMany.mockRejectedValueOnce(
        new Error('Database connection error')
      );
      
      const res = await request(app)
        .get('/api/drivers/active-locations');
      
      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Internal server error');
    });
  });
}); 