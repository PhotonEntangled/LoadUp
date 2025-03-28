'use client';

import React, { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react';
import { StabilizedVehicleTrackingProvider } from '../../../../src/components/StabilizedVehicleTrackingProvider';
import SimulationDemo from '../../../../src/components/SimulationDemo';
import { useMapStore, mapStore } from '../../../../packages/shared/src/store/mapStore';
import { useUnifiedVehicleStore } from '../../../../src/store/useUnifiedVehicleStore';
import { Vehicle as UnifiedVehicle } from '../../../../src/types/vehicle';
import SimulatedVehicleMap from '../../../../src/components/map/SimulatedVehicleMap';
import { VEHICLE_MAP_ID } from '../../../../src/utils/maps/constants';
import { SimulationControlPanel } from '@/components/simulation/SimulationControlPanel';

/**
 * Debug component to show map ID and help diagnose duplicate map issues
 */
const MapIDDebug = () => {
  return (
    <div className="absolute top-0 left-0 bg-yellow-200 text-black text-xs p-1 z-50">
      Map ID: {VEHICLE_MAP_ID}
    </div>
  );
};

/**
 * VehicleStoreSync - Synchronizes vehicles between unifiedVehicleStore and mapStore
 * 
 * This component uses the refs pattern to prevent render cycles and infinite loops.
 * It subscribes to the unifiedVehicleStore directly and only updates mapStore when
 * there are actual changes, with throttling to prevent rapid updates.
 */
const VehicleStoreSync: React.FC = () => {
  // Refs to track initialization state and prevent multiple subscriptions
  const initializingRef = useRef<boolean>(false);
  const initializedRef = useRef<boolean>(false);
  // Refs to store references and prevent re-renders - use the actual store objects
  const unifiedStoreRef = useRef(useUnifiedVehicleStore);
  const mapStoreRef = useRef(mapStore);
  // Ref to track last update time for throttling
  const lastUpdateRef = useRef<number>(0);
  // Ref to track previous vehicles for change detection
  const prevVehiclesRef = useRef<UnifiedVehicle[]>([]);
  
  // DEBUGGING: Add render counter for VehicleStoreSync
  const renderCountRef = useRef(0);
  renderCountRef.current++;
  console.log(`[VehicleStoreSync] Render #${renderCountRef.current}`);
  
  // Use useLayoutEffect to ensure initialization happens before render
  // This pattern has proven successful in StabilizedVehicleTrackingProvider
  useLayoutEffect(() => {
    // Skip if already initializing or initialized
    if (initializedRef.current || initializingRef.current) {
      console.log('[VehicleStoreSync] Already initialized or initializing, skipping');
      return;
    }
    
    // Mark as initializing
    initializingRef.current = true;
    
    try {
      console.log('[VehicleStoreSync] Initializing store sync');
      
      // Function to convert vehicles from unified store to map store format
      const convertVehicles = (unifiedVehicles: UnifiedVehicle[]) => {
        // DEBUGGING: Log the source vehicle count
        console.log(`[VehicleStoreSync] Converting ${unifiedVehicles.length} unified vehicles to map format`);
        
        return unifiedVehicles.map(vehicle => ({
          id: vehicle.id,
          name: vehicle.id,
          type: (vehicle.type || 'truck') as any,
          licensePlate: vehicle.id,
          currentLocation: vehicle.location ? {
            latitude: vehicle.location.latitude,
            longitude: vehicle.location.longitude,
            heading: vehicle.heading || 0,
            timestamp: vehicle.lastUpdated || new Date(),
          } : undefined,
          // Keep the original properties needed for visualization
          isSimulated: vehicle.isSimulated,
          status: vehicle.status,
          // Add any custom properties needed for display
          routeData: (vehicle as any).routeData,
          visuals: (vehicle as any).visuals,
        }));
      };
      
      // Function to check if vehicles array has changed meaningfully
      const hasVehiclesChanged = (newVehicles: UnifiedVehicle[], prevVehicles: UnifiedVehicle[]) => {
        // Quick length check
        if (newVehicles.length !== prevVehicles.length) {
          console.log(`[VehicleStoreSync] Vehicle count changed: ${prevVehicles.length} -> ${newVehicles.length}`);
          return true;
        }
        
        // Check if any IDs are different (faster than deep equality)
        const prevIds = new Set(prevVehicles.map(v => v.id));
        const hasNewVehicle = newVehicles.some(v => !prevIds.has(v.id));
        if (hasNewVehicle) {
          console.log('[VehicleStoreSync] New vehicle IDs detected');
          return true;
        }
        
        // Check for position or status changes in existing vehicles
        let changedVehicles: string[] = [];
        for (const newVehicle of newVehicles) {
          const prevVehicle = prevVehicles.find(v => v.id === newVehicle.id);
          if (!prevVehicle) return true;
          
          // Check if location changed
          if (newVehicle.location && prevVehicle.location) {
            if (
              newVehicle.location.latitude !== prevVehicle.location.latitude ||
              newVehicle.location.longitude !== prevVehicle.location.longitude
            ) {
              changedVehicles.push(newVehicle.id);
              return true;
            }
          } else if (newVehicle.location !== prevVehicle.location) {
            changedVehicles.push(newVehicle.id);
            return true;
          }
          
          // Check if status changed
          if (newVehicle.status !== prevVehicle.status) {
            changedVehicles.push(newVehicle.id);
            return true;
          }
        }
        
        if (changedVehicles.length > 0) {
          console.log(`[VehicleStoreSync] Changed vehicles: ${changedVehicles.join(', ')}`);
          return true;
        }
        
        return false;
      };
      
      // Function to update mapStore with throttling and change detection
      const updateMapStore = () => {
        const now = Date.now();
        // Apply 100ms throttling to prevent too many updates
        if (now - lastUpdateRef.current < 100) {
          // console.log('[VehicleStoreSync] Update throttled');
          return;
        }
        
        // Get vehicles from unified store using the store's getState
        const unifiedVehicles = useUnifiedVehicleStore.getState().getFilteredVehicles();
        
        // Only update if vehicles actually changed
        if (hasVehiclesChanged(unifiedVehicles, prevVehiclesRef.current)) {
          const mapVehicles = convertVehicles(unifiedVehicles);
          
          // Update mapStore using the store directly, not the hook
          console.log(`[VehicleStoreSync] Syncing ${unifiedVehicles.length} vehicles to mapStore`);
          mapStore.setState({ vehicles: mapVehicles });
          
          // Update refs
          prevVehiclesRef.current = [...unifiedVehicles];
          lastUpdateRef.current = now;
        }
      };
      
      // Subscribe to unified store changes directly using the store
      const unsubscribe = useUnifiedVehicleStore.subscribe(updateMapStore);
      
      // Mark as initialized
      initializedRef.current = true;
      initializingRef.current = false;
      
      // Run an initial update
      updateMapStore();
      
      // Return cleanup function
      return () => {
        console.log('[VehicleStoreSync] Cleaning up store sync');
        unsubscribe();
        initializedRef.current = false;
      };
    } catch (error) {
      console.error('[VehicleStoreSync] Error initializing store sync:', error);
      initializingRef.current = false;
    }
    
    // Empty cleanup for failure case
    return () => {};
  }, []); // Empty dependency array - only run once on mount
  
  // This component doesn't render anything
  return null;
};

/**
 * Stabilized Vehicle Tracking Page - Demonstrates the map integration with live tracking
 * Features a single test vehicle with a simple movement simulation
 */
export default function StabilizedVehicleTrackingPage() {
  const [notification, setNotification] = useState<string | null>(null);
  const setInitialized = useMapStore((state) => state.setInitialized);
  const setVehicles = useMapStore((state) => state.setVehicles);
  const fitBounds = useMapStore((state) => state.fitBounds);
  
  // Helper function to focus on a specific location
  const focusOnLocation = useCallback(({ latitude, longitude }: { latitude: number, longitude: number }) => {
    // Use the fitBounds function directly from the useMapStore hook
    if (fitBounds) {
      // Create a small bounding box around the target location
      // Using an offset of ~0.01 degrees which is roughly 1km at the equator
      fitBounds({
        southWest: [longitude - 0.01, latitude - 0.01],
        northEast: [longitude + 0.01, latitude + 0.01],
      });
    }
  }, [fitBounds]);
  
  // Initialize on component mount
  useEffect(() => {
    // Set map as initialized and start with empty vehicles array
    setInitialized(true);
    setVehicles([]);
    
    // Cleanup on unmount
    const unsubscribe = () => {
      // Reset map state
      setInitialized(false);
      setVehicles([]);
    };
    
    return () => {
      unsubscribe();
    };
  }, [setInitialized, setVehicles]);

  // Show notification when zooming to vehicle location
  // This matches the type expected by SimulationDemo component
  const handleZoomToVehicle = useCallback((location: { latitude: number; longitude: number }) => {
    console.log(`Zooming to vehicle at: ${location.latitude}, ${location.longitude}`);
    setNotification(`Zooming to vehicle location`);
    
    // Use our focusOnLocation function instead of setFocus
    focusOnLocation({
      latitude: location.latitude,
      longitude: location.longitude,
    });
    
    // Clear notification after 3 seconds
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  }, [focusOnLocation]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Vehicle Tracking</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor and manage your fleet in real-time
          </p>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-grow container mx-auto px-4 py-6">
        {/* Initialize tracking provider with proper child rendering */}
        <StabilizedVehicleTrackingProvider>
          {/* Use the VehicleStoreSync component first to ensure store syncing */}
          <VehicleStoreSync />
          
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Map container - Ensure we only render ONE map instance */}
            <div className="w-full lg:w-8/12">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 h-[600px] relative">
                {/* EMERGENCY FIX: Temporarily replace SimulatedVehicleMap with SimpleMapWithMarker */}
                <SimulatedVehicleMap />
                <MapIDDebug />
                
                {/* Notification overlay */}
                {notification && (
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-md">
                    {notification}
                  </div>
                )}
              </div>
            </div>
            
            {/* Sidebar - Use only controls, no map rendering */}
            <div className="w-full lg:w-4/12">
              {/* Control panel only - should NOT render another map */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
                <SimulationDemo 
                  onZoomToVehicle={handleZoomToVehicle}
                />
              </div>
            </div>
          </div>
        </StabilizedVehicleTrackingProvider>
      </main>
      
      {/* About this page - Keep for documentation */}
      <section className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-8 mt-8">
        <div className="container mx-auto px-4">
          <h2 className="text-xl font-semibold mb-4">About This Page</h2>
          <div className="prose dark:prose-invert max-w-none">
            <p>
              This stabilized tracking page demonstrates a minimal implementation of the vehicle tracking feature
              with the following characteristics:
            </p>
            <ul>
              <li>Fixed initial location (Kuala Lumpur)</li>
              <li>Simple movement patterns (straight lines from origin to destination)</li>
              <li>Proper cleanup and initialization of tracking services</li>
              <li>Single test vehicle for demonstration purposes</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
} 