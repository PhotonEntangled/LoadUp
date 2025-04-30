import { describe, it, expect, beforeEach, vi } from 'vitest';
// Use relative paths to bypass alias resolution issues for this file
import { getSimulationInputForShipment } from '../../../lib/actions/simulationActions';
// Corrected schema imports (keep actual imports needed by helpers)
import * as schema from '../../../lib/database/schema';
import type { SimulationInput } from '../../../types/simulation';
import type { ApiShipmentDetail, ApiAddressDetail, ApiContact } from '../../../types/api';
// Import DB schema types for mocking Drizzle results
import type { InferSelectModel } from 'drizzle-orm';

// --- Mock Dependencies ---

// Mock the MapDirectionsService module
const mockFetchRouteGeometry = vi.fn();
vi.mock("../../../services/map/MapDirectionsService", () => ({
  MapDirectionsService: vi.fn().mockImplementation(() => ({
    fetchRouteGeometry: mockFetchRouteGeometry,
  })),
}));

// Global mock for the final execute call - Needed by the spy implementation
const mockExecute = vi.fn();

// Use vi.mock with an initial empty/inert factory for Drizzle
// This prevents the real module code (and DATABASE_URL check) from running too early
vi.mock("../../../lib/database/drizzle", () => ({
  db: {
    // Provide inert functions matching the expected chain structure
    // These will be overridden by vi.spyOn in beforeEach
    select: vi.fn(() => ({ 
        from: vi.fn(() => ({ 
            where: vi.fn(() => ({ 
                limit: vi.fn(() => ({ 
                    execute: vi.fn(), // Inert execute
                    orderBy: vi.fn().mockReturnThis() 
                })) 
            })), 
            leftJoin: vi.fn(() => ({ 
                where: vi.fn(() => ({ 
                    limit: vi.fn(() => ({ 
                        execute: vi.fn(), // Inert execute
                        orderBy: vi.fn().mockReturnThis() 
                    })) 
                })) 
            })) 
        })) 
    })),
    // Mock other parts of 'db' if needed by the action or other imports
    query: {
      shipmentsErd: {
        findFirst: vi.fn(),
      },
      // Add other tables if needed (pickups, dropoffs, etc.)
      // Example:
      // pickups: { findFirst: vi.fn() },
      // dropoffs: { findFirst: vi.fn() }, 
      // addresses: { findFirst: vi.fn() },
      // trips: { findFirst: vi.fn() },
      // customShipmentDetails: { findFirst: vi.fn() },
    },
  },
}));

