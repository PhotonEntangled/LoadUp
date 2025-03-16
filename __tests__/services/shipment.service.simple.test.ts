import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Mock database client
const mockDb = {
  query: jest.fn().mockImplementation(() => Promise.resolve({ rows: [] })),
  transaction: jest.fn(),
};

// Simple shipment service for testing
const shipmentService = {
  db: mockDb,
  
  async getShipments() {
    const result = await this.db.query('SELECT * FROM shipments');
    return result.rows;
  },
  
  async getShipmentById(id: string) {
    const result = await this.db.query('SELECT * FROM shipments WHERE id = $1', [id]);
    return result.rows[0] || null;
  },
  
  async createShipment(data: any) {
    const { origin, destination, items, customer_id } = data;
    
    const result = await this.db.query(
      'INSERT INTO shipments (origin, destination, items, customer_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [origin, destination, JSON.stringify(items), customer_id]
    );
    
    return result.rows[0];
  },
  
  async updateShipmentStatus(id: string, status: string) {
    const result = await this.db.query(
      'UPDATE shipments SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );
    
    return result.rows[0] || null;
  },
  
  async deleteShipment(id: string) {
    const result = await this.db.query('DELETE FROM shipments WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  }
};

describe('Shipment Service', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.resetAllMocks();
    mockDb.query.mockImplementation(() => Promise.resolve({ rows: [] }));
  });
  
  describe('getShipments', () => {
    it('should fetch all shipments', async () => {
      // Mock database response
      const mockShipments = [
        { id: '1', origin: 'New York', destination: 'Los Angeles', status: 'pending' },
        { id: '2', origin: 'Chicago', destination: 'Miami', status: 'in_transit' }
      ];
      
      mockDb.query.mockResolvedValueOnce({ rows: mockShipments });
      
      // Call the method
      const result = await shipmentService.getShipments();
      
      // Assertions
      expect(mockDb.query).toHaveBeenCalledWith('SELECT * FROM shipments');
      expect(result).toEqual(mockShipments);
    });
  });
  
  describe('getShipmentById', () => {
    it('should fetch a shipment by ID', async () => {
      // Mock database response
      const mockShipment = { id: '1', origin: 'New York', destination: 'Los Angeles', status: 'pending' };
      
      mockDb.query.mockResolvedValueOnce({ rows: [mockShipment] });
      
      // Call the method
      const result = await shipmentService.getShipmentById('1');
      
      // Assertions
      expect(mockDb.query).toHaveBeenCalledWith('SELECT * FROM shipments WHERE id = $1', ['1']);
      expect(result).toEqual(mockShipment);
    });
    
    it('should return null if shipment not found', async () => {
      // Mock empty response
      mockDb.query.mockResolvedValueOnce({ rows: [] });
      
      // Call the method
      const result = await shipmentService.getShipmentById('999');
      
      // Assertions
      expect(mockDb.query).toHaveBeenCalledWith('SELECT * FROM shipments WHERE id = $1', ['999']);
      expect(result).toBeNull();
    });
  });
  
  describe('createShipment', () => {
    it('should create a new shipment', async () => {
      // Mock data and response
      const shipmentData = {
        origin: 'Boston',
        destination: 'Seattle',
        items: [{ name: 'Laptop', quantity: 1 }],
        customer_id: 'cust_123'
      };
      
      const mockCreatedShipment = {
        id: '3',
        ...shipmentData,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      mockDb.query.mockResolvedValueOnce({ rows: [mockCreatedShipment] });
      
      // Call the method
      const result = await shipmentService.createShipment(shipmentData);
      
      // Assertions
      expect(mockDb.query).toHaveBeenCalledWith(
        'INSERT INTO shipments (origin, destination, items, customer_id) VALUES ($1, $2, $3, $4) RETURNING *',
        ['Boston', 'Seattle', JSON.stringify(shipmentData.items), 'cust_123']
      );
      expect(result).toEqual(mockCreatedShipment);
    });
  });
  
  describe('updateShipmentStatus', () => {
    it('should update a shipment status', async () => {
      // Mock data and response
      const mockUpdatedShipment = {
        id: '1',
        origin: 'New York',
        destination: 'Los Angeles',
        status: 'delivered',
        updated_at: new Date().toISOString()
      };
      
      mockDb.query.mockResolvedValueOnce({ rows: [mockUpdatedShipment] });
      
      // Call the method
      const result = await shipmentService.updateShipmentStatus('1', 'delivered');
      
      // Assertions
      expect(mockDb.query).toHaveBeenCalledWith(
        'UPDATE shipments SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        ['delivered', '1']
      );
      expect(result).toEqual(mockUpdatedShipment);
    });
    
    it('should return null if shipment not found', async () => {
      // Mock empty response
      mockDb.query.mockResolvedValueOnce({ rows: [] });
      
      // Call the method
      const result = await shipmentService.updateShipmentStatus('999', 'delivered');
      
      // Assertions
      expect(mockDb.query).toHaveBeenCalledWith(
        'UPDATE shipments SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        ['delivered', '999']
      );
      expect(result).toBeNull();
    });
  });
  
  describe('deleteShipment', () => {
    it('should delete a shipment', async () => {
      // Mock data and response
      const mockDeletedShipment = {
        id: '1',
        origin: 'New York',
        destination: 'Los Angeles',
        status: 'pending'
      };
      
      mockDb.query.mockResolvedValueOnce({ rows: [mockDeletedShipment] });
      
      // Call the method
      const result = await shipmentService.deleteShipment('1');
      
      // Assertions
      expect(mockDb.query).toHaveBeenCalledWith('DELETE FROM shipments WHERE id = $1 RETURNING *', ['1']);
      expect(result).toEqual(mockDeletedShipment);
    });
    
    it('should return null if shipment not found', async () => {
      // Mock empty response
      mockDb.query.mockResolvedValueOnce({ rows: [] });
      
      // Call the method
      const result = await shipmentService.deleteShipment('999');
      
      // Assertions
      expect(mockDb.query).toHaveBeenCalledWith('DELETE FROM shipments WHERE id = $1 RETURNING *', ['999']);
      expect(result).toBeNull();
    });
  });
}); 