/**
 * Custom hook for displaying simulated vehicles on the map
 * Handles vehicle marker properties and route lines
 */

import { useMemo } from 'react';
import { SimulatedVehicle } from '../types/vehicle';

export interface VehicleDisplayData {
  id: string;
  latitude: number;
  longitude: number;
  markerType: 'vehicle' | 'simulated-vehicle';
  status: string;
  title: string;
  description: string;
  styleOptions: {
    color: string;
    size: number;
    pulseEffect: boolean;
    emoji?: string;
    fontSize?: number;
  };
  routeData?: {
    id: string;
    type: string;
    coordinates: [number, number][];
    color: string;
    width: number;
  };
}

/**
 * Transforms simulated vehicles into display-ready format with visualizations
 * @param vehicles Array of simulated vehicles
 * @returns Array of vehicle display data objects
 */
export function useSimulatedVehicleDisplay(vehicles: SimulatedVehicle[]): VehicleDisplayData[] {
  return useMemo(() => {
    return vehicles.map(vehicle => {
      // Extract visual enhancement properties if available
      const visuals = (vehicle as any).visuals || {};
      
      // Determine emoji based on vehicle type
      let emoji = '🚚'; // Default to truck
      if (vehicle.type.includes('motorcycle')) emoji = '🏍️';
      else if (vehicle.type.includes('car')) emoji = '🚗';
      else if (vehicle.type.includes('van')) emoji = '🚐';
      
      // Create the display data object
      const displayData: VehicleDisplayData = {
        id: vehicle.id,
        latitude: vehicle.location.latitude,
        longitude: vehicle.location.longitude,
        markerType: 'simulated-vehicle',
        status: vehicle.status,
        title: `${vehicle.id} (${vehicle.type})`,
        description: `Speed: ${vehicle.speed} km/h | Status: ${vehicle.status}`,
        styleOptions: {
          color: visuals.color || '#00BFFF', // Neon blue default
          size: visuals.size || 50,
          pulseEffect: vehicle.status === 'moving',
          emoji: visuals.emoji || emoji,
          fontSize: visuals.fontSize || 24
        }
      };
      
      // Add route data if available in the vehicle
      if ((vehicle as any).routeData) {
        displayData.routeData = (vehicle as any).routeData;
      } 
      // Construct route from stops if available
      else if (vehicle.route && vehicle.route.stops && vehicle.route.stops.length >= 2) {
        const start = vehicle.route.stops[0].location;
        const end = vehicle.route.stops[vehicle.route.stops.length - 1].location;
        
        displayData.routeData = {
          id: `route-${vehicle.id}`,
          type: 'LineString',
          coordinates: [
            [start.longitude, start.latitude],
            [end.longitude, end.latitude]
          ],
          color: visuals.routeLineColor || '#0088FF',
          width: 3
        };
      }
      
      return displayData;
    });
  }, [vehicles]);
}

export default useSimulatedVehicleDisplay; 