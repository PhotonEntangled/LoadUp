import { VehicleTrackingService } from './VehicleTrackingService';
import { db } from '@/lib/database/drizzle';
import { logger } from '@/utils/logger';
import * as schema from '@/lib/database/schema';
import { eq } from 'drizzle-orm';

// Mock the dependencies
jest.mock('@/lib/database/drizzle', () => ({
  db: {
    update: jest.fn().mockReturnThis(), // Chainable mock
    set: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    returning: jest.fn(), // This is the final call in the chain
  },
}));

jest.mock('@/utils/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock the eq function if necessary, though usually not needed for basic testing
// jest.mock('drizzle-orm', () => ({
//   ...jest.requireActual('drizzle-orm'), // Keep other exports
//   eq: jest.fn((col, val) => ({ column: col, value: val })), // Simple mock for verification
// }));


describe('VehicleTrackingService', () => {
  let service: VehicleTrackingService;
  let mockDbUpdate: jest.Mock;
  let mockDbSet: jest.Mock;
  let mockDbWhere: jest.Mock;
  let mockDbReturning: jest.Mock;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    service = new VehicleTrackingService();

    // Assign mocks for easier access in tests
    // Need to cast db methods because the initial mock setup doesn't capture the specific chain
    mockDbUpdate = db.update as jest.Mock;
    // We need to mock the chained methods on the *return value* of the previous mock
    const mockSetReturn = { where: jest.fn().mockReturnThis() };
    const mockWhereReturn = { returning: jest.fn() }; 
    mockDbSet = jest.fn(() => mockSetReturn) as jest.Mock;
    mockDbWhere = mockSetReturn.where as jest.Mock;
    mockDbReturning = mockWhereReturn.returning as jest.Mock; // Final call
    
    // Re-configure the chain mock
    mockDbUpdate.mockImplementation(() => ({
        set: mockDbSet.mockImplementation(() => ({
            where: mockDbWhere.mockImplementation(() => ({
                returning: mockDbReturning
            }))
        }))
    }));

  });

  describe('updateShipmentLastKnownLocation', () => {
    const validParams = {
      shipmentId: 'test-shipment-id',
      latitude: 12.345678,
      longitude: -98.765432,
      timestamp: new Date(),
    };

    it('should return true and log info on successful update', async () => {
      // Arrange
      mockDbReturning.mockResolvedValue([{ updatedId: validParams.shipmentId }]); // Simulate successful update returning the ID

      // Act
      const result = await service.updateShipmentLastKnownLocation(validParams);

      // Assert
      expect(result).toBe(true);
      expect(mockDbUpdate).toHaveBeenCalledWith(schema.shipmentsErd);
      expect(mockDbSet).toHaveBeenCalledWith({
        lastKnownLatitude: String(validParams.latitude),
        lastKnownLongitude: String(validParams.longitude),
        lastKnownTimestamp: validParams.timestamp,
      });
      // We can check the argument passed to eq implicitly via the mockDbWhere args if eq itself is not mocked
      expect(mockDbWhere).toHaveBeenCalledWith(eq(schema.shipmentsErd.id, validParams.shipmentId));
      expect(mockDbReturning).toHaveBeenCalledWith({ updatedId: schema.shipmentsErd.id });
      expect(logger.info).toHaveBeenCalledWith(
        `[updateShipmentLastKnownLocation] Successfully updated location for shipment ID: ${validParams.shipmentId}`
      );
      expect(logger.warn).not.toHaveBeenCalled();
      expect(logger.error).not.toHaveBeenCalled();
    });

    it('should return false and log warning if shipment ID is missing', async () => {
      // Act
      const result = await service.updateShipmentLastKnownLocation({ ...validParams, shipmentId: '' });

      // Assert
      expect(result).toBe(false);
      expect(logger.warn).toHaveBeenCalledWith(
        `[updateShipmentLastKnownLocation] Invalid parameters received for shipment . Aborting update.`
      );
      expect(mockDbUpdate).not.toHaveBeenCalled();
      expect(logger.info).not.toHaveBeenCalled();
      expect(logger.error).not.toHaveBeenCalled();
    });
    
    it('should return false and log warning if latitude is null', async () => {
        // Act
        const result = await service.updateShipmentLastKnownLocation({ ...validParams, latitude: null as any}); // Use any to bypass TS check for test
  
        // Assert
        expect(result).toBe(false);
        expect(logger.warn).toHaveBeenCalledWith(
          `[updateShipmentLastKnownLocation] Invalid parameters received for shipment ${validParams.shipmentId}. Aborting update.`
        );
        expect(mockDbUpdate).not.toHaveBeenCalled();
      });

      it('should return false and log warning if longitude is null', async () => {
        // Act
        const result = await service.updateShipmentLastKnownLocation({ ...validParams, longitude: null as any });
  
        // Assert
        expect(result).toBe(false);
        expect(logger.warn).toHaveBeenCalledWith(
          `[updateShipmentLastKnownLocation] Invalid parameters received for shipment ${validParams.shipmentId}. Aborting update.`
        );
        expect(mockDbUpdate).not.toHaveBeenCalled();
      });

      it('should return false and log warning if timestamp is null', async () => {
        // Act
        const result = await service.updateShipmentLastKnownLocation({ ...validParams, timestamp: null as any });
  
        // Assert
        expect(result).toBe(false);
        expect(logger.warn).toHaveBeenCalledWith(
          `[updateShipmentLastKnownLocation] Invalid parameters received for shipment ${validParams.shipmentId}. Aborting update.`
        );
        expect(mockDbUpdate).not.toHaveBeenCalled();
      });

    it('should return false and log warning if no rows are affected', async () => {
      // Arrange
      mockDbReturning.mockResolvedValue([]); // Simulate no rows updated

      // Act
      const result = await service.updateShipmentLastKnownLocation(validParams);

      // Assert
      expect(result).toBe(false);
      expect(mockDbUpdate).toHaveBeenCalledTimes(1); // Ensure DB call was attempted
      expect(logger.warn).toHaveBeenCalledWith(
        `[updateShipmentLastKnownLocation] Update attempted for shipment ID: ${validParams.shipmentId}, but no rows were affected. Shipment might not exist.`
      );
      expect(logger.info).not.toHaveBeenCalled();
      expect(logger.error).not.toHaveBeenCalled();
    });

    it('should return false and log error if database update throws an error', async () => {
      // Arrange
      const dbError = new Error('Database connection lost');
      mockDbReturning.mockRejectedValue(dbError); // Simulate DB error

      // Act
      const result = await service.updateShipmentLastKnownLocation(validParams);

      // Assert
      expect(result).toBe(false);
      expect(mockDbUpdate).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith(
        `[updateShipmentLastKnownLocation] Error updating location for shipment ID ${validParams.shipmentId}: ${dbError.message}`,
        { error: dbError }
      );
      expect(logger.info).not.toHaveBeenCalled();
      expect(logger.warn).not.toHaveBeenCalled();
    });
  });
}); 