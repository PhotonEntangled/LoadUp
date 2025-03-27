import React, { useEffect, useRef } from 'react';
// @ts-ignore
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import SimulationControls from '../../components/simulation/SimulationControls';
import { useSimulationStore, useActiveVehicles } from '../../store/useSimulationStore';
import { SimulationVehicle } from '../../types/simulation';

const SimulationPage: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  
  const vehicles = useActiveVehicles() as SimulationVehicle[];
  
  // Initialize the map
  useEffect(() => {
    const fetchMapToken = async () => {
      try {
        // Fetch token from the API
        const response = await fetch('/api/mapbox-token');
        const data = await response.json();
        
        if (!data.token) {
          console.error('Failed to load Mapbox token');
          return;
        }
        
        if (!mapContainerRef.current) return;
        
        // Initialize map
        (mapboxgl as any).accessToken = data.token;
        const map = new (mapboxgl as any).Map({
          container: mapContainerRef.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [101.6869, 3.139], // Kuala Lumpur coordinates
          zoom: 11
        });
        
        // Add navigation controls
        map.addControl(new (mapboxgl as any).NavigationControl(), 'top-right');
        
        // Add scale control
        map.addControl(new (mapboxgl as any).ScaleControl(), 'bottom-right');
        
        // Save the map reference
        mapRef.current = map;
        
        // Clean up on unmount
        return () => {
          // Remove all markers
          Object.values(markersRef.current).forEach(marker => marker.remove());
          markersRef.current = {};
          
          // Remove the map
          map.remove();
          mapRef.current = null;
        };
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };
    
    fetchMapToken();
  }, []);
  
  // Update markers when vehicles change
  useEffect(() => {
    if (!mapRef.current) return;
    
    // First, get the set of current vehicle IDs
    const currentVehicleIds = new Set(vehicles.map(v => v.id));
    
    // Remove markers for vehicles that no longer exist
    Object.keys(markersRef.current).forEach(id => {
      if (!currentVehicleIds.has(id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });
    
    // Update or add markers for current vehicles
    vehicles.forEach(vehicle => {
      // Create marker elements
      const createMarkerElement = (vehicle: SimulationVehicle): HTMLDivElement => {
        const el = document.createElement('div');
        el.className = 'vehicle-marker';
        el.style.width = '24px';
        el.style.height = '24px';
        el.style.borderRadius = '50%';
        el.style.background = vehicle.type === 'truck' 
          ? '#f59e0b' // Amber for trucks
          : vehicle.type === 'van' 
            ? '#6366f1' // Indigo for vans
            : '#a855f7'; // Purple for motorcycles
        el.style.boxShadow = '0 0 0 2px white, 0 0 0 4px rgba(0,0,0,0.1)';
        el.style.cursor = 'pointer';
        el.style.transform = `rotate(${vehicle.heading}deg)`;
        el.innerHTML = '<div style="width: 40%; height: 4px; background: white; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(90deg);"></div>';
        
        return el;
      };
      
      // Check if marker already exists
      if (markersRef.current[vehicle.id]) {
        // Update existing marker
        markersRef.current[vehicle.id]
          .setLngLat([vehicle.location.longitude, vehicle.location.latitude])
          .getElement().style.transform = `rotate(${vehicle.heading}deg)`;
      } else {
        // Create new marker
        const marker = new (mapboxgl as any).Marker({
          element: createMarkerElement(vehicle),
          anchor: 'center'
        })
          .setLngLat([vehicle.location.longitude, vehicle.location.latitude])
          .setPopup(
            new (mapboxgl as any).Popup({ offset: 25 }).setHTML(`
              <div>
                <h3 style="font-weight: bold">${vehicle.type.toUpperCase()} ${vehicle.id.slice(0, 6)}</h3>
                <p>Status: ${vehicle.status}</p>
                <p>Speed: ${vehicle.speed.toFixed(1)} km/h</p>
                ${vehicle.driver ? `<p>Driver: ${vehicle.driver.name}</p>` : ''}
                ${vehicle.route ? `<p>Stops: ${vehicle.route.stops.length}</p>` : ''}
              </div>
            `)
          )
          .addTo(mapRef.current);
        
        // Store the marker reference
        markersRef.current[vehicle.id] = marker;
      }
    });
  }, [vehicles]);
  
  return (
    <div className="h-screen flex flex-col">
      <div className="bg-gray-800 text-white p-4">
        <h1 className="text-2xl font-bold">LoadUp Simulation</h1>
      </div>
      
      <div className="flex-1 flex">
        {/* Map container */}
        <div className="flex-1 relative" ref={mapContainerRef}></div>
        
        {/* Sidebar */}
        <div className="w-80 bg-gray-100 shadow-lg p-4 overflow-y-auto flex flex-col">
          <SimulationControls className="mb-4" />
          
          <div className="flex-1 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-2">Active Vehicles: {vehicles.length}</h3>
            
            {vehicles.map(vehicle => (
              <div
                key={vehicle.id}
                className="bg-white rounded shadow mb-2 p-3"
                onClick={() => {
                  useSimulationStore.getState().selectVehicle(vehicle.id);
                  
                  // Focus map on the vehicle
                  if (mapRef.current) {
                    mapRef.current.flyTo({
                      center: [vehicle.location.longitude, vehicle.location.latitude],
                      zoom: 15,
                      speed: 2
                    });
                  }
                }}
              >
                <div className="flex items-center mb-1">
                  <div
                    className="w-4 h-4 rounded-full mr-2"
                    style={{
                      background: vehicle.type === 'truck' 
                        ? '#f59e0b' // Amber for trucks
                        : vehicle.type === 'van' 
                          ? '#6366f1' // Indigo for vans
                          : '#a855f7' // Purple for motorcycles
                    }}
                  ></div>
                  <span className="font-medium">{vehicle.type.toUpperCase()} {vehicle.id.slice(0, 6)}</span>
                </div>
                <div className="text-sm text-gray-600">
                  <div>Status: {vehicle.status}</div>
                  <div>Speed: {vehicle.speed.toFixed(1)} km/h</div>
                  {vehicle.driver && <div>Driver: {vehicle.driver.name}</div>}
                  {vehicle.route && (
                    <div>
                      Stops: {vehicle.route.currentStopIndex + 1}/{vehicle.route.stops.length}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {vehicles.length === 0 && (
              <div className="text-gray-500 text-center italic p-4">
                No active vehicles. Add some using the controls above.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulationPage; 