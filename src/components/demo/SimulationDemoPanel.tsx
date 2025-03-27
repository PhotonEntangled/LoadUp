/**
 * SimulationDemoPanel.tsx
 * Demo panel for testing vehicle simulation functionality
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import MockVehicleSeeder from '../../services/mock/MockVehicleSeeder';
import { createAndAnimateVehicle } from '../../services/shipment/SimulationFromShipmentService';
// Remove the import for SimulatedVehicleMap since we're not rendering it here anymore
// import SimulatedVehicleMap from '../map/SimulatedVehicleMap';

// Import the mock shipment data
const mockShipment = {
  orderId: "LOA123456",
  poNumber: "HWSH053412",
  shipDate: "2025-01-07",
  originPO: "Kuala Lumpur General Post Office",
  destination: "HOME CREATIVE LAB SDN. BHD., JOHOR",
  destinationState: "JOHOR",
  contact: "MR YAP 60167705522 / SD CHIN TAK 60192017664",
  remarks: "NEED UNLOADING SERVICE, CALL PIC 1 HOUR BEFORE DELIVERY",
  weight: 29000,
  status: "loading",
  vehicleType: "16-wheeler",
  capacity: {
    maxWeight: 36000000,
    currentWeight: 29000
  },
  isSimulated: true,
  route: {
    start: {
      name: "Kuala Lumpur General Post Office",
      latitude: 3.1493,
      longitude: 101.6953
    },
    end: {
      name: "Johor Dropoff Location",
      latitude: 1.4927,
      longitude: 103.7414
    }
  }
};

// Styles for the demo panel
const styles = {
  panel: {
    position: 'absolute' as const,
    top: '20px',
    left: '20px',
    zIndex: 1000,
    backgroundColor: 'white',
    padding: '15px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
    width: '250px',
    color: '#333',
  },
  heading: {
    margin: '0 0 15px 0',
    fontSize: '16px',
    fontWeight: 'bold' as const,
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
  },
  button: {
    padding: '8px 12px',
    backgroundColor: '#4a80f5',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: '14px',
  },
  dangerButton: {
    backgroundColor: '#f54a4a',
  },
  simulateButton: {
    backgroundColor: '#FF9800',
  },
  infoDisplay: {
    margin: '15px 0',
    padding: '10px',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
    fontSize: '14px',
  },
  sliderContainer: {
    margin: '15px 0',
  },
  sliderLabel: {
    display: 'block',
    marginBottom: '5px',
    fontSize: '14px',
  },
  footer: {
    marginTop: '15px',
    fontSize: '12px',
    color: '#666',
  },
  debugInfo: {
    margin: '15px 0',
    padding: '10px',
    backgroundColor: '#fff9db',
    borderRadius: '4px',
    fontSize: '11px',
    color: '#775500',
    border: '1px solid #ffe066',
    maxHeight: '100px',
    overflowY: 'auto' as const,
  }
};

/**
 * SimulationDemoPanel Component
 * 
 * A panel with controls for testing vehicle simulation:
 * - Seed vehicles button
 * - Start/stop animation
 * - Animation speed control
 * - Simulate shipment upload
 */
