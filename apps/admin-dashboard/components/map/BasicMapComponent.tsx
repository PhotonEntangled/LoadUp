import React, { useRef, useState, useEffect } from 'react';
import Map, { NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface BasicMapProps {
  initialViewState?: {
    longitude: number;
    latitude: number;
    zoom: number;
  };
  mapStyle?: string;
}

const BasicMapComponent: React.FC<BasicMapProps> = ({
  initialViewState = {
    longitude: -74.006,
    latitude: 40.7128,
    zoom: 11
  },
  mapStyle = 'mapbox://styles/mapbox/streets-v12'
}) => {
  const [viewState, setViewState] = useState(initialViewState);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch the token from the API endpoint
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await fetch('/api/mapbox-token');
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch Mapbox token');
        }
        
        const data = await response.json();
        setMapboxToken(data.token);
      } catch (err) {
        console.error('Error fetching Mapbox token:', err);
        setError(err instanceof Error ? err.message : 'Failed to load map token');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchToken();
  }, []);
  
  const handleViewStateChange = (evt: any) => {
    setViewState(evt.viewState);
  };

  // Show loading state
  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Loading map...</div>;
  }

  // Show error state
  if (error || !mapboxToken) {
    return (
      <div className="flex items-center justify-center bg-red-100 text-red-800 p-4 h-full">
        <div>
          <h3 className="font-bold">Error loading map</h3>
          <p>{error || 'Failed to load Mapbox token'}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Map
        {...viewState}
        style={{ width: '100%', height: '100%' }}
        mapStyle={mapStyle}
        onMove={handleViewStateChange}
        mapboxAccessToken={mapboxToken}
      >
        <NavigationControl position="top-right" />
      </Map>
    </div>
  );
};

export default BasicMapComponent; 