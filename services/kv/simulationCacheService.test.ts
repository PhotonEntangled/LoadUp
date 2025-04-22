import { kv } from '@vercel/kv';
import { logger } from '@/utils/logger';
import { getSimulationState, setSimulationState, addActiveSimulation, removeActiveSimulation, getActiveSimulations } from './simulationCacheService';
import { SimulatedVehicle } from '@/types/vehicles';
import {
    Point,
    LineString,
    Feature
} from 'geojson';

// Mock the dependencies
jest.mock('@vercel/kv');
jest.mock('@/utils/logger');

// Type assertion for mocked logger
const mockedLogger = logger as jest.Mocked<typeof logger>;
const mockedKv = kv as jest.Mocked<typeof kv>;

// Helper to create a mock vehicle state
const createMockVehicle = (id: string): SimulatedVehicle => ({
    id: id,
    shipmentId: `SHIP-${id}`,
    vehicleType: 'Truck',
    status: 'Idle',
    originAddressString: 'Origin Address',
    destinationAddressString: 'Destination Address',
    originCoordinates: [0, 0],
    destinationCoordinates: [1, 1],
    currentPosition: { type: 'Feature', geometry: { type: 'Point', coordinates: [0, 0] }, properties: {} } as Feature<Point>,
    route: { type: 'Feature', geometry: { type: 'LineString', coordinates: [[0, 0], [1, 1]] }, properties: {} } as Feature<LineString>,
    routeDistance: 10000,
    traveledDistance: 0,
    lastUpdateTime: Date.now(),
    bearing: 0,
    driverName: 'Mock Driver',
    driverPhone: '123-456-7890',
    truckId: 'TRUCK-001',
    driverIc: 'IC12345',
    recipientName: 'Mock Recipient',
    recipientPhone: '987-654-3210',
    requestedDeliveryDate: new Date().toISOString(),
    associatedPoNumber: 'PO-123',
    remarks: 'Test remarks',
});

