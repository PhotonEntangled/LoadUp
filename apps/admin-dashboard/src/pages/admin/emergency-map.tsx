import React, { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import Script from 'next/script';
import { createMapWithErrorHandling, cleanupMap, addMarkers, fitMapToCoordinates, MarkerInfo } from '../../utils/mapboxHelper';

// Sample test data for markers
const TEST_MARKERS: MarkerInfo[] = [
  { id: 'marker-1', lngLat: [-95.7129, 37.0902] as [number, number], popupContent: '<h3>Test Location 1</h3><p>USA center point</p>' },
  { id: 'marker-2', lngLat: [-122.4194, 37.7749] as [number, number], popupContent: '<h3>San Francisco</h3><p>Test Location</p>' },
  { id: 'marker-3', lngLat: [-74.0060, 40.7128] as [number, number], popupContent: '<h3>New York</h3><p>Test Location</p>' },
];

export default function EmergencyMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

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
        center: [-95.7129, 37.0902],
        zoom: 3.5,
      },
      (map) => {
        console.log('Map initialized successfully');
        setMapInstance(map);
        setIsMapLoaded(true);
        
        // Add test markers
        const markers = addMarkers(map, TEST_MARKERS);
        
        // Fit map to include all markers
        fitMapToCoordinates(map, TEST_MARKERS.map(m => m.lngLat));
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

  return (
    <div className="emergency-map-container">
      <Head>
        <title>Emergency Map | LoadUp</title>
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
      
      <div className="map-status">
        {error && <div className="error-message">Error: {error}</div>}
        {!isScriptLoaded && !error && <div className="loading-message">Loading Mapbox script...</div>}
        {isScriptLoaded && !token && !error && <div className="loading-message">Loading token...</div>}
        {isScriptLoaded && token && !isMapLoaded && !error && <div className="loading-message">Initializing map...</div>}
      </div>
      
      <div 
        ref={mapContainerRef} 
        className="map-container" 
        style={{ width: '100%', height: '600px', borderRadius: '8px' }} 
      />
      
      <style jsx>{`
        .emergency-map-container {
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .map-status {
          height: 2rem;
        }
        
        .error-message {
          color: #ef4444;
          font-weight: bold;
        }
        
        .loading-message {
          color: #3b82f6;
        }
        
        .map-container {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
      `}</style>
    </div>
  );
}

// Add types for mapboxgl global
declare global {
  interface Window {
    mapboxgl: any;
  }
} 