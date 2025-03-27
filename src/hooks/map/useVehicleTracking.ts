import { useEffect, useRef, useState, useCallback } from 'react';
import { useLocationStore, LocationUpdate } from '../../store/map/useLocationStore';
import { useVehicleStore, Vehicle } from '../../store/map/useVehicleStore';
import { createCoordinateAtDistance, calculateBearing } from '../../utils/map/coordinateUtils';
import { Coordinate } from '../../utils/map/boundingBox';

// Simulation options
export interface SimulationOptions {
  runInBackground?: boolean;
  updateInterval?: number;
  randomMovement?: boolean;
  simulatedSpeed?: number;
  simulationBounds?: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  };
}

interface TrackingOptions {
  useSimulation?: boolean;
  simulationOptions?: SimulationOptions;
  wsEndpoint?: string;
  pollingInterval?: number;
  reconnectDelay?: number;
}

// Default options
const DEFAULT_SIMULATION_OPTIONS: SimulationOptions = {
  runInBackground: true,
  updateInterval: 2000,
  randomMovement: true,
  simulatedSpeed: 40, // km/h
  simulationBounds: {
    minLat: 37.73,
    maxLat: 37.80,
    minLng: -122.51,
    maxLng: -122.40
  }
};

/**
 * Hook for tracking vehicle locations
 * 
 * This provides:
 * 1. Real-time location tracking via websockets or polling
 * 2. Vehicle location simulation when real data not available
 * 3. Connection status and error handling
 */