describe('simulationCacheService', () => {
    const shipmentId = 'test-shipment-123';
    const mockVehicleState = createMockVehicle(shipmentId);
    const cacheKey = `simulation:state:${shipmentId}`;
    const ACTIVE_SIMULATIONS_KEY = "simulations:active"; // Mirror key from service

    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();
    });

    describe('getSimulationState', () => {
        it('should return the cached state if found and valid', async () => {
            mockedKv.get.mockResolvedValue(mockVehicleState);
            const result = await getSimulationState(shipmentId);
            expect(result).toEqual(mockVehicleState);
            expect(mockedKv.get).toHaveBeenCalledWith(cacheKey);
            expect(mockedLogger.debug).toHaveBeenCalledWith(`KV: Attempting to get state for key: ${cacheKey}`);
            expect(mockedLogger.debug).toHaveBeenCalledWith(`KV: Successfully retrieved state for key: ${cacheKey}`);
        });

        it('should return null if state is not found in cache', async () => {
            mockedKv.get.mockResolvedValue(null);
            const result = await getSimulationState(shipmentId);
            expect(result).toBeNull();
            expect(mockedKv.get).toHaveBeenCalledWith(cacheKey);
            expect(mockedLogger.debug).toHaveBeenCalledWith(`KV: No state found for key: ${cacheKey}`);
        });

        it('should return null and log error if retrieved state is invalid (not object)', async () => {
            mockedKv.get.mockResolvedValue(123 as any); // Invalid state
            const result = await getSimulationState(shipmentId);
            expect(result).toBeNull();
            expect(mockedKv.get).toHaveBeenCalledWith(cacheKey);
            expect(mockedLogger.error).toHaveBeenCalledWith(
                `KV: Retrieved invalid state data for key: ${cacheKey}`,
                { stateData: 123 }
            );
        });

         it('should return null and log error if retrieved state is invalid (missing id)', async () => {
            const invalidState = { ...mockVehicleState };
            delete (invalidState as any).id;
            mockedKv.get.mockResolvedValue(invalidState as any); // Invalid state
            const result = await getSimulationState(shipmentId);
            expect(result).toBeNull();
            expect(mockedKv.get).toHaveBeenCalledWith(cacheKey);
            expect(mockedLogger.error).toHaveBeenCalledWith(
                `KV: Retrieved invalid state data for key: ${cacheKey}`,
                { stateData: invalidState }
            );
        });

        it('should return null and log error if kv.get throws an error', async () => {
            const testError = new Error('KV Get Failed');
            mockedKv.get.mockRejectedValue(testError);
            const result = await getSimulationState(shipmentId);
            expect(result).toBeNull();
            expect(mockedKv.get).toHaveBeenCalledWith(cacheKey);
            expect(mockedLogger.error).toHaveBeenCalledWith(
                `KV: Error getting simulation state for key ${cacheKey}`,
                { error: testError }
            );
        });
    });

    describe('setSimulationState', () => {
        it('should return true if kv.set returns "OK"', async () => {
            mockedKv.set.mockResolvedValue('OK');
            const result = await setSimulationState(shipmentId, mockVehicleState);
            expect(result).toBe(true);
            expect(mockedKv.set).toHaveBeenCalledWith(cacheKey, mockVehicleState);
            expect(mockedLogger.debug).toHaveBeenCalledWith(
                `KV: Attempting to set state for key: ${cacheKey}`,
                { stateData: mockVehicleState }
            );
            expect(mockedLogger.debug).toHaveBeenCalledWith(`KV: Successfully set state for key: ${cacheKey}`);
        });

        it('should return false and log warning if kv.set does not return "OK"', async () => {
            mockedKv.set.mockResolvedValue(null); // Simulate not OK
            const result = await setSimulationState(shipmentId, mockVehicleState);
            expect(result).toBe(false);
            expect(mockedKv.set).toHaveBeenCalledWith(cacheKey, mockVehicleState);
            expect(mockedLogger.warn).toHaveBeenCalledWith(
                `KV: Set operation did not return OK for key: ${cacheKey}`,
                { result: null }
            );
        });

        it('should return false and log error if kv.set throws an error', async () => {
            const testError = new Error('KV Set Failed');
            mockedKv.set.mockRejectedValue(testError);
            const result = await setSimulationState(shipmentId, mockVehicleState);
            expect(result).toBe(false);
            expect(mockedKv.set).toHaveBeenCalledWith(cacheKey, mockVehicleState);
            expect(mockedLogger.error).toHaveBeenCalledWith(
                `KV: Error setting simulation state for key ${cacheKey}`,
                { error: testError }
            );
        });
    });

    describe('addActiveSimulation', () => {
        it('should add the shipment ID to the active set and return true', async () => {
            mockedKv.sadd.mockResolvedValue(1); // Simulate adding a new member
            const result = await addActiveSimulation(shipmentId);
            expect(result).toBe(true);
            expect(mockedKv.sadd).toHaveBeenCalledWith(ACTIVE_SIMULATIONS_KEY, shipmentId);
            expect(mockedLogger.debug).toHaveBeenCalledWith(`KV: Adding active simulation ID: ${shipmentId}`);
            expect(mockedLogger.debug).toHaveBeenCalledWith(`KV: sadd result for ${shipmentId}: 1`);
        });

        it('should return true even if the ID is already in the set', async () => {
            mockedKv.sadd.mockResolvedValue(0); // Simulate adding an existing member
            const result = await addActiveSimulation(shipmentId);
            expect(result).toBe(true);
            expect(mockedKv.sadd).toHaveBeenCalledWith(ACTIVE_SIMULATIONS_KEY, shipmentId);
        });

        it('should return false and log error if kv.sadd throws an error', async () => {
            const testError = new Error('KV Sadd Failed');
            mockedKv.sadd.mockRejectedValue(testError);
            const result = await addActiveSimulation(shipmentId);
            expect(result).toBe(false);
            expect(mockedKv.sadd).toHaveBeenCalledWith(ACTIVE_SIMULATIONS_KEY, shipmentId);
            expect(mockedLogger.error).toHaveBeenCalledWith(
                `KV: Error adding active simulation ID ${shipmentId}`,
                { error: testError }
            );
        });
    });

    describe('removeActiveSimulation', () => {
        it('should remove the shipment ID from the active set and return true', async () => {
            mockedKv.srem.mockResolvedValue(1); // Simulate removing an existing member
            const result = await removeActiveSimulation(shipmentId);
            expect(result).toBe(true);
            expect(mockedKv.srem).toHaveBeenCalledWith(ACTIVE_SIMULATIONS_KEY, shipmentId);
            expect(mockedLogger.debug).toHaveBeenCalledWith(`KV: Removing active simulation ID: ${shipmentId}`);
             expect(mockedLogger.debug).toHaveBeenCalledWith(`KV: srem result for ${shipmentId}: 1`);
        });

        it('should return true even if the ID was not in the set', async () => {
            mockedKv.srem.mockResolvedValue(0); // Simulate removing a non-existent member
            const result = await removeActiveSimulation(shipmentId);
            expect(result).toBe(true);
            expect(mockedKv.srem).toHaveBeenCalledWith(ACTIVE_SIMULATIONS_KEY, shipmentId);
        });

        it('should return false and log error if kv.srem throws an error', async () => {
            const testError = new Error('KV Srem Failed');
            mockedKv.srem.mockRejectedValue(testError);
            const result = await removeActiveSimulation(shipmentId);
            expect(result).toBe(false);
            expect(mockedKv.srem).toHaveBeenCalledWith(ACTIVE_SIMULATIONS_KEY, shipmentId);
            expect(mockedLogger.error).toHaveBeenCalledWith(
                `KV: Error removing active simulation ID ${shipmentId}`,
                { error: testError }
            );
        });
    });

    describe('getActiveSimulations', () => {
        it('should return an array of active simulation IDs', async () => {
            const mockIds = ['sim1', 'sim2', 'sim3'];
            mockedKv.smembers.mockResolvedValue(mockIds);
            const result = await getActiveSimulations();
            expect(result).toEqual(mockIds);
            expect(mockedKv.smembers).toHaveBeenCalledWith(ACTIVE_SIMULATIONS_KEY);
            expect(mockedLogger.debug).toHaveBeenCalledWith(`KV: Getting all active simulation IDs from key: ${ACTIVE_SIMULATIONS_KEY}`);
            expect(mockedLogger.debug).toHaveBeenCalledWith(`KV: Found ${mockIds.length} active simulation IDs.`);
        });

        it('should return an empty array if no active simulations are found', async () => {
            mockedKv.smembers.mockResolvedValue([]);
            const result = await getActiveSimulations();
            expect(result).toEqual([]);
            expect(mockedKv.smembers).toHaveBeenCalledWith(ACTIVE_SIMULATIONS_KEY);
        });

        it('should return an empty array and log error if kv.smembers throws an error', async () => {
            const testError = new Error('KV Smembers Failed');
            mockedKv.smembers.mockRejectedValue(testError);
            const result = await getActiveSimulations();
            expect(result).toEqual([]);
            expect(mockedKv.smembers).toHaveBeenCalledWith(ACTIVE_SIMULATIONS_KEY);
            expect(mockedLogger.error).toHaveBeenCalledWith(
                `KV: Error getting active simulation IDs`,
                { error: testError }
            );
        });
    });
}); 