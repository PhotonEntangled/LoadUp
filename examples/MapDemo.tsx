import React, { useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxMap from '../packages/shared/src/components/MapboxMap.js';
import MapboxMarker from '../packages/shared/src/components/MapboxMarker.js';
import MapboxRoute, { RouteStop } from '../packages/shared/src/components/MapboxRoute.js';
import ShipmentTrackingMap, { ShipmentDetails } from '../packages/shared/src/components/ShipmentTrackingMap.js';

const MapDemo: React.FC = () => {
  // State to track the active map example
  const [activeExample, setActiveExample] = useState<'basic' | 'markers' | 'route' | 'tracking'>('basic');
  // State for map instance (for examples that need to reference it)
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  // State for showing a notification when a marker is clicked
  const [notification, setNotification] = useState<string | null>(null);
  
  // Handle map load
  const handleMapLoad = (mapInstance: mapboxgl.Map) => {
    setMap(mapInstance);
  };
  
  // Sample marker data for the markers example
  const sampleMarkers = [
    {
      id: 'depot-1',
      latitude: 3.1390,
      longitude: 101.6869,
      title: 'Main Depot',
      description: 'Kuala Lumpur Distribution Center',
      markerType: 'depot' as const,
      status: 'completed' as const,
    },
    {
      id: 'pickup-1',
      latitude: 3.1421,
      longitude: 101.6793,
      title: 'Pickup Location',
      description: 'KLCC Pickup Point',
      markerType: 'pickup' as const,
      status: 'completed' as const,
    },
    {
      id: 'delivery-1',
      latitude: 3.1209,
      longitude: 101.6542,
      title: 'Delivery Location',
      description: 'Petaling Jaya Delivery',
      markerType: 'delivery' as const,
      status: 'pending' as const,
    },
    {
      id: 'vehicle-1',
      latitude: 3.1300,
      longitude: 101.6700,
      title: 'Delivery Vehicle',
      description: 'Van #LVL-1234 - In Transit',
      markerType: 'vehicle' as const,
      status: 'in-progress' as const,
    },
  ];
  
  // Sample route stops for the route example
  const sampleRouteStops: RouteStop[] = [
    {
      id: 'depot-start',
      latitude: 3.1390,
      longitude: 101.6869,
      name: 'Main Depot',
      address: 'Kuala Lumpur Distribution Center',
      status: 'completed',
      stopType: 'depot',
      stopOrder: 0,
    },
    {
      id: 'pickup-1',
      latitude: 3.1421,
      longitude: 101.6793,
      name: 'Pickup Location 1',
      address: 'KLCC Pickup Point',
      status: 'completed',
      stopType: 'pickup',
      stopOrder: 1,
    },
    {
      id: 'pickup-2',
      latitude: 3.1310,
      longitude: 101.6890,
      name: 'Pickup Location 2',
      address: 'Bukit Bintang Pickup',
      status: 'arrived',
      stopType: 'pickup',
      stopOrder: 2,
    },
    {
      id: 'delivery-1',
      latitude: 3.1209,
      longitude: 101.6542,
      name: 'Delivery Location 1',
      address: 'Petaling Jaya Delivery',
      status: 'pending',
      stopType: 'delivery',
      stopOrder: 3,
    },
    {
      id: 'delivery-2',
      latitude: 3.0738,
      longitude: 101.5183,
      name: 'Delivery Location 2',
      address: 'Shah Alam Delivery',
      status: 'pending',
      stopType: 'delivery',
      stopOrder: 4,
    },
  ];
  
  // Sample shipment for the tracking example
  const sampleShipment: ShipmentDetails = {
    id: 'ship-123456',
    trackingNumber: 'LU-123456-MY',
    status: 'in-transit',
    origin: {
      name: 'Main Depot',
      address: 'Kuala Lumpur Distribution Center, 50450 KL',
      latitude: 3.1390,
      longitude: 101.6869,
    },
    destination: {
      name: 'Customer Office',
      address: 'Shah Alam Business Park, 40150 Shah Alam',
      latitude: 3.0738,
      longitude: 101.5183,
    },
    stops: [
      {
        id: 'stop-1',
        name: 'KLCC Pickup',
        address: 'Kuala Lumpur City Center, 50088 KL',
        latitude: 3.1421,
        longitude: 101.6793,
        type: 'pickup',
        status: 'completed',
        actualTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        order: 1,
      },
      {
        id: 'stop-2',
        name: 'Bukit Bintang Pickup',
        address: 'Pavilion Mall, Bukit Bintang, 55100 KL',
        latitude: 3.1310,
        longitude: 101.6890,
        type: 'pickup',
        status: 'completed',
        actualTime: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        order: 2,
      },
      {
        id: 'stop-3',
        name: 'Petaling Jaya Delivery',
        address: '1 Utama Shopping Center, 47800 Petaling Jaya',
        latitude: 3.1209,
        longitude: 101.6542,
        type: 'delivery',
        status: 'arrived',
        scheduledTime: new Date(Date.now() + 30 * 60 * 1000), // 30 mins from now
        order: 3,
      },
    ],
    vehicle: {
      id: 'van-1234',
      name: 'Van #1234',
      licensePlate: 'LVL-1234',
      type: 'van',
      currentLocation: {
        latitude: 3.1230,
        longitude: 101.6500,
        timestamp: new Date(),
        heading: 270, // Heading west
        speed: 40,
      },
    },
    estimatedDelivery: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours from now
    weight: '250kg',
    dimensions: '120cm x 80cm x 100cm',
    specialInstructions: 'Please call customer 15 minutes before delivery',
  };
  
  // Handle notification close
  const handleNotificationClose = () => {
    setNotification(null);
  };
  
  // Handle marker click - updated to accept MapMouseEvent
  const handleMarkerClick = (e: mapboxgl.MapMouseEvent) => {
    // Get the marker element
    const element = e.originalEvent.target as HTMLElement;
    const markerId = element.getAttribute('data-marker-id');
    
    if (!markerId) return;
    
    // Find the clicked marker/stop
    const clickedMarker = sampleMarkers.find(marker => marker.id === markerId);
    const clickedStop = sampleRouteStops.find(stop => stop.id === markerId);
    const clickedShipmentStop = sampleShipment.stops?.find(stop => stop.id === markerId);
    
    // Set notification message
    if (clickedMarker) {
      setNotification(`Clicked marker: ${clickedMarker.title}`);
    } else if (clickedStop) {
      setNotification(`Clicked stop: ${clickedStop.name}`);
    } else if (clickedShipmentStop) {
      setNotification(`Clicked shipment stop: ${clickedShipmentStop.name}`);
    } else if (markerId === `origin-${sampleShipment.id}`) {
      setNotification(`Clicked origin: ${sampleShipment.origin.name}`);
    } else if (markerId === `destination-${sampleShipment.id}`) {
      setNotification(`Clicked destination: ${sampleShipment.destination.name}`);
    } else if (markerId === `vehicle-${sampleShipment.vehicle?.id}`) {
      setNotification(`Clicked vehicle: ${sampleShipment.vehicle?.name}`);
    } else {
      setNotification(`Clicked unknown marker: ${markerId}`);
    }
    
    // Auto-close notification after 3 seconds
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Adapter for ShipmentTrackingMap's onMarkerClick which expects string
  const handleShipmentMarkerClick = (stopId: string) => {
    // Find the clicked marker/stop
    const clickedShipmentStop = sampleShipment.stops?.find(stop => stop.id === stopId);
    
    // Set notification message
    if (clickedShipmentStop) {
      setNotification(`Clicked shipment stop: ${clickedShipmentStop.name}`);
    } else if (stopId === `origin-${sampleShipment.id}`) {
      setNotification(`Clicked origin: ${sampleShipment.origin.name}`);
    } else if (stopId === `destination-${sampleShipment.id}`) {
      setNotification(`Clicked destination: ${sampleShipment.destination.name}`);
    } else if (stopId === `vehicle-${sampleShipment.vehicle?.id}`) {
      setNotification(`Clicked vehicle: ${sampleShipment.vehicle?.name}`);
    } else {
      setNotification(`Clicked unknown marker: ${stopId}`);
    }
    
    // Auto-close notification after 3 seconds
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  return (
    <div className="map-demo">
      <h1>LoadUp Map and Tracking Demo</h1>
      
      {/* Example selector */}
      <div className="example-selector">
        <h2>Select Example:</h2>
        <div className="button-group">
          <button 
            className={activeExample === 'basic' ? 'active' : ''} 
            onClick={() => setActiveExample('basic')}
          >
            Basic Map
          </button>
          <button 
            className={activeExample === 'markers' ? 'active' : ''} 
            onClick={() => setActiveExample('markers')}
          >
            Markers Example
          </button>
          <button 
            className={activeExample === 'route' ? 'active' : ''} 
            onClick={() => setActiveExample('route')}
          >
            Route Example
          </button>
          <button 
            className={activeExample === 'tracking' ? 'active' : ''} 
            onClick={() => setActiveExample('tracking')}
          >
            Shipment Tracking
          </button>
        </div>
      </div>
      
      {/* Notification display */}
      {notification && (
        <div className="notification">
          <span>{notification}</span>
          <button onClick={handleNotificationClose}>✕</button>
        </div>
      )}
      
      {/* Map examples */}
      <div className="map-container">
        {activeExample === 'basic' && (
          <div>
            <h2>Basic Map Example</h2>
            <p>Simple Mapbox map centered on Kuala Lumpur, Malaysia</p>
            <MapboxMap 
              initialCenter={{ latitude: 3.1390, longitude: 101.6869 }}
              initialZoom={12}
              mapStyle="streets-v12"
              style={{ width: '100%', height: '500px' }}
              showUserLocation={false}
              showNavigation={true}
              showFullscreen={true}
              showScale={true}
              onMapLoad={handleMapLoad}
            />
          </div>
        )}
        
        {activeExample === 'markers' && (
          <div>
            <h2>Markers Example</h2>
            <p>Demonstrates different marker types (depot, pickup, delivery, vehicle)</p>
            <MapboxMap 
              initialCenter={{ latitude: 3.1300, longitude: 101.6700 }}
              initialZoom={13}
              mapStyle="light-v11"
              style={{ width: '100%', height: '500px' }}
              showNavigation={true}
              onMapLoad={handleMapLoad}
            />
            
            {map && sampleMarkers.map(marker => (
              <MapboxMarker
                key={marker.id}
                map={map}
                id={marker.id}
                latitude={marker.latitude}
                longitude={marker.longitude}
                title={marker.title}
                description={marker.description}
                markerType={marker.markerType}
                status={marker.status}
                showPopup={true}
                onClick={handleMarkerClick}
              />
            ))}
          </div>
        )}
        
        {activeExample === 'route' && (
          <div>
            <h2>Route Example</h2>
            <p>Demonstrates a route with multiple stops, including markers and route path</p>
            <MapboxMap 
              initialCenter={{ latitude: 3.1300, longitude: 101.6700 }}
              initialZoom={12}
              mapStyle="light-v11"
              style={{ width: '100%', height: '500px' }}
              showNavigation={true}
              onMapLoad={handleMapLoad}
            />
            
            {map && (
              <>
                {/* Add markers for each stop */}
                {sampleRouteStops.map(stop => (
                  <MapboxMarker
                    key={stop.id}
                    map={map}
                    id={stop.id}
                    latitude={stop.latitude}
                    longitude={stop.longitude}
                    title={stop.name || ''}
                    description={stop.address || ''}
                    markerType={stop.stopType}
                    status={stop.status}
                    showPopup={true}
                    onClick={handleMarkerClick}
                  />
                ))}
                
                {/* Add route between stops */}
                <MapboxRoute
                  map={map}
                  stops={sampleRouteStops}
                  optimizeRoute={false}
                  showRouteSimulation={true}
                  simulationSpeed={10}
                  onETACalculated={(stopsWithETA) => {
                    console.log('ETAs calculated:', stopsWithETA);
                  }}
                />
              </>
            )}
          </div>
        )}
        
        {activeExample === 'tracking' && (
          <div>
            <h2>Shipment Tracking Example</h2>
            <p>Full shipment tracking view with origin, stops, destination, and vehicle tracking</p>
            <ShipmentTrackingMap
              shipment={sampleShipment}
              mapStyle="light-v11"
              style={{ width: '100%', height: '500px' }}
              optimizeRoute={false}
              showStopMarkers={true}
              showVehicle={true}
              autoCenterMap={true}
              animateVehicle={false}
              onMarkerClick={handleShipmentMarkerClick}
              onRouteCalculated={(stopsWithETA) => {
                console.log('Route calculated with ETAs:', stopsWithETA);
              }}
            />
          </div>
        )}
      </div>
      
      {/* Add some basic styling */}
      <style>
        {`
        .map-demo {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }
        
        h1 {
          color: #1a365d;
          margin-bottom: 30px;
        }
        
        h2 {
          color: #2d4a8a;
          margin-bottom: 10px;
        }
        
        .example-selector {
          margin-bottom: 20px;
        }
        
        .button-group {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }
        
        button {
          padding: 8px 16px;
          background-color: #edf2f7;
          border: 1px solid #cbd5e0;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s ease;
        }
        
        button.active, button:hover {
          background-color: #4299e1;
          color: white;
          border-color: #4299e1;
        }
        
        .map-container {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .notification {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 12px 20px;
          background-color: #4299e1;
          color: white;
          border-radius: 4px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          z-index: 1000;
        }
        
        .notification button {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          font-size: 16px;
          padding: 0;
        }
        `}
      </style>
    </div>
  );
};

export default MapDemo; 