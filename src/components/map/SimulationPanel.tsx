import React, { useState, useEffect } from 'react';
import { getSimulationInstance, clearSimulationInstance, MapVehicleSimulation } from './MapVehicleSimulation';
import { useVehicleStore } from '../../store/map/useVehicleStore';

interface SimulationPanelProps {
  /** Whether the panel is open */
  isOpen?: boolean;
  
  /** Initial simulation speed */
  initialSpeed?: number;
  
  /** Initial vehicle count */
  initialVehicleCount?: number;
  
  /** Callback when simulation status changes */
  onStatusChange?: (isRunning: boolean) => void;
}

/**
 * Simulation Control Panel
 * 
 * A UI panel to control vehicle simulation for testing
 */
const SimulationPanel: React.FC<SimulationPanelProps> = ({
  isOpen = false,
  initialSpeed = 10,
  initialVehicleCount = 5,
  onStatusChange
}) => {
  const [expanded, setExpanded] = useState(isOpen);
  const [vehicleCount, setVehicleCount] = useState(initialVehicleCount);
  const [speed, setSpeed] = useState(initialSpeed);
  const [isRunning, setIsRunning] = useState(false);
  const [simulationInstance, setSimulationInstance] = useState<MapVehicleSimulation | null>(null);
  
  // Get setVehicles from the vehicle store
  const setVehicles = useVehicleStore(state => state.setVehicles);
  
  // Initialize simulation
  useEffect(() => {
    const simulation = getSimulationInstance({
      vehicleCount: vehicleCount,
      speedMultiplier: speed,
      updateFrequency: 1000,
      baseLocation: {
        latitude: 3.1390,
        longitude: 101.6869
      },
      maxDeviation: 0.05,
      speedRange: {
        min: 20,
        max: 80
      }
    });
    
    setSimulationInstance(simulation);
    
    return () => {
      if (isRunning) {
        stopSimulation();
      }
    };
  }, []);
  
  // Start simulation
  const startSimulation = () => {
    if (!simulationInstance) return;
    
    // Initialize with current settings
    const vehicles = simulationInstance.initialize();
    
    // Update the store with simulated vehicles
    setVehicles(vehicles);
    
    // Start simulation
    simulationInstance.start();
    setIsRunning(true);
    
    if (onStatusChange) {
      onStatusChange(true);
    }
  };
  
  // Stop simulation
  const stopSimulation = () => {
    if (!simulationInstance) return;
    
    simulationInstance.stop();
    setIsRunning(false);
    
    if (onStatusChange) {
      onStatusChange(false);
    }
  };
  
  // Toggle simulation
  const toggleSimulation = () => {
    if (isRunning) {
      stopSimulation();
    } else {
      startSimulation();
    }
  };
  
  // Update vehicle count
  const handleVehicleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0 && value <= 20) {
      setVehicleCount(value);
    }
  };
  
  // Update simulation speed
  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0 && value <= 50) {
      setSpeed(value);
    }
  };
  
  // Apply updated settings
  const applySettings = () => {
    if (!simulationInstance) return;
    
    // Restart simulation with new settings
    const wasRunning = isRunning;
    if (wasRunning) {
      stopSimulation();
    }
    
    // Clear and recreate simulation instance
    clearSimulationInstance();
    
    const simulation = getSimulationInstance({
      vehicleCount: vehicleCount,
      speedMultiplier: speed,
      updateFrequency: 1000,
      baseLocation: {
        latitude: 3.1390,
        longitude: 101.6869
      },
      maxDeviation: 0.05,
      speedRange: {
        min: 20,
        max: 80
      }
    });
    
    setSimulationInstance(simulation);
    
    // Restart if it was running
    if (wasRunning) {
      setTimeout(() => {
        startSimulation();
      }, 100);
    }
  };
  
  return (
    <div className="simulation-panel fixed bottom-4 right-4 bg-white rounded-lg shadow-lg overflow-hidden z-20">
      {/* Panel header */}
      <div 
        className="simulation-header p-3 bg-blue-600 text-white cursor-pointer flex items-center justify-between"
        onClick={() => setExpanded(!expanded)}
      >
        <h3 className="font-medium flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-1h3a1 1 0 001-1v-3a1 1 0 00-.293-.707l-2-2A1 1 0 0012 7h-1V5a1 1 0 00-1-1H3z" />
          </svg>
          Vehicle Simulation
        </h3>
        <div className={`transform transition-transform ${expanded ? 'rotate-180' : ''}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      
      {/* Panel content */}
      {expanded && (
        <div className="simulation-content p-4">
          {/* Status indicator */}
          <div className="status-indicator flex items-center mb-4">
            <div className={`w-3 h-3 rounded-full mr-2 ${isRunning ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm font-medium">Simulation {isRunning ? 'Running' : 'Stopped'}</span>
          </div>
          
          {/* Controls */}
          <div className="controls space-y-4">
            {/* Vehicle count */}
            <div className="control-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle Count
              </label>
              <div className="flex items-center">
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={vehicleCount}
                  onChange={handleVehicleCountChange}
                  className="flex-grow"
                />
                <span className="ml-2 text-sm font-medium w-8 text-center">{vehicleCount}</span>
              </div>
            </div>
            
            {/* Speed multiplier */}
            <div className="control-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Speed Multiplier
              </label>
              <div className="flex items-center">
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={speed}
                  onChange={handleSpeedChange}
                  className="flex-grow"
                />
                <span className="ml-2 text-sm font-medium w-8 text-center">{speed}x</span>
              </div>
            </div>
            
            {/* Buttons */}
            <div className="flex space-x-2">
              <button
                className={`px-4 py-2 rounded-md font-medium flex-grow ${
                  isRunning
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
                onClick={toggleSimulation}
              >
                {isRunning ? 'Stop' : 'Start'} Simulation
              </button>
              
              <button
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md font-medium hover:bg-blue-200"
                onClick={applySettings}
              >
                Apply Settings
              </button>
            </div>
          </div>
          
          {/* Info */}
          <div className="info mt-4 text-xs text-gray-500">
            <p>
              This simulation creates virtual vehicles moving along predefined routes in Malaysia.
              Use this for testing the map and tracking functionality without real GPS devices.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimulationPanel; 