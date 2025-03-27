import { RealVehicle, VehicleStatus } from '../types/vehicle';

/**
 * Interface defining the shape of vehicle data coming from Firebase
 */
export interface FirebaseVehicleData {
  id?: string;
  device_id?: string;
  lat?: number;
  lng?: number;
  latitude?: number;
  longitude?: number;
  heading?: number;
  bearing?: number; // Alternative name for heading
  speed?: number;
  velocity?: number; // Alternative name for speed
  status?: string;
  timestamp?: string | number;
  signal_strength?: number;
  // Any other fields that might come from Firebase
}

/**
 * Adapter class that transforms Firebase data to our unified vehicle format
 */
export class FirebaseVehicleAdapter {
  /**
   * Transform a single Firebase vehicle data object to our unified Vehicle format
   * @param rawData The raw Firebase data
   * @param id Optional ID override
   * @returns A RealVehicle object
   */
  transformToUnifiedFormat(rawData: FirebaseVehicleData, id?: string): RealVehicle {
    return {
      id: id || rawData.id || rawData.device_id || 'unknown',
      type: '16-wheeler', // Default type for real vehicles
      location: {
        latitude: rawData.latitude || rawData.lat || 0,
        longitude: rawData.longitude || rawData.lng || 0,
      },
      heading: rawData.heading || rawData.bearing || 0,
      speed: rawData.speed || rawData.velocity || 0,
      status: this.mapStatus(rawData.status),
      lastUpdated: rawData.timestamp ? new Date(rawData.timestamp) : new Date(),
      isSimulated: false,
      deviceId: rawData.device_id,
      signalStrength: rawData.signal_strength,
      lastContactTime: rawData.timestamp ? new Date(rawData.timestamp) : new Date()
    };
  }
  
  /**
   * Transform a batch of Firebase vehicles to our unified format
   * @param rawDataBatch Record of vehicle IDs to raw Firebase data
   * @returns Record of vehicle IDs to RealVehicle objects
   */
  transformBatchToUnifiedFormat(
    rawDataBatch: Record<string, FirebaseVehicleData>
  ): Record<string, RealVehicle> {
    const result: Record<string, RealVehicle> = {};
    
    for (const [id, data] of Object.entries(rawDataBatch)) {
      result[id] = this.transformToUnifiedFormat(data, id);
    }
    
    return result;
  }
  
  /**
   * Map Firebase status values to our VehicleStatus type
   * @param status Raw status string from Firebase
   * @returns Normalized VehicleStatus value
   */
  private mapStatus(status?: string): VehicleStatus {
    if (!status) return 'idle';
    
    switch(status.toLowerCase()) {
      case 'driving':
      case 'moving':
      case 'in_transit':
      case 'in transit':
        return 'moving';
      case 'loading':
      case 'load':
        return 'loading';
      case 'unloading':
      case 'unload':
      case 'delivery':
        return 'unloading';
      case 'maintenance':
      case 'repair':
      case 'service':
        return 'maintenance';
      case 'stopped':
      case 'idle':
      case 'parked':
      default:
        return 'idle';
    }
  }
} 