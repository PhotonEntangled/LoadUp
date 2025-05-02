import { LiveTrackingService } from './LiveTrackingService';
import { LiveVehicleUpdate } from '@/types/tracking';
import { logger } from '@/utils/logger';

/**
 * Mock implementation of the LiveTrackingService interface
 * Used for development, testing, or when Firebase isn't available
 */
class MockLiveTrackingService implements LiveTrackingService {
  private mockIntervalIds: Map<string, NodeJS.Timeout> = new Map();
  
  // Starting position - can be customized per shipment
  private initialPosition = {
    latitude: 3.139,
    longitude: 101.6869,
    heading: 45, // degrees
    speed: 15, // m/s
    timestamp: Date.now()
  };
  
  subscribeToVehicleLocation(
    shipmentId: string,
    onUpdate: (update: LiveVehicleUpdate) => void,
    onError: (error: Error) => void
  ): () => void {
    if (!shipmentId) {
      const error = new Error('MockLiveTrackingService: shipmentId is required');
      onError(error);
      return () => {};
    }
    
    logger.info(`[MOCK] Subscribing to live location for shipment: ${shipmentId}`);
    
    // Create initial update
    const initialUpdate: LiveVehicleUpdate = {
      shipmentId,
      ...this.initialPosition,
      accuracy: 10, // meters
      altitude: 50, // meters
      altitudeAccuracy: 5, // meters
      provider: 'mock',
    };
    
    // Send initial update
    setTimeout(() => {
      onUpdate(initialUpdate);
    }, 500);
    
    // Set up interval to simulate movement
    const intervalId = setInterval(() => {
      // Generate a small random movement
      const lastUpdate = { ...initialUpdate };
      
      // Update position (move approx 0.001 degree in random direction)
      lastUpdate.latitude += (Math.random() * 0.002 - 0.001);
      lastUpdate.longitude += (Math.random() * 0.002 - 0.001);
      
      // Update heading (small random change)
      lastUpdate.heading = (lastUpdate.heading + (Math.random() * 20 - 10)) % 360;
      if (lastUpdate.heading < 0) lastUpdate.heading += 360;
      
      // Update speed (random variation)
      lastUpdate.speed = Math.max(0, lastUpdate.speed + (Math.random() * 4 - 2));
      
      // Update timestamp
      lastUpdate.timestamp = Date.now();
      
      // Send update
      onUpdate(lastUpdate);
      
      // Save for next iteration
      Object.assign(initialUpdate, lastUpdate);
      
    }, 3000); // Update every 3 seconds
    
    // Store interval ID
    this.mockIntervalIds.set(shipmentId, intervalId);
    
    logger.info(`[MOCK] Subscription established for shipment: ${shipmentId}`);
    
    // Return unsubscribe function
    return () => {
      logger.info(`[MOCK] Unsubscribing from shipment: ${shipmentId}`);
      const intervalId = this.mockIntervalIds.get(shipmentId);
      if (intervalId) {
        clearInterval(intervalId);
        this.mockIntervalIds.delete(shipmentId);
      }
    };
  }
}

// Export singleton instance
export const mockLiveTrackingService = new MockLiveTrackingService(); 