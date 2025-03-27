/**
 * Example: ShipmentSimulationExample
 * 
 * This example demonstrates how to integrate shipment simulation
 * into an existing tracking page. It uses mock data instead of
 * real uploads, focusing on the simulation aspect only.
 */

import React, { useState, useEffect } from 'react';
import SimulatedVehicleMap from '../components/map/SimulatedVehicleMap';
import SimulationDemo from '../components/SimulationDemo';
import { mockShipment } from '../types/ParsedShipment';
import { createAndAnimateVehicle } from '../services/shipment/SimulationFromShipmentService';
import { useUnifiedVehicleStore } from '../store/useUnifiedVehicleStore';

// Example page that shows how to use the shipment-to-vehicle simulation
const ShipmentSimulationExample: React.FC = () => {
  const [mapReady, setMapReady] = useState(false);
  const [animationControls, setAnimationControls] = useState<{ stop: () => void }[]>([]);
  
  // Get store actions for reference
  const clearVehicle = useUnifiedVehicleStore(state => state.removeVehicle);
  const vehicles = useUnifiedVehicleStore(state => state.getFilteredVehicles());
  
  // Auto-create a demo vehicle when the map is ready
  useEffect(() => {
    if (mapReady) {
      // Demo auto-creation after a slight delay
      const timer = setTimeout(() => {
        handleCreateDemoVehicle();
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [mapReady]);
  
  // Create a single demo vehicle
  const handleCreateDemoVehicle = () => {
    // Create a demo vehicle from our mock shipment
    const { vehicle, stop } = createAndAnimateVehicle(mockShipment, {
      speed: 70,
      updateInterval: 500
    });
    
    if (vehicle) {
      // Store animation control for cleanup
      setAnimationControls(prev => [...prev, { stop }]);
      
      console.log('Created and animated vehicle:', vehicle.id);
    }
  };
  
  // Clean up animations when component unmounts
  useEffect(() => {
    return () => {
      // Stop all animations
      animationControls.forEach(control => control.stop());
    };
  }, []);
  
  return (
    <div className="shipment-simulation-example">
      <div className="page-header">
        <h1>LoadUp Shipment Simulation</h1>
        <p>
          This example demonstrates how a parsed shipment generates
          a vehicle that animates from pickup to dropoff on the map.
        </p>
      </div>
      
      <div className="controls-panel">
        <SimulationDemo />
      </div>
      
      <div className="map-container">
        <SimulatedVehicleMap
          className="h-[600px]"
          initialZoom={9}
          initialCenter={{ lat: 3.1402, lng: 101.6869 }} // Kuala Lumpur
          mapStyle="mapbox://styles/mapbox/streets-v11"
          onMapLoad={() => setMapReady(true)}
        />
      </div>
      
      <div className="stats-panel">
        <h3>Simulation Stats</h3>
        <p>Total vehicles: {vehicles.length}</p>
        <p>Simulated vehicles: {vehicles.filter(v => v.isSimulated).length}</p>
        <p>Map ready: {mapReady ? 'Yes' : 'No'}</p>
      </div>
      
      <style jsx>{`
        .shipment-simulation-example {
          display: flex;
          flex-direction: column;
          padding: 1rem;
          gap: 1rem;
          height: 100%;
        }
        
        .page-header {
          margin-bottom: 1rem;
        }
        
        .map-container {
          height: 600px;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .controls-panel {
          margin-bottom: 1rem;
        }
        
        .stats-panel {
          margin-top: 1rem;
          padding: 1rem;
          background-color: #f8f9fa;
          border-radius: 8px;
        }
        
        h1 {
          margin-top: 0;
          color: #333;
        }
        
        h3 {
          margin-top: 0;
        }
      `}</style>
    </div>
  );
};

export default ShipmentSimulationExample;

/**
 * Adding the component to your application:
 * 
 * In your pages or router file, import and use this component:
 * 
 * ```tsx
 * import ShipmentSimulationExample from '../examples/ShipmentSimulationExample';
 * 
 * // In your router or page component
 * <Route path="/tracking/simulation" element={<ShipmentSimulationExample />} />
 * ```
 * 
 * Alternatively, use the individual parts in your existing tracking page:
 * 
 * ```tsx
 * import { mockShipment } from '../types/ParsedShipment';
 * import { createAndAnimateVehicle } from '../services/shipment/SimulationFromShipmentService';
 * 
 * // Inside your component:
 * const handleSimulateUpload = () => {
 *   const { vehicle } = createAndAnimateVehicle(mockShipment);
 *   console.log('Created vehicle:', vehicle?.id);
 * };
 * 
 * // Add a button somewhere in your UI:
 * <button onClick={handleSimulateUpload}>
 *   Simulate Upload
 * </button>
 * ```
 */ 