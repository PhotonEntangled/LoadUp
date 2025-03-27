import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { Vehicle } from '../types/vehicle';
import { mapManager } from '../utils/maps/MapManager';

interface UseMapMarkersOptions {
  mapId?: string;
  vehicles: Vehicle[];
  selectedVehicleId?: string | null;
  batchSize?: number;
  updateInterval?: number;
}

interface UseMapMarkersResult {
  isMapReady: boolean;
  map: mapboxgl.Map | null;
  selectedVehicle: Vehicle | null;
  visibleVehicles: Vehicle[];
  selectVehicle: (vehicleId: string | null) => void;
  focusOnVehicle: (vehicle: Vehicle) => void;
  focusOnAllVehicles: () => void;
}

/**
 * useMapMarkers - Custom hook for efficient marker management
 * 
 * This hook batches marker updates and manages map initialization
 * to prevent render loops and improve performance.
 */
function useMapMarkers({
  mapId,
  vehicles,
  selectedVehicleId = null,
  batchSize = 10,
  updateInterval = 100,
}: UseMapMarkersOptions): UseMapMarkersResult {
  // Map state
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [isMapReady, setIsMapReady] = useState<boolean>(false);
  
  // Vehicle state
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [visibleVehicles, setVisibleVehicles] = useState<Vehicle[]>([]);
  
  // Refs for efficient updating
  const vehiclesRef = useRef<Vehicle[]>([]);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const batchIndexRef = useRef<number>(0);
  
  // Set up map initialization
  useEffect(() => {
    // Check if map is already ready
    if (mapManager.isMapReady(mapId)) {
      const readyMap = mapManager.getMap(mapId);
      setMap(readyMap);
      setIsMapReady(true);
      console.log('[useMapMarkers] Map already ready');
      return () => {};
    }
    
    // Wait for map to be ready
    console.log('[useMapMarkers] Waiting for map to be ready');
    const unsubscribe = mapManager.waitForMap((readyMap) => {
      console.log('[useMapMarkers] Map is now ready');
      setMap(readyMap);
      setIsMapReady(true);
    }, mapId);
    
    // Cleanup
    return () => {
      unsubscribe();
      
      // Clear any pending updates
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [mapId]);
  
  // Update selected vehicle when selectedVehicleId changes
  useEffect(() => {
    if (selectedVehicleId) {
      const vehicle = vehicles.find(v => v.id === selectedVehicleId) || null;
      setSelectedVehicle(vehicle);
    } else {
      setSelectedVehicle(null);
    }
  }, [selectedVehicleId, vehicles]);
  
  // Process vehicles in batches for better performance
  useEffect(() => {
    // Update ref to current vehicles
    vehiclesRef.current = vehicles;
    
    // Start batch processing if map is ready
    if (isMapReady && map && vehicles.length > 0) {
      // Reset batch index
      batchIndexRef.current = 0;
      
      // Start processing batches
      processBatch();
    }
    
    // Batch processor function
    function processBatch() {
      // Clear any existing timeouts
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      
      const allVehicles = vehiclesRef.current;
      const startIndex = batchIndexRef.current;
      const endIndex = Math.min(startIndex + batchSize, allVehicles.length);
      
      // Process this batch
      const batch = allVehicles.slice(startIndex, endIndex);
      
      // Update visible vehicles with new batch
      setVisibleVehicles(prevVisible => {
        // Remove vehicles that are no longer in the full list
        const remainingVehicles = prevVisible.filter(v => 
          allVehicles.some(av => av.id === v.id)
        );
        
        // Add new batch vehicles if they're not already visible
        const newVehicles = batch.filter(v => 
          !remainingVehicles.some(rv => rv.id === v.id)
        );
        
        return [...remainingVehicles, ...newVehicles];
      });
      
      // Schedule next batch if needed
      if (endIndex < allVehicles.length) {
        batchIndexRef.current = endIndex;
        updateTimeoutRef.current = setTimeout(processBatch, updateInterval);
      }
    }
    
    // Cleanup
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [vehicles, isMapReady, map, batchSize, updateInterval]);
  
  // Select a vehicle by ID
  const selectVehicle = useCallback((vehicleId: string | null) => {
    if (vehicleId) {
      const vehicle = vehiclesRef.current.find(v => v.id === vehicleId) || null;
      setSelectedVehicle(vehicle);
    } else {
      setSelectedVehicle(null);
    }
  }, []);
  
  // Focus map on a specific vehicle
  const focusOnVehicle = useCallback((vehicle: Vehicle) => {
    if (!map || !vehicle.location) return;
    
    const { latitude, longitude } = vehicle.location;
    
    // Use fitBounds for better cross-browser support
    map.fitBounds(
      [
        [longitude - 0.01, latitude - 0.01],
        [longitude + 0.01, latitude + 0.01]
      ],
      {
        padding: 50,
        maxZoom: 16
      }
    );
  }, [map]);
  
  // Focus map on all vehicles
  const focusOnAllVehicles = useCallback(() => {
    if (!map || vehiclesRef.current.length === 0) return;
    
    // Get all valid locations
    const validLocations = vehiclesRef.current
      .filter(v => v.location)
      .map(v => [v.location!.longitude, v.location!.latitude] as [number, number]);
    
    if (validLocations.length === 0) return;
    
    // Calculate bounds
    const longitudes = validLocations.map(loc => loc[0]);
    const latitudes = validLocations.map(loc => loc[1]);
    
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);
    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    
    // Add padding
    const lngPadding = (maxLng - minLng) * 0.1;
    const latPadding = (maxLat - minLat) * 0.1;
    
    // Fit bounds with padding
    map.fitBounds(
      [
        [minLng - lngPadding, minLat - latPadding],
        [maxLng + lngPadding, maxLat + latPadding]
      ],
      {
        padding: 50
      }
    );
  }, [map]);
  
  // Return the hook results
  return {
    isMapReady,
    map,
    selectedVehicle,
    visibleVehicles,
    selectVehicle,
    focusOnVehicle,
    focusOnAllVehicles,
  };
}

export default useMapMarkers; 