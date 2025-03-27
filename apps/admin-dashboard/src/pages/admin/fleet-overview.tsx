import React, { useEffect, useState, useRef, useCallback } from 'react';
import Head from 'next/head';
import Script from 'next/script';
import { 
  createMapWithErrorHandling, 
  cleanupMap, 
  addVehicleMarker, 
  updateVehiclePosition,
  drawRoutePath,
  fitMapToCoordinates
} from '../../utils/mapboxHelper';
import { useVehicleStore } from '../../stores/vehicleStore';

// Sample vehicle data
const SAMPLE_VEHICLES = [
  {
    id: 'v-001',
    name: 'Truck 001',
    status: 'delivering',
    position: [-122.4194, 37.7749] as [number, number],
    heading: 45,
    speed: 35,
    lastUpdate: new Date().toISOString(),
    route: [
      [-122.4194, 37.7749] as [number, number],
      [-122.4156, 37.7598] as [number, number],
      [-122.4090, 37.7516] as [number, number],
      [-122.4030, 37.7380] as [number, number],
    ]
  },
  {
    id: 'v-002',
    name: 'Truck 002',
    status: 'loading',
    position: [-74.0060, 40.7128] as [number, number],
    heading: 90,
    speed: 0,
    lastUpdate: new Date().toISOString(),
    route: [
      [-74.0060, 40.7128] as [number, number],
      [-73.9867, 40.7585] as [number, number],
      [-73.9624, 40.7799] as [number, number],
    ]
  },
  {
    id: 'v-003',
    name: 'Truck 003',
    status: 'idle',
    position: [-87.6298, 41.8781] as [number, number],
    heading: 180,
    speed: 0,
    lastUpdate: new Date().toISOString(),
    route: []
  }
];