const SimulationDemoPanel: React.FC = () => {
  console.log('[SimulationDemoPanel] Rendering component');
  
  // Track render count for debugging
  const renderCountRef = useRef(0);
  renderCountRef.current++;
  
  // Ref to track mounted state
  const isMountedRef = useRef(true);
  
  // Use refs for state that shouldn't trigger re-renders
  const isAnimatingRef = useRef(false);
  const vehicleCountRef = useRef(0);
  const speedFactorRef = useRef(1);
  
  // State that should trigger UI updates
  const [displayState, setDisplayState] = useState({
    isAnimating: false,
    vehicleCount: 0,
    speedFactor: 1,
    shipmentCount: 0,
  });
  
  // Debug log state
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  
  // Function to add debug logs without triggering renders
  const addDebugLog = useCallback((message: string) => {
    console.log(message);
    setDebugLogs(prev => {
      const newLogs = [...prev, `${new Date().toLocaleTimeString()}: ${message}`];
      // Keep only the last 10 logs
      return newLogs.slice(-10);
    });
  }, []);
  
  // Function to stop animation
  const stopAnimation = useCallback(() => {
    addDebugLog('Stopping animation');
    MockVehicleSeeder.stopAutoUpdate();
    
    // Update refs
    isAnimatingRef.current = false;
    
    // Only update display state if component is still mounted
    if (isMountedRef.current) {
      setDisplayState(prev => ({
        ...prev,
        isAnimating: false
      }));
    }
  }, [addDebugLog]);
  
  // Seed a specific number of vehicles
  const handleSeedVehicles = useCallback((count: number) => {
    addDebugLog(`Seeding ${count} vehicles`);
    
    // Use requestAnimationFrame to ensure this happens outside the render cycle
    window.requestAnimationFrame(() => {
      const vehicles = MockVehicleSeeder.seed(count);
      
      // Update refs
      vehicleCountRef.current = vehicles.length;
      
      // Only update display state if component is still mounted
      if (isMountedRef.current) {
        setDisplayState(prev => ({
          ...prev,
          vehicleCount: vehicles.length
        }));
      }
    });
  }, [addDebugLog]);

  // Clear all vehicles
  const handleClearVehicles = useCallback(() => {
    addDebugLog('Clearing all vehicles');
    
    // Stop animation if running
    if (isAnimatingRef.current) {
      stopAnimation();
    }
    
    // Use requestAnimationFrame to ensure this happens outside the render cycle
    window.requestAnimationFrame(() => {
      MockVehicleSeeder.seed(0, true);
      
      // Update refs
      vehicleCountRef.current = 0;
      
      // Only update display state if component is still mounted
      if (isMountedRef.current) {
        setDisplayState(prev => ({
          ...prev,
          vehicleCount: 0,
          shipmentCount: 0
        }));
      }
    });
  }, [addDebugLog, stopAnimation]);

  // Toggle animation state
  const toggleAnimation = useCallback(() => {
    if (isAnimatingRef.current) {
      stopAnimation();
    } else {
      addDebugLog(`Starting animation with speed ${speedFactorRef.current}x`);
      
      // Use requestAnimationFrame to ensure this happens outside the render cycle
      window.requestAnimationFrame(() => {
        MockVehicleSeeder.startAutoUpdate(1000, speedFactorRef.current);
        
        // Update refs
        isAnimatingRef.current = true;
        
        // Only update display state if component is still mounted
        if (isMountedRef.current) {
          setDisplayState(prev => ({
            ...prev,
            isAnimating: true
          }));
        }
      });
    }
  }, [addDebugLog, stopAnimation]);

  // Update animation speed
  const handleSpeedChange = useCallback((newSpeed: number) => {
    // Update ref
    speedFactorRef.current = newSpeed;
    
    // Only update display if component is still mounted
    if (isMountedRef.current) {
      setDisplayState(prev => ({
        ...prev,
        speedFactor: newSpeed
      }));
    }
    
    // If animation is running, update the speed
    if (isAnimatingRef.current) {
      addDebugLog(`Updating animation speed to ${newSpeed}x`);
      
      // Use requestAnimationFrame to ensure this happens outside the render cycle
      window.requestAnimationFrame(() => {
        MockVehicleSeeder.stopAutoUpdate();
        MockVehicleSeeder.startAutoUpdate(1000, newSpeed);
      });
    }
  }, [addDebugLog]);

  // Handle shipment simulation
  const handleSimulateShipment = useCallback(async () => {
    addDebugLog('Simulating shipment upload');
    
    try {
      // Create and animate a vehicle from the mock shipment
      const result = await createAndAnimateVehicle(mockShipment, {
        speed: 60 * speedFactorRef.current, // Use current speed factor
        useMockRoute: false, // Use real-world routing
        showRouteLine: true,
      });
      
      if (result.vehicle) {
        addDebugLog(`Created vehicle ${result.vehicle.id} from shipment`);
        
        // Update shipment counter
        setDisplayState(prev => ({
          ...prev,
          shipmentCount: prev.shipmentCount + 1,
          vehicleCount: prev.vehicleCount + 1
        }));
      } else {
        addDebugLog('Failed to create vehicle from shipment');
      }
    } catch (error) {
      addDebugLog(`Error simulating shipment: ${error}`);
      console.error('Error simulating shipment:', error);
    }
  }, [addDebugLog]);

  // Clear mounted flag on unmount
  useEffect(() => {
    addDebugLog('Component mounted');
    
    return () => {
      addDebugLog('Component unmounting');
      isMountedRef.current = false;
      
      // Cleanup any animation
      MockVehicleSeeder.stopAutoUpdate();
    };
  }, [addDebugLog]);

  return (
    <div>
      {/* Remove SimulatedVehicleMap from here - it shouldn't render its own map */}
      
      <div style={styles.panel}>
        <h3 style={styles.heading}>Simulation Controls</h3>
        
        <div style={styles.infoDisplay}>
          Active vehicles: {displayState.vehicleCount}
          <br />
          Status: {displayState.isAnimating ? 'Animating' : 'Stopped'}
          <br />
          Speed: {displayState.speedFactor}x
          <br />
          Shipments simulated: {displayState.shipmentCount}
        </div>
        
        <div style={styles.buttonContainer}>
          <button 
            style={{...styles.button, ...styles.simulateButton}}
            onClick={handleSimulateShipment}
          >
            📄 Simulate Shipment Upload
          </button>
          
          <button 
            style={styles.button}
            onClick={() => handleSeedVehicles(5)}
            disabled={displayState.isAnimating}
          >
            Seed 5 Vehicles
          </button>
          
          <button 
            style={{
              ...styles.button,
              backgroundColor: displayState.isAnimating ? '#f59e0b' : '#10b981',
            }}
            onClick={toggleAnimation}
            disabled={displayState.vehicleCount === 0}
          >
            {displayState.isAnimating ? 'Stop Animation' : 'Start Animation'}
          </button>
          
          <button 
            style={{...styles.button, ...styles.dangerButton}}
            onClick={handleClearVehicles}
          >
            Clear All Vehicles
          </button>
        </div>
        
        <div style={styles.sliderContainer}>
          <label style={styles.sliderLabel}>
            Animation Speed: {displayState.speedFactor}x
          </label>
          <input 
            type="range" 
            min="0.1" 
            max="5" 
            step="0.1" 
            value={displayState.speedFactor}
            onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
        
        <div style={styles.debugInfo}>
          {debugLogs.map((log, index) => (
            <div key={index}>{log}</div>
          ))}
        </div>
        
        <div style={styles.footer}>
          Using SimulationFromShipmentService for demonstration
        </div>
      </div>
    </div>
  );
};

export default React.memo(SimulationDemoPanel); 