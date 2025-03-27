import React, { useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { mapManager } from '../../../utils/maps/MapManager';
import MapMarkerLayer from '../MapMarkerLayer';
import { useUnifiedVehicleStore } from '../../../store/useUnifiedVehicleStore';
import { mockShipment } from '../../../types/ParsedShipment';
import { createVehicleFromShipment } from '../../../services/shipment/SimulationFromShipmentService';

// Initialize token
const MAPBOX_TOKEN = 'pk.eyJ1IjoiZXNyYXJ1c3RpbiIsImEiOiJjbThnaG9zbGUwaTJwMmtzN3Z2NG52aGFqIn0.YZU4AX-XapN8dwxI79fs0g';

interface MapVehicleRenderingTestProps {
  width?: string;
  height?: string;
}

/**
 * Test component to verify that vehicles from UnifiedVehicleStore render correctly on the map
 */
const MapVehicleRenderingTest: React.FC<MapVehicleRenderingTestProps> = ({
  width = '100%',
  height = '500px'
}) => {
  const [mapId] = useState(`test-map-${Date.now()}`);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const vehicles = useUnifiedVehicleStore(state => state.getFilteredVehicles());
  const selectedVehicleId = useUnifiedVehicleStore(state => state.selectedVehicleId);
  const selectVehicle = useUnifiedVehicleStore(state => state.selectVehicle);
  
  // Initialize Mapbox
  useEffect(() => {
    // Skip if already initialized
    if (map) return;
    
    // Set Mapbox token
    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    // Create map
    const mapInstance = new mapboxgl.Map({
      container: mapId,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [101.6953, 3.1493], // Kuala Lumpur
      zoom: 10
    });
    
    // Register with MapManager
    mapManager.registerMap(mapId, mapInstance);
    
    // Store map reference
    setMap(mapInstance);
    
    // Set up map ready detection
    mapInstance.on('load', () => {
      console.log('[MapVehicleRenderingTest] Map is ready');
      setIsMapReady(true);
    });
    
    // Clean up on unmount
    return () => {
      mapManager.unregisterMap(mapId);
      mapInstance.remove();
    };
  }, [mapId]);
  
  // Create a test vehicle on first render
  useEffect(() => {
    if (!isMapReady) return;
    
    // Check if we already have vehicles
    if (vehicles.length === 0) {
      console.log('[MapVehicleRenderingTest] Creating test vehicle');
      
      // Create a test vehicle
      const testShipment = {
        ...mockShipment,
        orderId: `TEST-${Date.now()}`
      };
      
      // Create vehicle with visuals
      createVehicleFromShipment(testShipment, {
        color: '#00BFFF', // Bright blue
        size: 2.5, // Larger
        showTooltip: true,
        showRouteLine: true,
        routeLineColor: '#00FF00', // Bright green
        routeLineWidth: 5,
        routeLineGlow: true
      });
    } else {
      console.log('[MapVehicleRenderingTest] Using existing vehicles:', vehicles.length);
    }
  }, [isMapReady, vehicles.length]);
  
  // Handle vehicle click
  const handleVehicleClick = (vehicle: any) => {
    console.log('[MapVehicleRenderingTest] Vehicle clicked:', vehicle.id);
    selectVehicle(vehicle.id);
  };
  
  // Handle vehicle hover
  const handleVehicleHover = (vehicle: any) => {
    if (vehicle) {
      console.log('[MapVehicleRenderingTest] Vehicle hovered:', vehicle.id);
    }
  };
  
  // Create test buttons
  const createTestVehicle = () => {
    console.log('[MapVehicleRenderingTest] Creating additional test vehicle');
    
    // Create a test vehicle
    const testShipment = {
      ...mockShipment,
      orderId: `TEST-${Date.now()}`
    };
    
    // Create vehicle with visuals
    createVehicleFromShipment(testShipment, {
      color: '#FF4500', // Orange-red
      size: 2.5,
      showTooltip: true,
      showRouteLine: true,
      routeLineColor: '#FF4500',
      routeLineWidth: 5,
      routeLineGlow: true
    });
  };
  
  // Zoom to selected vehicle
  const zoomToVehicle = () => {
    if (selectedVehicleId && map) {
      const vehicle = vehicles.find(v => v.id === selectedVehicleId);
      if (vehicle && vehicle.location) {
        // Pan to the vehicle location
        const center: [number, number] = [vehicle.location.longitude, vehicle.location.latitude];
        map.setCenter(center);
        map.setZoom(13);
      }
    }
  };
  
  return (
    <div className="map-vehicle-rendering-test">
      <div className="test-controls" style={{ padding: '10px', background: '#f0f0f0', marginBottom: '10px' }}>
        <h3>Map Vehicle Rendering Test</h3>
        <p>Vehicles: {vehicles.length} | Selected: {selectedVehicleId || 'None'}</p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={createTestVehicle}
            style={{ padding: '5px 10px', background: '#00BFFF', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Create Test Vehicle
          </button>
          <button 
            onClick={zoomToVehicle}
            style={{ padding: '5px 10px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px' }}
            disabled={!selectedVehicleId}
          >
            Zoom to Selected
          </button>
        </div>
      </div>
      
      <div 
        id={mapId} 
        style={{ 
          width, 
          height, 
          position: 'relative',
          border: '1px solid #ccc',
          borderRadius: '4px'
        }}
      >
        {map && (
          <MapMarkerLayer
            mapId={mapId}
            vehicles={vehicles}
            selectedVehicleId={selectedVehicleId}
            onVehicleClick={handleVehicleClick}
            onVehicleHover={handleVehicleHover}
          />
        )}
      </div>
      
      <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
        <p>This test verifies that vehicles from UnifiedVehicleStore render correctly on the map.</p>
        <p>Create a test vehicle, then check if it appears on the map with correct styling and route line.</p>
      </div>
    </div>
  );
};

export default MapVehicleRenderingTest; 