// Logger mock
vi.mock("../../../utils/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

// --- Mock Data Helpers ---
// Re-import logger here AFTER mocking it, if helpers use it
import { logger } from '../../../utils/logger'; 

const createMockApiAddress = (overrides: Partial<ApiAddressDetail> = {}): ApiAddressDetail => ({
    id: `addr-${Math.random().toString(36).substring(7)}`,
    rawInput: null,
    name: null,
    street: null,
    city: null,
    stateProvince: null,
    postalCode: null,
    country: null,
    fullAddress: null,
    latitude: null,
    longitude: null,
    resolutionMethod: null,
    resolutionConfidence: null,
    resolvedTimestamp: null,
    ...overrides,
});

const createMockApiContact = (overrides: Partial<ApiContact> = {}): ApiContact => ({
    id: `contact-${Math.random().toString(36).substring(7)}`,
    contactName: null,
    contactNumber: null,
    contactEmail: null, // Ensure email is present
    ...overrides,
});

type MockShipmentsErdRecord = Omit<InferSelectModel<typeof schema.shipmentsErd>, 'lastKnownLatitude' | 'lastKnownLongitude'> & {
    lastKnownLatitude: string | null; // Drizzle returns decimals as strings
    lastKnownLongitude: string | null;
};
const createMockShipmentsErdRecord = (overrides: Partial<MockShipmentsErdRecord> = {}): MockShipmentsErdRecord => ({
    id: "test-shipment-id",
    bookingId: "test-booking-id",
    sourceDocumentId: "test-doc-id",
    status: "AT_PICKUP",
    shipmentDateCreated: new Date(),
    shipmentDateModified: new Date(),
    isActive: true,
    shipmentDescription: "Test Shipment Description",
    shipmentDocumentNumber: "DOC123",
    modifiedBy: null,
    tripId: "test-trip-id", // Link to trip for subsequent mock
    pickupId: "test-pickup-id", // Link for subsequent mock
    dropoffId: "test-dropoff-id", // Link for subsequent mock
    lastKnownLatitude: null,
    lastKnownLongitude: null,
    lastKnownTimestamp: null,
    ...overrides,
});

type MockPickupJoinResult = {
    pickups: InferSelectModel<typeof schema.pickups>;
    addresses: InferSelectModel<typeof schema.addresses> | null; 
};
const createMockPickupResult = (shipmentId: string, overrides: Partial<MockPickupJoinResult> = {}): MockPickupJoinResult => ({
    pickups: {
        id: "test-pickup-id",
        pickupConfigId: null,
        dateCreated: new Date(),
        dateModified: new Date(),
        addressId: "origin-addr-id",
        cargoStatusId: null,
        pickup_position: 1,
        pickup_date: new Date('2024-01-01T08:00:00Z'),
        shipmentWeight: "100.50", // Drizzle returns decimal as string
        shipmentVolume: null,
        quantityOfItems: 10,
        totalPalettes: 1,
        activityStatus: 'SCHEDULED',
        itemUnitId: null,
        actualDateTimeOfArrival: null,
        actualDateTimeOfDeparture: null,
        estimatedDateTimeOfArrival: null,
        estimatedDateTimeOfDeparture: null,
        createdBy: null,
        modifiedBy: null,
        shipmentId: shipmentId,
        ...(overrides.pickups ?? {}),
    },
    addresses: {
        id: "origin-addr-id",
        street1: "100 Origin St",
        street2: null,
        city: "Origintown",
        state: "OR",
        postalCode: "10001",
        country: "USA",
        latitude: "40.712800", // Drizzle returns decimal as string
        longitude: "-74.006000", // Drizzle returns decimal as string
        rawInput: "100 Origin St, Origintown, OR 10001",
        resolutionMethod: 'geocode',
        resolutionConfidence: "0.9", // Drizzle returns decimal as string
        createdAt: new Date(),
        updatedAt: new Date(),
        ...(overrides.addresses ?? {}),
    },
});

type MockDropoffJoinResult = {
    dropoffs: InferSelectModel<typeof schema.dropoffs>;
    addresses: InferSelectModel<typeof schema.addresses> | null;
};
const createMockDropoffResult = (shipmentId: string, overrides: Partial<MockDropoffJoinResult> = {}): MockDropoffJoinResult => ({
    dropoffs: {
        id: "test-dropoff-id",
        dropoffConfigId: null,
        dateCreated: new Date(),
        dateModified: new Date(),
        addressId: "dest-addr-id",
        cargoStatusId: null,
        dropoff_position: 1,
        shipmentWeight: null,
        shipmentVolume: null,
        quantityOfItems: null,
        totalPalettes: null,
        activityStatus: 'SCHEDULED',
        customerDeliveryNumber: null,
        itemUnitId: null,
        mapToPickUpPosition: null,
        actualDateTimeOfArrival: null,
        actualDateTimeOfDeparture: null,
        dropoff_date: new Date('2024-01-02T17:00:00Z'),
        estimatedDateTimeOfArrival: null,
        estimatedDateTimeOfDeparture: null,
        customerPoNumbers: "PO789",
        recipientContactName: "Destination Contact",
        recipientContactPhone: "444-555-6666",
        createdBy: null,
        modifiedBy: null,
        shipmentId: shipmentId,
         ...(overrides.dropoffs ?? {}),
    },
    addresses: {
        id: "dest-addr-id",
        street1: "200 Destination Ave",
        street2: null,
        city: "Destville",
        state: "DV",
        postalCode: "20002",
        country: "USA",
        latitude: "34.052200", // Drizzle returns decimal as string
        longitude: "-118.243700", // Drizzle returns decimal as string
        rawInput: "200 Destination Ave, Destville, DV 20002",
        resolutionMethod: 'geocode',
        resolutionConfidence: "0.9", // Drizzle returns decimal as string
        createdAt: new Date(),
        updatedAt: new Date(),
        ...(overrides.addresses ?? {}),
    },
});

const createMockTripResult = (tripId: string, overrides: Partial<InferSelectModel<typeof schema.trips>> = {}): InferSelectModel<typeof schema.trips> => ({
    id: tripId,
    dateCreated: new Date(),
    dateModified: new Date(),
    tripConfigId: null,
    material: null,
    materialType: null,
    materialTransporter: null,
    sealed: false,
    tripStatus: 'PLANNED',
    truckId: "test-vehicle-id",
    driverId: "test-driver-id",
    driverName: "Test Driver",
    driverPhone: "777-888-9999",
    driverIcNumber: "IC99",
    truckPlate: "TRUCK001",
    resourceTrackIds: null,
    remarks: "Trip remarks",
    totalInsured: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
});

const createMockCustomDetailsResult = (shipmentId: string, overrides: Partial<InferSelectModel<typeof schema.customShipmentDetails>> = {}): InferSelectModel<typeof schema.customShipmentDetails> => ({
    id: "custom-details-id",
    customBookingDetailsId: null,
    shipmentId: shipmentId,
    customerDocumentNumber: "CUSTDOC1",
    customerShipmentNumber: "CUSTSHIP1",
    sovyJobNo: null,
    totalTransporterRate: null,
    totalTransporterManPowerRate: null,
    totalTransporterDropPointRate: null,
    totalTransporterStagingRate: null,
    totalTransporterPhRate: null,
    totalTransporterWaitingRate: null,
    totalShipperStagingRate: null,
    totalShipperPhRate: null,
    totalShipperManPowerRate: null,
    totalShipperWaitingRate: null,
    totalShipperRate: null,
    totalTransporterAdditionalRate: null,
    stackable: false,
    hazardousId: null,
    manpower: null,
    specialRequirement: null,
    masterTransporterId: null,
    cargoValueId: null,
    podStatus: null,
    remarks: "Custom shipment remarks",
    totalShipperAdditionalRate: null,
    totalShipperDropPointRate: null,
    tripId: "test-trip-id",
    earlyInboundDate: null,
    lateInboundDate: null,
    earlyOutboundDate: null,
    lateOutboundDate: null,
    totalTransportCost: null,
    totalTransportDistance: null,
    totalTransportDuration: null,
    totalTransportSegments: null,
    totalTransportWeight: null,
    totalTransportVolume: null,
    totalHazardous: false,
    profitability: null,
    totalInsight: null,
    totalHazardousAddOnProfile: null,
    totalInsight2: null,
    tripRate: null,
    dropCharge: null,
    manpowerCharge: null,
    totalCharge: null,
    miscTripRate: null,
    miscDrop: null,
    miscManpower: null,
    miscTotal: null,
    carrierName: null,
    carrierPhone: null,
    truckId: null,
    rawTripRateInput: null,
    rawDropChargeInput: null,
    rawManpowerChargeInput: null,
    rawTotalChargeInput: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
});

const mockRouteGeometry = {
  type: "LineString" as const,
  coordinates: [
    [-74.0060, 40.7128],
    [-118.2437, 34.0522],
  ],
};

// --- Test Suite ---
describe("lib/actions/simulationActions", () => {

  beforeEach(async () => {
    // Clear mocks defined with vi.fn() or vi.spyOn()
    vi.clearAllMocks(); 
    // Reset the state of the globally defined mock execute function
    mockExecute.mockReset();
    // Also clear the specific mock function from the Map service mock
    mockFetchRouteGeometry.mockClear(); 

    // --- Manual Drizzle Mock Implementation Setup ---
    // Dynamically import the *already mocked* drizzle module
    const drizzle = await import("../../../lib/database/drizzle");

    // Define the actual mock chain structure we want `db.select` to return
    // This uses the globally defined `mockExecute` for the final step
    const mockLimitChain = { execute: mockExecute, orderBy: vi.fn().mockReturnThis() };
    const mockWhereChain = { limit: vi.fn(() => mockLimitChain) };
    const mockLeftJoinChain = { where: vi.fn(() => mockWhereChain) };
    const mockFromChain = {
      where: vi.fn(() => mockWhereChain),
      leftJoin: vi.fn(() => mockLeftJoinChain)
    };
    const mockSelectChain = { from: vi.fn(() => mockFromChain) };

    // Use vi.spyOn on the inert `db.select` from the top-level mock
    // Replace its implementation with one that returns our actual mock chain
    vi.spyOn(drizzle.db, 'select').mockImplementation(() => mockSelectChain as any);
    // --- End Manual Mock Setup ---
  });

  describe("getSimulationInputForShipment", () => {

    it("should return valid SimulationInput on happy path", async () => {
      const shipmentId = "test-shipment-id";
      const tripId = "test-trip-id";
      const mockCoreShipment = createMockShipmentsErdRecord({ id: shipmentId, tripId: tripId });
      const mockPickupData = createMockPickupResult(shipmentId);
      const mockDropoffData = createMockDropoffResult(shipmentId);
      const mockCustomDetails = createMockCustomDetailsResult(shipmentId, { tripId: tripId });
      const mockTripData = createMockTripResult(tripId);

      // Configure the single global mockExecute
      mockExecute
        .mockResolvedValueOnce([mockCoreShipment])   // Call 1
        .mockResolvedValueOnce([mockPickupData])     // Call 2
        .mockResolvedValueOnce([mockDropoffData])    // Call 3
        .mockResolvedValueOnce([mockCustomDetails])  // Call 4
        .mockResolvedValueOnce([mockTripData]);      // Call 5

      mockFetchRouteGeometry.mockResolvedValue(mockRouteGeometry);
      const result = await getSimulationInputForShipment(shipmentId);

      expect(result).not.toHaveProperty("error");
      if ("error" in result) throw new Error(`Test failed: ${result.error}`);
      const simInput = result as SimulationInput;
      // Assertions based on the mocked data
      expect(simInput.shipmentId).toBe(shipmentId);
      expect(simInput.originCoordinates).toEqual([-74.006000, 40.712800]);
      expect(simInput.destinationCoordinates).toEqual([-118.243700, 34.052200]);
      expect(simInput.routeGeometry).toEqual(mockRouteGeometry);
      expect(simInput.requestedDeliveryDate).toEqual(mockDropoffData.dropoffs.dropoff_date);
      expect(simInput.driverName).toBe(mockTripData.driverName);
      expect(simInput.driverPhone).toBe(mockTripData.driverPhone);
      expect(simInput.truckId).toBe(mockTripData.truckPlate);
      expect(simInput.driverIc).toBe(mockTripData.driverIcNumber);
      expect(simInput.customerPoNumber).toBe(mockDropoffData.dropoffs.customerPoNumbers);
      expect(simInput.remarks).toBe(mockCustomDetails.remarks);
      expect(simInput.recipientName).toBe(mockDropoffData.dropoffs.recipientContactName);
      expect(simInput.recipientPhone).toBe(mockDropoffData.dropoffs.recipientContactPhone);
      expect(simInput.originAddressString).toBe(mockPickupData.addresses?.rawInput);
      expect(simInput.destinationAddressString).toBe(mockDropoffData.addresses?.rawInput);

      expect(mockExecute).toHaveBeenCalledTimes(5);
      expect(mockFetchRouteGeometry).toHaveBeenCalledTimes(1);
    });

    it("should return error if database query fails (for core shipment)", async () => {
        const shipmentId = "test-shipment-id";
        const dbError = new Error("Database connection refused");
        mockExecute.mockRejectedValueOnce(dbError); // Configure global mock
        const result = await getSimulationInputForShipment(shipmentId);
        
        expect(result).toHaveProperty("error");
        expect((result as { error: string }).error).toContain("Database error fetching shipment");
        // Check logger was called (needs logger import after mock definition)
        const { logger: mockedLogger } = await import('../../../utils/logger'); 
        expect(mockedLogger.error).toHaveBeenCalledWith(expect.stringContaining("Database error fetching shipment"), dbError);
        expect(mockExecute).toHaveBeenCalledTimes(1);
        expect(mockFetchRouteGeometry).not.toHaveBeenCalled();
    });

    it("should return error if shipment not found", async () => {
        const shipmentId = "not-found-id";
        mockExecute.mockResolvedValueOnce([]); // Configure global mock
        const result = await getSimulationInputForShipment(shipmentId);

        expect(result).toHaveProperty("error");
        expect((result as { error: string }).error).toBe("Shipment not found");
        const { logger: mockedLogger } = await import('../../../utils/logger'); 
        expect(mockedLogger.warn).toHaveBeenCalledWith(expect.stringContaining("Shipment not found"), shipmentId);
        expect(mockExecute).toHaveBeenCalledTimes(1);
        expect(mockFetchRouteGeometry).not.toHaveBeenCalled();
    });

    it("should return error if origin coordinates are missing (pickup address missing)", async () => {
        const shipmentId = "test-shipment-id";
        const tripId = "test-trip-id";
        const mockCoreShipment = createMockShipmentsErdRecord({ id: shipmentId, tripId: tripId });
        const mockPickupDataNoAddr = { ...createMockPickupResult(shipmentId), addresses: null };
        mockExecute
            .mockResolvedValueOnce([mockCoreShipment])   // Call 1: Core OK
            .mockResolvedValueOnce([mockPickupDataNoAddr]); // Call 2: Pickup fails
        const result = await getSimulationInputForShipment(shipmentId);

        expect(result).toHaveProperty("error");
        expect((result as { error: string }).error).toContain("Missing origin address or coordinates");
        expect(mockExecute).toHaveBeenCalledTimes(2);
        expect(mockFetchRouteGeometry).not.toHaveBeenCalled();
    });

    it("should return error if origin coordinates are missing (lat/lon null)", async () => {
        const shipmentId = "test-shipment-id";
        const tripId = "test-trip-id";
        const mockCoreShipment = createMockShipmentsErdRecord({ id: shipmentId, tripId: tripId });
        const mockPickupDataNullCoords = createMockPickupResult(shipmentId);
        if (mockPickupDataNullCoords.addresses) {
            mockPickupDataNullCoords.addresses.latitude = null;
            mockPickupDataNullCoords.addresses.longitude = null;
        }
        mockExecute
            .mockResolvedValueOnce([mockCoreShipment])       // Call 1: Core OK
            .mockResolvedValueOnce([mockPickupDataNullCoords]); // Call 2: Pickup fails
        const result = await getSimulationInputForShipment(shipmentId);

        expect(result).toHaveProperty("error");
        expect((result as { error: string }).error).toContain("Missing origin coordinates");
        expect(mockExecute).toHaveBeenCalledTimes(2);
        expect(mockFetchRouteGeometry).not.toHaveBeenCalled();
    });

    it("should return error if destination coordinates are missing (dropoff address missing)", async () => {
        const shipmentId = "test-shipment-id";
        const tripId = "test-trip-id";
        const mockCoreShipment = createMockShipmentsErdRecord({ id: shipmentId, tripId: tripId });
        const mockPickupData = createMockPickupResult(shipmentId);
        const mockDropoffDataNoAddr = { ...createMockDropoffResult(shipmentId), addresses: null };
        mockExecute
            .mockResolvedValueOnce([mockCoreShipment])    // Call 1: Core OK
            .mockResolvedValueOnce([mockPickupData])     // Call 2: Pickup OK
            .mockResolvedValueOnce([mockDropoffDataNoAddr]); // Call 3: Dropoff fails
        const result = await getSimulationInputForShipment(shipmentId);

        expect(result).toHaveProperty("error");
        expect((result as { error: string }).error).toContain("Missing destination address or coordinates");
        expect(mockExecute).toHaveBeenCalledTimes(3);
        expect(mockFetchRouteGeometry).not.toHaveBeenCalled();
    });

     it("should return error if destination coordinates are missing (lat/lon null)", async () => {
        const shipmentId = "test-shipment-id";
        const tripId = "test-trip-id";
        const mockCoreShipment = createMockShipmentsErdRecord({ id: shipmentId, tripId: tripId });
        const mockPickupData = createMockPickupResult(shipmentId);
        const mockDropoffDataNullCoords = createMockDropoffResult(shipmentId);
         if (mockDropoffDataNullCoords.addresses) {
            mockDropoffDataNullCoords.addresses.latitude = null;
            mockDropoffDataNullCoords.addresses.longitude = null;
        }
        mockExecute
            .mockResolvedValueOnce([mockCoreShipment])        // Call 1: Core OK
            .mockResolvedValueOnce([mockPickupData])         // Call 2: Pickup OK
            .mockResolvedValueOnce([mockDropoffDataNullCoords]); // Call 3: Dropoff fails
        const result = await getSimulationInputForShipment(shipmentId);

        expect(result).toHaveProperty("error");
        expect((result as { error: string }).error).toContain("Missing destination coordinates");
        expect(mockExecute).toHaveBeenCalledTimes(3);
        expect(mockFetchRouteGeometry).not.toHaveBeenCalled();
    });

    it("should return error if route fetching fails", async () => {
        const shipmentId = "test-shipment-id";
        const tripId = "test-trip-id";
        const mockCoreShipment = createMockShipmentsErdRecord({ id: shipmentId, tripId: tripId });
        const mockPickupData = createMockPickupResult(shipmentId);
        const mockDropoffData = createMockDropoffResult(shipmentId);
        const mockCustomDetails = createMockCustomDetailsResult(shipmentId, { tripId: tripId });
        const mockTripData = createMockTripResult(tripId);
        mockExecute
            .mockResolvedValueOnce([mockCoreShipment])
            .mockResolvedValueOnce([mockPickupData])
            .mockResolvedValueOnce([mockDropoffData])
            .mockResolvedValueOnce([mockCustomDetails])
            .mockResolvedValueOnce([mockTripData]);
        const routeError = new Error("Mapbox API error");
        mockFetchRouteGeometry.mockRejectedValue(routeError); // Mock route fetch fail
        const result = await getSimulationInputForShipment(shipmentId);

        expect(result).toHaveProperty("error");
        expect((result as { error: string }).error).toContain("Failed to fetch route geometry");
        const { logger: mockedLogger } = await import('../../../utils/logger'); 
        expect(mockedLogger.error).toHaveBeenCalledWith(expect.stringContaining("Failed to fetch route geometry"), routeError);
        expect(mockExecute).toHaveBeenCalledTimes(5);
        expect(mockFetchRouteGeometry).toHaveBeenCalledTimes(1);
    });

    it("should return null/undefined for optional fields if they are missing in DB data", async () => {
        const shipmentId = "test-shipment-id-missing-optional";
        const tripId = "test-trip-id-missing-optional";
        // --- Setup mock data with nulls ---
        const mockCoreShipment = createMockShipmentsErdRecord({
            id: shipmentId, tripId: tripId, status: 'AT_PICKUP', shipmentDescription: null, shipmentDocumentNumber: null,
        });
        const mockPickupData = createMockPickupResult(shipmentId);
        if (mockPickupData.addresses) {
            mockPickupData.pickups.shipmentWeight = null; mockPickupData.pickups.quantityOfItems = null;
            mockPickupData.addresses.street1 = null; mockPickupData.addresses.city = null; mockPickupData.addresses.state = null; mockPickupData.addresses.postalCode = null; mockPickupData.addresses.country = null; mockPickupData.addresses.resolutionMethod = null; mockPickupData.addresses.resolutionConfidence = null;
            mockPickupData.addresses.id = "origin-addr-minimal"; mockPickupData.addresses.latitude = "40.712800"; mockPickupData.addresses.longitude = "-74.006000"; mockPickupData.addresses.rawInput = "Origin";
        }
        const mockDropoffData = createMockDropoffResult(shipmentId);
        if (mockDropoffData.addresses) {
            mockDropoffData.dropoffs.dropoff_date = null; mockDropoffData.dropoffs.customerPoNumbers = null; mockDropoffData.dropoffs.recipientContactName = null; mockDropoffData.dropoffs.recipientContactPhone = null;
            mockDropoffData.addresses.street1 = null; mockDropoffData.addresses.city = null; mockDropoffData.addresses.state = null; mockDropoffData.addresses.postalCode = null; mockDropoffData.addresses.country = null; mockDropoffData.addresses.resolutionMethod = null; mockDropoffData.addresses.resolutionConfidence = null;
            mockDropoffData.addresses.id = "dest-addr-minimal"; mockDropoffData.addresses.latitude = "34.052200"; mockDropoffData.addresses.longitude = "-118.243700"; mockDropoffData.addresses.rawInput = "Destination";
        }
        const mockCustomDetails = createMockCustomDetailsResult(shipmentId, { tripId: tripId, remarks: null });
        const mockTripData = createMockTripResult(tripId, { driverName: null, driverPhone: null, truckPlate: null, driverIcNumber: null });
        // --- End setup mock data ---

        // Configure global mockExecute sequence
        mockExecute
            .mockResolvedValueOnce([mockCoreShipment])
            .mockResolvedValueOnce([mockPickupData])
            .mockResolvedValueOnce([mockDropoffData])
            .mockResolvedValueOnce([mockCustomDetails])
            .mockResolvedValueOnce([mockTripData]);

        mockFetchRouteGeometry.mockResolvedValue(mockRouteGeometry);
        const result = await getSimulationInputForShipment(shipmentId);

        expect(result).not.toHaveProperty("error");
        if ("error" in result) throw new Error(`Test failed: ${result.error}`);
        const simInput = result as SimulationInput;
        // Assertions for null/undefined fields
        expect(simInput.requestedDeliveryDate).toBeNull();
        expect(simInput.driverName).toBeNull();
        expect(simInput.driverPhone).toBeNull();
        expect(simInput.truckId).toBeNull();
        expect(simInput.driverIc).toBeNull();
        expect(simInput.recipientName).toBeNull();
        expect(simInput.recipientPhone).toBeNull();
        expect(simInput.customerPoNumber).toBeNull();
        expect(simInput.remarks).toBeNull();
        // Assert required fields are still present
        expect(simInput.shipmentId).toBe(shipmentId);
        expect(simInput.originCoordinates).toEqual([-74.006000, 40.712800]);
        expect(simInput.destinationCoordinates).toEqual([-118.243700, 34.052200]);
        expect(simInput.routeGeometry).toEqual(mockRouteGeometry);

        expect(mockExecute).toHaveBeenCalledTimes(5);
        expect(mockFetchRouteGeometry).toHaveBeenCalledTimes(1);
    });

  });
});