export const useVehicleTracking = (options: TrackingOptions = {}) => {
  // Options with defaults
  const {
    useSimulation = false,
    simulationOptions = DEFAULT_SIMULATION_OPTIONS,
    wsEndpoint = '/api/tracking/ws',
    pollingInterval = 5000,
    reconnectDelay = 3000
  } = options;
  
  // State
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use a ref to track simulation state internally to avoid re-renders
  const isSimulationActiveRef = useRef(useSimulation);
  // Only expose the state for reading, not for causing re-renders
  const [isSimulationActive, setIsSimulationActive] = useState(useSimulation);
  
  // Refs
  const wsRef = useRef<WebSocket | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const vehiclesRef = useRef<Vehicle[]>([]);
  const optionsRef = useRef(simulationOptions);
  
  // Store state and actions
  const vehicles = useVehicleStore(state => state.vehicles);
  const updateVehicleLocations = useLocationStore(state => state.updateVehicleLocations);
  const setSimulationActive = useLocationStore(state => state.setSimulationActive);
  
  // Update refs when dependencies change
  useEffect(() => {
    vehiclesRef.current = vehicles;
  }, [vehicles]);
  
  useEffect(() => {
    optionsRef.current = simulationOptions;
  }, [simulationOptions]);
  
  // Start simulation without recreating on every render
  // useCallback is used properly with minimal dependencies
  const startSimulation = useCallback(() => {
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }
    
    // Set simulation active state (both internal ref and external state)
    isSimulationActiveRef.current = true;
    setIsSimulationActive(true);
    setSimulationActive(true);
    
    const {
      updateInterval = 2000,
      randomMovement = true,
      simulatedSpeed = 40,
      simulationBounds = DEFAULT_SIMULATION_OPTIONS.simulationBounds!
    } = optionsRef.current;
    
    // Create initial positions if needed
    const initializeSimulation = () => {
      // Generate some random positions within bounds
      const updates: LocationUpdate[] = vehiclesRef.current.map(vehicle => {
        // Random position within bounds
        const latitude = simulationBounds.minLat + Math.random() * (simulationBounds.maxLat - simulationBounds.minLat);
        const longitude = simulationBounds.minLng + Math.random() * (simulationBounds.maxLng - simulationBounds.minLng);
        
        // Random heading (0-360 degrees)
        const heading = Math.floor(Math.random() * 360);
        
        // Random speed variation around the base speed
        const speed = simulatedSpeed * (0.5 + Math.random());
        
        return {
          vehicleId: vehicle.id,
          latitude,
          longitude,
          heading,
          speed,
          timestamp: Date.now(),
          accuracy: 10
        };
      });
      
      // Update all vehicles
      updateVehicleLocations(updates);
    };
    
    // Move vehicles in random or directed pattern
    const updateSimulation = () => {
      const currentVehicles = vehiclesRef.current;
      if (!currentVehicles.length) return;
      
      // Get current locations from store - no hook call here
      const locationStoreState = useLocationStore.getState();
      
      // Get updates for all vehicles
      const updates: LocationUpdate[] = [];
      
      currentVehicles.forEach(vehicle => {
        // Use existing location or create new
        const existingLocation = locationStoreState.vehicleLocations[vehicle.id];
        
        if (!existingLocation) return;
        
        let { latitude, longitude, heading, speed } = existingLocation;
        
        // Update heading if random movement
        if (randomMovement) {
          // Small random change (-15 to +15 degrees)
          const headingChange = (Math.random() - 0.5) * 30;
          heading = (heading + headingChange + 360) % 360;
        }
        
        // Update speed with small random variation
        speed = simulatedSpeed * (0.8 + Math.random() * 0.4);
        
        // Calculate new position based on heading and speed
        // Speed is km/h, we need km per update interval
        const kmPerInterval = speed * (updateInterval / 3600000);
        
        // Use utility to calculate new position
        const [newLng, newLat] = createCoordinateAtDistance(
          [longitude, latitude],
          kmPerInterval,
          heading
        );
        
        // Add to updates
        updates.push({
          vehicleId: vehicle.id,
          latitude: newLat,
          longitude: newLng,
          heading,
          speed,
          timestamp: Date.now(),
          accuracy: 10
        });
      });
      
      // Update all vehicles
      updateVehicleLocations(updates);
    };
    
    // Initialize if needed
    const locationStoreState = useLocationStore.getState();
    if (Object.keys(locationStoreState.vehicleLocations).length === 0) {
      initializeSimulation();
    }
    
    // Start update loop
    simulationIntervalRef.current = setInterval(updateSimulation, updateInterval);
  }, [updateVehicleLocations, setSimulationActive]);
  
  // Stop simulation without recreating function on every render
  const stopSimulation = useCallback(() => {
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }
    
    // Update ref first, then external state
    isSimulationActiveRef.current = false;
    setIsSimulationActive(false);
    setSimulationActive(false);
  }, [setSimulationActive]);
  
  // Connect to real tracking endpoint
  const connectRealTracking = useCallback(() => {
    // Cleanup existing connections
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    
    // Define startPolling function before it's used
    const startPolling = () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      
      // Function to fetch updates
      const fetchUpdates = async () => {
        try {
          const response = await fetch('/api/tracking/poll');
          if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
          }
          
          const data = await response.json();
          if (Array.isArray(data.updates)) {
            updateVehicleLocations(data.updates);
            setIsConnected(true);
            setError(null);
          }
        } catch (err) {
          console.error('Error polling for updates:', err);
          setIsConnected(false);
          setError(`Polling error: ${err}`);
        }
      };
      
      // Initial fetch
      fetchUpdates();
      
      // Set up interval
      pollingIntervalRef.current = setInterval(fetchUpdates, pollingInterval);
    };
    
    // Try websocket first
    try {
      const ws = new WebSocket(wsEndpoint);
      
      ws.onopen = () => {
        setIsConnected(true);
        setError(null);
        console.log('Connected to tracking websocket');
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'location_updates' && Array.isArray(data.updates)) {
            updateVehicleLocations(data.updates);
          }
        } catch (err) {
          console.error('Error parsing websocket message:', err);
        }
      };
      
      ws.onerror = (event) => {
        console.error('Websocket error:', event);
        setError('WebSocket connection error');
        ws.close();
      };
      
      ws.onclose = () => {
        setIsConnected(false);
        setError('WebSocket connection closed');
        
        // Try to reconnect after delay
        setTimeout(() => {
          if (wsRef.current === ws) {
            // Fall back to polling if websocket fails
            startPolling();
          }
        }, reconnectDelay);
      };
      
      wsRef.current = ws;
    } catch (err) {
      console.error('Error connecting to websocket:', err);
      setError(`WebSocket connection failed: ${err}`);
      
      // Fall back to polling
      startPolling();
    }
  }, [wsEndpoint, pollingInterval, reconnectDelay, updateVehicleLocations]);
  
  // Cleanup real tracking
  const stopRealTracking = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    
    setIsConnected(false);
  }, []);
  
  // Set up tracking based on options
  useEffect(() => {
    // Cleanup previous mode
    stopSimulation();
    stopRealTracking();
    
    // Start new mode
    if (useSimulation) {
      startSimulation();
    } else {
      connectRealTracking();
    }
    
    // Clean up on unmount
    return () => {
      stopSimulation();
      stopRealTracking();
    };
  }, [useSimulation, startSimulation, stopSimulation, connectRealTracking, stopRealTracking]);
  
  // Return final values
  return {
    isConnected: isSimulationActiveRef.current ? true : isConnected,
    error: isSimulationActiveRef.current ? null : error,
    isSimulationActive
  };
};

export default useVehicleTracking; 