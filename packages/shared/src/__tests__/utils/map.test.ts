import { generateShipmentMarkers, calculateRegion, calculateDeliveryTimes, optimizeRoute } from '../../utils/map.ts';
import type { Shipment, TruckDriver, DeliveryStop } from '../../types';

// Mock fetch for Mapbox API calls
global.fetch = jest.fn();

// Use type assertion with unknown to bypass strict type checking
// This is acceptable for tests where we're mocking data
const mockShipments = [
  {
    id: 'ship-1',
    trackingCode: 'TRACK001',
    status: 'pending',
    stops: [
      {
        id: 'stop-1',
        latitude: 37.7749,
        longitude: -122.4194,
        status: 'pending',
        estimatedArrival: new Date('2023-06-01T12:00:00Z'),
        address: '123 Main St, San Francisco, CA'
      },
      {
        id: 'stop-2',
        latitude: 37.3382,
        longitude: -121.8863,
        status: 'pending',
        estimatedArrival: new Date('2023-06-01T14:00:00Z'),
        address: '456 Oak St, San Jose, CA'
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'ship-2',
    trackingCode: 'TRACK002',
    status: 'pending',
    stops: [
      {
        id: 'stop-3',
        latitude: 34.0522,
        longitude: -118.2437,
        status: 'pending',
        estimatedArrival: new Date('2023-06-02T10:00:00Z'),
        address: '789 Pine St, Los Angeles, CA'
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  }
] as unknown as Shipment[];

const mockDrivers = [
  {
    id: 'driver-1',
    name: 'John Doe',
    truckType: 'van', // Using a valid enum value
    status: 'active',
    currentLocation: {
      latitude: 37.7749,
      longitude: -122.4194,
      timestamp: new Date()
    },
    currentShipment: 'TRACK001'
  },
  {
    id: 'driver-2',
    name: 'Jane Smith',
    truckType: 'box_truck', // Using a valid enum value
    status: 'active',
    currentLocation: {
      latitude: 34.0522,
      longitude: -118.2437,
      timestamp: new Date()
    },
    currentShipment: undefined
  }
] as unknown as TruckDriver[];

const mockStops: DeliveryStop[] = [
  {
    id: 'stop-1',
    latitude: 37.7749,
    longitude: -122.4194,
    status: 'pending',
    estimatedArrival: new Date('2023-06-01T12:00:00Z'),
    address: '123 Main St, San Francisco, CA'
  },
  {
    id: 'stop-2',
    latitude: 37.3382,
    longitude: -121.8863,
    status: 'pending',
    estimatedArrival: new Date('2023-06-01T14:00:00Z'),
    address: '456 Oak St, San Jose, CA'
  },
  {
    id: 'stop-3',
    latitude: 34.0522,
    longitude: -118.2437,
    status: 'pending',
    estimatedArrival: new Date('2023-06-02T10:00:00Z'),
    address: '789 Pine St, Los Angeles, CA'
  }
];

const mockDriverLocation = {
  latitude: 37.7749,
  longitude: -122.4194,
  timestamp: new Date()
};

describe('Map Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateShipmentMarkers', () => {
    it('should generate markers for shipments and drivers', () => {
      const markers = generateShipmentMarkers({ shipments: mockShipments, drivers: mockDrivers });
      
      // Should have 3 shipment markers (from stops) + 2 driver markers = 5 total
      expect(markers.length).toBe(5);
      
      // Check shipment markers
      const shipmentMarkers = markers.filter(m => m.markerType === 'shipment');
      expect(shipmentMarkers.length).toBe(3);
      expect(shipmentMarkers[0].id).toContain('TRACK001');
      expect(shipmentMarkers[0].title).toContain('Delivery: TRACK001');
      
      // Check driver markers
      const driverMarkers = markers.filter(m => m.markerType === 'driver');
      expect(driverMarkers.length).toBe(2);
      expect(driverMarkers[0].id).toContain('driver-1');
      expect(driverMarkers[0].title).toBe('John Doe');
      expect(driverMarkers[0].description).toContain('Current Shipment: TRACK001');
      expect(driverMarkers[1].description).toContain('Current Shipment: None');
    });

    it('should handle empty shipments and drivers', () => {
      const markers = generateShipmentMarkers({ shipments: [], drivers: [] });
      expect(markers.length).toBe(0);
    });

    it('should handle drivers without location', () => {
      const driversWithoutLocation = [
        {
          id: 'driver-3',
          name: 'No Location',
          truckType: 'semi', // Using a valid enum value
          status: 'inactive',
          currentShipment: undefined
        }
      ] as unknown as TruckDriver[]; // Using unknown to bypass strict type checking
      
      const markers = generateShipmentMarkers({ 
        shipments: mockShipments, 
        drivers: driversWithoutLocation
      });
      
      // Should only have shipment markers, no driver markers
      expect(markers.length).toBe(3);
      expect(markers.every(m => m.markerType === 'shipment')).toBe(true);
    });
  });

  describe('calculateRegion', () => {
    it('should calculate region that encompasses all markers', () => {
      const markers = [
        { id: '1', latitude: 37.7749, longitude: -122.4194, markerType: 'shipment' as const },
        { id: '2', latitude: 34.0522, longitude: -118.2437, markerType: 'driver' as const }
      ];
      
      const region = calculateRegion(markers);
      
      // Center should be between the two points
      expect(region.latitude).toBeCloseTo((37.7749 + 34.0522) / 2, 4);
      expect(region.longitude).toBeCloseTo((-122.4194 + -118.2437) / 2, 4);
      
      // Delta should be large enough to encompass both points with padding
      expect(region.latitudeDelta).toBeGreaterThan(Math.abs(37.7749 - 34.0522));
      expect(region.longitudeDelta).toBeGreaterThan(Math.abs(-122.4194 - -118.2437));
    });

    it('should return default region when no markers provided', () => {
      const region = calculateRegion([]);
      
      // Default to US center
      expect(region.latitude).toBeCloseTo(39.8283);
      expect(region.longitude).toBeCloseTo(-98.5795);
      expect(region.latitudeDelta).toBeGreaterThan(0);
      expect(region.longitudeDelta).toBeGreaterThan(0);
    });

    it('should handle single marker', () => {
      const markers = [
        { id: '1', latitude: 37.7749, longitude: -122.4194, markerType: 'shipment' as const }
      ];
      
      const region = calculateRegion(markers);
      
      expect(region.latitude).toBeCloseTo(37.7749);
      expect(region.longitude).toBeCloseTo(-122.4194);
      // Should use minimum delta for single point
      expect(region.latitudeDelta).toBeGreaterThan(0);
      expect(region.longitudeDelta).toBeGreaterThan(0);
    });
  });

  describe('calculateDeliveryTimes', () => {
    it('should calculate estimated arrival times for each stop', async () => {
      // Mock Mapbox API response
      (global.fetch as jest.Mock).mockImplementation(() => 
        Promise.resolve({
          json: () => Promise.resolve({
            routes: [{ duration: 1800 }] // 30 minutes in seconds
          })
        })
      );
      
      const result = await calculateDeliveryTimes({
        stops: mockStops.slice(0, 2), // Use first two stops
        driverLocation: mockDriverLocation
      });
      
      expect(result.length).toBe(2);
      expect(result[0].estimatedArrival).toBeInstanceOf(Date);
      expect(result[1].estimatedArrival).toBeInstanceOf(Date);
      
      // First stop should be 30 minutes from now
      const now = Date.now();
      const firstStopTime = result[0].estimatedArrival!.getTime();
      expect(firstStopTime - now).toBeCloseTo(1800 * 1000, -3); // Within 1 second tolerance
      
      // Verify Mapbox API was called correctly
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect((global.fetch as jest.Mock).mock.calls[0][0]).toContain(
        `${mockDriverLocation.longitude},${mockDriverLocation.latitude};${mockStops[0].longitude},${mockStops[0].latitude}`
      );
    });

    it('should handle API errors gracefully', async () => {
      // Mock API failure
      (global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'));
      
      const result = await calculateDeliveryTimes({
        stops: mockStops,
        driverLocation: mockDriverLocation
      });
      
      // Should return original stops unchanged
      expect(result).toEqual(mockStops);
    });
  });

  describe('optimizeRoute', () => {
    it('should optimize route using nearest neighbor algorithm', async () => {
      const result = await optimizeRoute({
        stops: mockStops,
        driverLocation: mockDriverLocation
      });
      
      expect(result.length).toBe(mockStops.length);
      
      // First stop should be closest to driver location
      // In our mock data, the first stop is already at the same location as the driver
      expect(result[0].id).toBe('stop-1');
      
      // The order should be optimized
      const originalIds = mockStops.map(stop => stop.id);
      const optimizedIds = result.map(stop => stop.id);
      
      // The optimized route should contain all the same stops
      expect(optimizedIds.sort()).toEqual(originalIds.sort());
      
      // But potentially in a different order
      // This is hard to test precisely without knowing the exact algorithm implementation
      // So we'll just check that the function runs without errors
    });

    it('should return original stops if only one stop', async () => {
      const singleStop = [mockStops[0]];
      
      const result = await optimizeRoute({
        stops: singleStop,
        driverLocation: mockDriverLocation
      });
      
      expect(result).toEqual(singleStop);
    });

    it('should handle empty stops array', async () => {
      const result = await optimizeRoute({
        stops: [],
        driverLocation: mockDriverLocation
      });
      
      expect(result).toEqual([]);
    });
  });
}); 