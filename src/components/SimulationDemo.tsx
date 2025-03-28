/**
 * SimulationDemo Component
 * 
 * Demonstrates how to create and animate simulated vehicles from shipment data.
 * Provides UI controls for testing the simulation functionality.
 * 
 * IMPORTANT: This component does NOT render a map directly. It should be used
 * alongside SimulatedVehicleMap, but doesn't contain one itself.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { mockShipment } from '../types/ParsedShipment';
import { createVehicleFromShipment, createAndAnimateVehicle } from '../services/shipment/SimulationFromShipmentService';
import { SimulatedVehicle } from '../types/vehicle';
import { useUnifiedVehicleStore } from '../store/useUnifiedVehicleStore';

// Extended types for simulated vehicle with shipment data
interface ShipmentMetadata {
  orderId: string;
  poNumber: string;
  destination: string;
  contact: string;
  remarks: string;
  weight: number;
}

// Extend the simulated vehicle to include shipment data
interface ExtendedSimulatedVehicle extends SimulatedVehicle {
  shipment?: ShipmentMetadata;
  routeData?: {
    id: string;
    type: string;
    coordinates: [number, number][];
    color: string;
    width: number;
    glow?: boolean;
  };
}

interface SimulationDemoProps {
  className?: string;
  onZoomToVehicle?: (location: { latitude: number; longitude: number }) => void;
}

// Vehicle visualization options
const VISUALIZATION_PRESETS = {
  default: {
    color: '#00BFFF', // Neon blue
    size: 2.5,
    routeLineColor: '#00FF00', // Bright green like in reference
    routeLineWidth: 5,
    routeLineGlow: true,
    zoomDependent: true
  },
  highlight: {
    color: '#FF4500', // Orange-red
    size: 3,
    routeLineColor: '#FF4500',
    routeLineWidth: 6,
    routeLineGlow: true,
    zoomDependent: true
  },
  subtle: {
    color: '#4682B4', // Steel blue
    size: 2,
    routeLineColor: '#6A5ACD', // Slate blue
    routeLineWidth: 4,
    routeLineGlow: false,
    zoomDependent: true
  }
};

const SimulationDemo: React.FC<SimulationDemoProps> = ({ className, onZoomToVehicle }) => {
  const [vehicles, setVehicles] = useState<ExtendedSimulatedVehicle[]>([]);
  const [animationSpeeds, setAnimationSpeeds] = useState<Record<string, number>>({});
  const [animationControls, setAnimationControls] = useState<Record<string, { stop: () => void }>>({});
  const [deliveredVehicles, setDeliveredVehicles] = useState<Record<string, boolean>>({});
  const [showHelpText, setShowHelpText] = useState(true);
  
  // Use fixed settings instead of UI controls
  const selectedStyle = 'default';
  const useRealRouting = true;
  
  // Get vehicles from store for display
  const getFilteredVehicles = useUnifiedVehicleStore(state => state.getFilteredVehicles);
  const clearVehicle = useUnifiedVehicleStore(state => state.removeVehicle);
  const updateVehicle = useUnifiedVehicleStore(state => state.updateVehicle);

  // Create & animate vehicle with current settings
  const handleCreateAndAnimateVehicle = async () => {
    try {
      setShowHelpText(false);
      
      // Create and animate a vehicle from the mockShipment
      const { vehicle, stop } = await createAndAnimateVehicle(mockShipment, {
        ...VISUALIZATION_PRESETS[selectedStyle],
        useMockRoute: !useRealRouting, // Use real routing by default
        speed: 60 // Normal speed
      });
      
      if (vehicle) {
        // Add to animation controls
        setAnimationControls(prev => ({
          ...prev,
          [vehicle.id]: { stop }
        }));
        
        console.log('Vehicle is now animating');
        
        // Auto-zoom to the new vehicle
        if (onZoomToVehicle && vehicle.location) {
          onZoomToVehicle(vehicle.location);
        }
      }
    } catch (error) {
      console.error('Error creating and animating vehicle:', error);
    }
  };

  // Remove a vehicle
  const handleRemoveVehicle = useCallback((vehicleId: string) => {
    // Stop animation if running
    if (animationControls[vehicleId]) {
      animationControls[vehicleId].stop();
    }
    
    // Remove from animation controls
    setAnimationControls(prev => {
      const newControls = { ...prev };
      delete newControls[vehicleId];
      return newControls;
    });
    
    // Remove from animation speeds
    setAnimationSpeeds(prev => {
      const newSpeeds = { ...prev };
      delete newSpeeds[vehicleId];
      return newSpeeds;
    });
    
    // Remove from delivered vehicles
    setDeliveredVehicles(prev => {
      const newDelivered = { ...prev };
      delete newDelivered[vehicleId];
      return newDelivered;
    });
    
    // Remove from vehicles list
    setVehicles(prev => prev.filter(v => v.id !== vehicleId));
    
    // Remove from store
    clearVehicle(vehicleId);
  }, [animationControls, clearVehicle]);

  // Update animation speed for a vehicle
  const handleUpdateVehicleSpeed = useCallback((vehicleId: string, speed: number) => {
    // Update in state
    setAnimationSpeeds(prev => ({
      ...prev,
      [vehicleId]: speed
    }));
    
    // Update the vehicle in the store
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (vehicle) {
      updateVehicle(vehicleId, {
        ...vehicle,
        speed: speed * 50 // Convert to km/h
      });
    }
  }, [vehicles, updateVehicle]);

  // Clear all vehicles
  const handleClearAllVehicles = useCallback(() => {
    // Stop all animations
    Object.values(animationControls).forEach(control => {
      if (control && control.stop) {
        control.stop();
      }
    });
    
    // Clear all states
    setAnimationControls({});
    setAnimationSpeeds({});
    setDeliveredVehicles({});
    setVehicles([]);
    
    // Clear vehicles from store
    vehicles.forEach(vehicle => {
      clearVehicle(vehicle.id);
    });
  }, [animationControls, vehicles, clearVehicle]);

  // Refresh vehicle list from store
  useEffect(() => {
    const storeVehicles = getFilteredVehicles() || [];
    
    // Filter for simulated vehicles only
    const simulatedVehicles = storeVehicles.filter(v => 
      v.isSimulated
    ) as ExtendedSimulatedVehicle[];
    
    if (simulatedVehicles.length !== vehicles.length) {
      // Only update if the count changed to avoid unnecessary renders
      setVehicles(simulatedVehicles);
    }
  }, [getFilteredVehicles, vehicles.length]);

  // Handler for simulating shipment upload (now the main button)
  const handleSimulateShipment = async () => {
    try {
      setShowHelpText(false);
      
      // Create and animate a vehicle from the mockShipment
      const { vehicle, stop } = await createAndAnimateVehicle(mockShipment, {
        ...VISUALIZATION_PRESETS[selectedStyle],
        useMockRoute: false, // Always use real routing
        speed: 80, // Faster speed for demo
      });
      
      if (vehicle) {
        // Add to animation controls
        setAnimationControls(prev => ({
          ...prev,
          [vehicle.id]: { stop }
        }));
        
        console.log(`Simulated shipment ${mockShipment.orderId} created`);
        
        // Auto-zoom to the new vehicle
        if (onZoomToVehicle && vehicle.location) {
          onZoomToVehicle(vehicle.location);
        }
      }
    } catch (error) {
      console.error('Error simulating shipment:', error);
    }
  };

  // Render component
  return (
    <div className={className || ''}>
      <div className="simulation-controls" style={{ padding: '15px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <h3>Vehicle Simulation</h3>
        
        {showHelpText && (
          <div className="help-text" style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
            <p>
              <strong>Getting Started:</strong> Press the button below to create a simulated vehicle 
              that follows a real-world route from origin to destination.
            </p>
          </div>
        )}
        
        {/* Primary action button */}
        <button 
          onClick={handleSimulateShipment}
          style={{
            backgroundColor: '#FF9800',
            color: 'white',
            fontWeight: 'bold',
            padding: '12px 15px',
            marginBottom: '15px',
            width: '100%',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          ⚡ Simulate Shipment Upload
        </button>
        
        {vehicles.length > 0 && (
          <button 
            onClick={handleClearAllVehicles}
            style={{
              padding: '8px 12px',
              backgroundColor: '#f54a4a',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '8px',
              width: '100%'
            }}
          >
            Clear All Vehicles
          </button>
        )}
        
        {vehicles.length > 0 && (
          <div className="vehicle-list">
            <h4>Active Vehicles ({vehicles.length})</h4>
            
            {vehicles.map(vehicle => (
              <div key={vehicle.id} className="vehicle-item">
                <div className="vehicle-info">
                  <span className="vehicle-id">{vehicle.id}</span>
                  <span className="vehicle-type">{vehicle.type}</span>
                  <span className="vehicle-status">{vehicle.status}</span>
                </div>
                
                <div className="vehicle-location">
                  {vehicle.location && (
                    <>
                      <span>Lat: {vehicle.location.latitude.toFixed(4)}</span>
                      <span>Lng: {vehicle.location.longitude.toFixed(4)}</span>
                    </>
                  )}
                </div>
                
                {/* Speed slider for animated vehicles */}
                {animationSpeeds[vehicle.id] !== undefined && (
                  <div className="speed-slider">
                    <label>
                      Speed ({animationSpeeds[vehicle.id]}x):
                      <input
                        type="range"
                        min="0.1"
                        max="5"
                        step="0.1"
                        value={animationSpeeds[vehicle.id]}
                        onChange={(e) => handleUpdateVehicleSpeed(vehicle.id, parseFloat(e.target.value))}
                      />
                    </label>
                  </div>
                )}
                
                <div className="vehicle-actions">
                  <button 
                    className="zoom-button"
                    onClick={() => onZoomToVehicle && vehicle.location && onZoomToVehicle(vehicle.location)}
                  >
                    Zoom To
                  </button>
                  
                  <button 
                    className="remove-button"
                    onClick={() => handleRemoveVehicle(vehicle.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <style jsx>{`
        .simulation-controls {
          background: white;
          border-radius: 8px;
          padding: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          width: 320px;
          max-height: 80vh;
          overflow-y: auto;
        }
        
        h3 {
          margin-top: 0;
          margin-bottom: 12px;
          font-size: 18px;
          color: #333;
        }
        
        h4 {
          margin-top: 16px;
          margin-bottom: 8px;
          font-size: 16px;
          color: #555;
        }
        
        .help-text {
          background: #f8f9fa;
          border-radius: 4px;
          padding: 10px;
          margin-bottom: 16px;
          font-size: 14px;
          color: #555;
        }
        
        .button-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 16px;
        }
        
        button {
          padding: 8px 12px;
          border: none;
          border-radius: 4px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .create-button {
          background: #4285f4;
          color: white;
        }
        
        .animate-button {
          background: #0f9d58;
          color: white;
        }
        
        .clear-button {
          background: #db4437;
          color: white;
          margin-top: 8px;
        }
        
        .options-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 16px;
          padding: 12px;
          background: #f8f9fa;
          border-radius: 4px;
        }
        
        .style-selector {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        select {
          padding: 4px 8px;
          border-radius: 4px;
          border: 1px solid #ddd;
        }
        
        .vehicle-list {
          border-top: 1px solid #eee;
          padding-top: 8px;
        }
        
        .vehicle-item {
          background: #f8f9fa;
          border-radius: 4px;
          padding: 12px;
          margin-bottom: 8px;
        }
        
        .vehicle-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        
        .vehicle-id {
          font-family: monospace;
          font-size: 12px;
          color: #666;
        }
        
        .vehicle-type {
          font-weight: 500;
        }
        
        .vehicle-status {
          background: #e8f0fe;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 12px;
        }
        
        .vehicle-location {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #666;
          margin-bottom: 8px;
        }
        
        .speed-slider {
          margin-bottom: 8px;
        }
        
        .speed-slider label {
          display: flex;
          flex-direction: column;
          font-size: 12px;
          color: #666;
        }
        
        .vehicle-actions {
          display: flex;
          justify-content: space-between;
        }
        
        .zoom-button {
          background: #4285f4;
          color: white;
          font-size: 12px;
          padding: 4px 8px;
        }
        
        .remove-button {
          background: #db4437;
          color: white;
          font-size: 12px;
          padding: 4px 8px;
        }
      `}</style>
    </div>
  );
};

export default SimulationDemo; 