export default function FleetOverviewMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [vehicleMarkers, setVehicleMarkers] = useState<Record<string, any>>({});
  
  // Use the Zustand store
  const vehicles = useVehicleStore(state => state.vehicles);
  const selectedVehicleId = useVehicleStore(state => state.selectedVehicleId);
  const updateVehiclePos = useVehicleStore(state => state.updateVehiclePosition);
  const selectVehicle = useVehicleStore(state => state.selectVehicle);
  const updateVehicleStatus = useVehicleStore(state => state.updateVehicleStatus);
  
  // Filter vehicles based on search query
  const filteredVehicles = useCallback(() => {
    if (!searchQuery.trim()) {
      return vehicles;
    }
    
    const query = searchQuery.toLowerCase().trim();
    return vehicles.filter(v => 
      v.id.toLowerCase().includes(query) || 
      v.name.toLowerCase().includes(query) ||
      v.status.toLowerCase().includes(query)
    );
  }, [searchQuery, vehicles]);

  // Fetch token from API
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await fetch('/api/mapbox-token');
        const data = await response.json();
        
        if (data.error) {
          setError(data.error);
          return;
        }
        
        setToken(data.token);
      } catch (err) {
        console.error('Failed to fetch Mapbox token:', err);
        setError('Failed to fetch Mapbox token');
      }
    };
    
    fetchToken();
  }, []);

  // Initialize map after script is loaded and token is available
  useEffect(() => {
    if (!isScriptLoaded || !token || !mapContainerRef.current) return;
    
    // Initialize map using our utility
    const map = createMapWithErrorHandling(
      mapContainerRef,
      token,
      {
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-95.7129, 37.0902], // USA center
        zoom: 3.5,
      },
      (map) => {
        console.log('Map initialized successfully');
        setMapInstance(map);
        setIsMapLoaded(true);
      },
      (error) => {
        console.error('Map initialization error:', error);
        setError(error.message);
      }
    );
    
    // Cleanup function
    return () => {
      if (map) {
        cleanupMap(map);
        setMapInstance(null);
        setIsMapLoaded(false);
      }
    };
  }, [isScriptLoaded, token]);

  // Add vehicle markers once map is loaded
  useEffect(() => {
    if (!mapInstance || !isMapLoaded) return;
    
    const filtered = filteredVehicles();
    const markers: Record<string, any> = {};
    
    // Remove any existing markers
    Object.values(vehicleMarkers).forEach(marker => {
      marker.remove();
    });
    
    // Remove any existing route layers and sources
    vehicles.forEach(vehicle => {
      if (vehicle.route.length >= 2) {
        try {
          const sourceId = `route-${vehicle.id}`;
          const layerId = `route-layer-${vehicle.id}`;
          
          if (mapInstance.getLayer(layerId)) {
            mapInstance.removeLayer(layerId);
          }
          
          if (mapInstance.getSource(sourceId)) {
            mapInstance.removeSource(sourceId);
          }
        } catch (err) {
          console.error(`Error removing route for ${vehicle.id}:`, err);
        }
      }
    });
    
    // Add markers for each vehicle
    filtered.forEach(vehicle => {
      const marker = addVehicleMarker(
        mapInstance,
        vehicle.id,
        vehicle.position,
        vehicle.heading,
        {
          name: vehicle.name,
          status: vehicle.status,
          speed: vehicle.speed,
          lastUpdate: vehicle.lastUpdate
        }
      );
      
      if (marker) {
        // Store marker reference
        markers[vehicle.id] = marker;
        
        // Add route if it exists
        if (vehicle.route.length >= 2) {
          drawRoutePath(mapInstance, vehicle.route, {
            lineColor: vehicle.status === 'delivering' ? '#3B82F6' : '#9CA3AF',
            sourceId: `route-${vehicle.id}`,
            layerId: `route-layer-${vehicle.id}`
          });
        }
        
        // Add click handler to select vehicle
        marker.getElement().addEventListener('click', () => {
          selectVehicle(vehicle.id);
        });
      }
    });
    
    // Update markers state
    setVehicleMarkers(markers);
    
    // Fit map to include all vehicles
    if (filtered.length > 0) {
      fitMapToCoordinates(mapInstance, filtered.map(v => v.position));
    }
  }, [mapInstance, isMapLoaded, vehicles, filteredVehicles, selectVehicle]);

  // Find selected vehicle details
  const selectedVehicle = selectedVehicleId ? vehicles.find(v => v.id === selectedVehicleId) : null;

  // Simulate vehicle movement (for demonstration)
  const simulateMovement = useCallback(() => {
    if (!mapInstance || !isMapLoaded) return;
    
    // Update all delivering vehicles
    vehicles.forEach(vehicle => {
      if (vehicle.status !== 'delivering' || vehicle.route.length < 2) {
        return;
      }
      
      // Calculate new position along the route
      const routeIndex = 0; // In a real app, this would be based on progress
      const nextRouteIndex = 1;
      
      if (routeIndex >= vehicle.route.length - 1) {
        updateVehicleStatus(vehicle.id, 'delivered');
        return;
      }
      
      // Get current and next points
      const currentPoint = vehicle.route[routeIndex];
      const nextPoint = vehicle.route[nextRouteIndex];
      
      // Calculate a position slightly closer to the next point
      const lng = currentPoint[0] + (nextPoint[0] - currentPoint[0]) * 0.1;
      const lat = currentPoint[1] + (nextPoint[1] - currentPoint[1]) * 0.1;
      
      // Calculate heading (angle)
      const dx = nextPoint[0] - currentPoint[0];
      const dy = nextPoint[1] - currentPoint[1];
      const heading = Math.atan2(dy, dx) * (180 / Math.PI);
      
      // Update marker position with animation
      const marker = vehicleMarkers[vehicle.id];
      if (marker) {
        updateVehiclePosition(marker, [lng, lat] as [number, number], 2000, heading);
      }
      
      // Update the store
      updateVehiclePos(vehicle.id, [lng, lat], heading, vehicle.speed);
    });
  }, [mapInstance, isMapLoaded, vehicles, vehicleMarkers, updateVehiclePos, updateVehicleStatus]);

  // Add button to simulate movement
  const handleSimulateMovement = () => {
    simulateMovement();
  };

  // Handle selecting a vehicle from the list
  const handleVehicleClick = (vehicleId: string) => {
    selectVehicle(vehicleId);
    
    // Find the vehicle
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (vehicle && mapInstance) {
      // Fly to vehicle
      mapInstance.flyTo({
        center: vehicle.position,
        zoom: 12,
        duration: 1000
      });
    }
  };

  // Filtered vehicles for rendering
  const vehiclesToDisplay = filteredVehicles();

  return (
    <div className="fleet-overview-container">
      <Head>
        <title>Fleet Overview | LoadUp</title>
      </Head>
      
      {/* Load Mapbox GL JS Script */}
      <Script 
        src="https://api.mapbox.com/mapbox-gl-js/v2.14.1/mapbox-gl.js"
        onLoad={() => {
          console.log('Mapbox script loaded');
          setIsScriptLoaded(true);
        }}
        onError={() => {
          console.error('Failed to load Mapbox script');
          setError('Failed to load Mapbox script');
        }}
      />
      <link href="https://api.mapbox.com/mapbox-gl-js/v2.14.1/mapbox-gl.css" rel="stylesheet" />
      
      <div className="dashboard-layout">
        {/* Sidebar */}
        <div className="sidebar">
          <h1 className="title">Fleet Overview</h1>
          
          {/* Search input */}
          <div className="search-box">
            <input 
              type="text"
              placeholder="Search vehicles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          
          {/* Vehicle list */}
          <div className="vehicle-list">
            <h2 className="section-title">Vehicles ({vehiclesToDisplay.length})</h2>
            
            {vehiclesToDisplay.length === 0 ? (
              <div className="no-vehicles">No vehicles found</div>
            ) : (
              vehiclesToDisplay.map(vehicle => (
                <div 
                  key={vehicle.id}
                  className={`vehicle-item ${selectedVehicleId === vehicle.id ? 'selected' : ''}`}
                  onClick={() => handleVehicleClick(vehicle.id)}
                >
                  <div className="vehicle-name">{vehicle.name}</div>
                  <div className={`vehicle-status status-${vehicle.status}`}>
                    {vehicle.status}
                  </div>
                  <div className="vehicle-info">
                    <div className="vehicle-speed">
                      {vehicle.speed > 0 ? `${vehicle.speed} mph` : 'Stopped'}
                    </div>
                    <div className="vehicle-update">
                      Last update: {new Date(vehicle.lastUpdate).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Simulation controls */}
          <div className="controls">
            <button 
              className="simulate-button"
              onClick={handleSimulateMovement}
              disabled={!isMapLoaded}
            >
              Simulate Movement
            </button>
          </div>
        </div>
        
        {/* Map area */}
        <div className="map-area">
          {/* Map status overlay */}
          <div className="map-status">
            {error && <div className="error-message">Error: {error}</div>}
            {!isScriptLoaded && !error && <div className="loading-message">Loading Mapbox script...</div>}
            {isScriptLoaded && !token && !error && <div className="loading-message">Loading token...</div>}
            {isScriptLoaded && token && !isMapLoaded && !error && (
              <div className="loading-message">Initializing map...</div>
            )}
          </div>
          
          {/* Map container */}
          <div 
            ref={mapContainerRef} 
            className="map-container" 
          />
          
          {/* Selected vehicle details */}
          {selectedVehicle && (
            <div className="vehicle-details">
              <h2 className="details-title">{selectedVehicle.name}</h2>
              <div className="details-content">
                <div className="details-row">
                  <span className="details-label">Status:</span>
                  <span className={`details-value status-${selectedVehicle.status}`}>
                    {selectedVehicle.status}
                  </span>
                </div>
                <div className="details-row">
                  <span className="details-label">Speed:</span>
                  <span className="details-value">
                    {selectedVehicle.speed > 0 ? `${selectedVehicle.speed} mph` : 'Stopped'}
                  </span>
                </div>
                <div className="details-row">
                  <span className="details-label">Heading:</span>
                  <span className="details-value">{Math.round(selectedVehicle.heading)}°</span>
                </div>
                <div className="details-row">
                  <span className="details-label">Last Update:</span>
                  <span className="details-value">
                    {new Date(selectedVehicle.lastUpdate).toLocaleTimeString()}
                  </span>
                </div>
                <div className="details-row">
                  <span className="details-label">Position:</span>
                  <span className="details-value">
                    {selectedVehicle.position[1].toFixed(4)}, {selectedVehicle.position[0].toFixed(4)}
                  </span>
                </div>
                {selectedVehicle.driver && (
                  <div className="details-row">
                    <span className="details-label">Driver:</span>
                    <span className="details-value">{selectedVehicle.driver.name}</span>
                  </div>
                )}
                {selectedVehicle.vehicle && (
                  <div className="details-row">
                    <span className="details-label">Vehicle Type:</span>
                    <span className="details-value">{selectedVehicle.vehicle.type}</span>
                  </div>
                )}
              </div>
              <button 
                className="close-button"
                onClick={() => selectVehicle(null)}
              >
                ×
              </button>
            </div>
          )}
        </div>
      </div>
      
      <style jsx>{`
        .fleet-overview-container {
          width: 100%;
          height: 100vh;
          display: flex;
          flex-direction: column;
        }
        
        .dashboard-layout {
          display: flex;
          flex: 1;
          height: calc(100vh - 60px);
        }
        
        .sidebar {
          width: 320px;
          background-color: #f8fafc;
          border-right: 1px solid #e2e8f0;
          padding: 20px;
          display: flex;
          flex-direction: column;
        }
        
        .title {
          font-size: 1.5rem;
          font-weight: bold;
          margin-bottom: 20px;
          color: #1e293b;
        }
        
        .search-box {
          margin-bottom: 20px;
        }
        
        .search-input {
          width: 100%;
          padding: 10px;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          font-size: 14px;
        }
        
        .vehicle-list {
          flex: 1;
          overflow-y: auto;
        }
        
        .section-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 10px;
          color: #475569;
        }
        
        .vehicle-item {
          padding: 12px;
          border-radius: 4px;
          background-color: white;
          margin-bottom: 10px;
          cursor: pointer;
          border: 1px solid #e2e8f0;
          transition: all 0.2s;
        }
        
        .vehicle-item:hover {
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          border-color: #cbd5e1;
        }
        
        .vehicle-item.selected {
          border-color: #3b82f6;
          background-color: #eff6ff;
        }
        
        .vehicle-name {
          font-weight: 600;
          font-size: 15px;
          margin-bottom: 4px;
        }
        
        .vehicle-status {
          display: inline-block;
          font-size: 12px;
          padding: 2px 8px;
          border-radius: 100px;
          margin-bottom: 8px;
        }
        
        .status-delivering {
          background-color: #dbeafe;
          color: #1d4ed8;
        }
        
        .status-loading {
          background-color: #fef3c7;
          color: #b45309;
        }
        
        .status-idle {
          background-color: #e5e7eb;
          color: #4b5563;
        }
        
        .status-delivered {
          background-color: #d1fae5;
          color: #047857;
        }
        
        .vehicle-info {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #6b7280;
        }
        
        .controls {
          margin-top: 20px;
        }
        
        .simulate-button {
          width: 100%;
          padding: 10px;
          background-color: #3b82f6;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.2s;
        }
        
        .simulate-button:hover {
          background-color: #2563eb;
        }
        
        .simulate-button:disabled {
          background-color: #93c5fd;
          cursor: not-allowed;
        }
        
        .map-area {
          flex: 1;
          position: relative;
        }
        
        .map-status {
          position: absolute;
          top: 20px;
          left: 20px;
          z-index: 10;
          padding: 8px 12px;
          background-color: white;
          border-radius: 4px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .error-message {
          color: #ef4444;
          font-weight: 500;
        }
        
        .loading-message {
          color: #3b82f6;
        }
        
        .map-container {
          width: 100%;
          height: 100%;
        }
        
        .vehicle-details {
          position: absolute;
          bottom: 20px;
          right: 20px;
          width: 300px;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          padding: 16px;
        }
        
        .details-title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 12px;
          color: #1e293b;
        }
        
        .details-content {
          margin-bottom: 12px;
        }
        
        .details-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        
        .details-label {
          color: #64748b;
          font-size: 14px;
        }
        
        .details-value {
          font-weight: 500;
          font-size: 14px;
        }
        
        .close-button {
          position: absolute;
          top: 12px;
          right: 12px;
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #64748b;
        }
        
        .close-button:hover {
          color: #1e293b;
        }
        
        .no-vehicles {
          padding: 40px 0;
          text-align: center;
          color: #64748b;
          font-style: italic;
        }
      `}</style>
    </div>
  );
} 