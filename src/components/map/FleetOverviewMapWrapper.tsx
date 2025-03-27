import React, { useState, useEffect, useRef } from 'react';
import { Vehicle } from '../../store/map/useVehicleStore';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorBoundary from '../ui/ErrorBoundary';
import SimulatedVehicleMap from './SimulatedVehicleMap';
import mapboxgl from 'mapbox-gl';

// Helper to ensure consistent state between different map instances
const clearGlobalMapState = () => {
  if (typeof window !== 'undefined') {
    // Clear any global initialization flags
    if ((window as any).mapboxGlobalInit) {
      console.log('Clearing global mapbox initialization state');
      (window as any).mapboxGlobalInit = {
        scriptInitialized: false,
        cssInitialized: false,
        loadAttempted: false
      };
    }
    
    // Remove any lingering scripts or CSS that might be causing conflicts
    if (document) {
      const oldScripts = document.querySelectorAll('script[src*="mapbox-gl.js"]');
      const oldCss = document.querySelectorAll('link[href*="mapbox-gl.css"]');
      
      if (oldScripts.length > 1) {
        console.log(`Found ${oldScripts.length} mapbox scripts, cleaning up extras`);
        // Keep only the first one
        for (let i = 1; i < oldScripts.length; i++) {
          oldScripts[i].remove();
        }
      }
      
      if (oldCss.length > 1) {
        console.log(`Found ${oldCss.length} mapbox CSS links, cleaning up extras`);
        // Keep only the first one
        for (let i = 1; i < oldCss.length; i++) {
          oldCss[i].remove();
        }
      }
    }
  }
};

// Define the props interface matching what FleetOverviewMap expects
export interface FleetOverviewMapProps {
  initialVehicles?: Vehicle[];
  height?: string;
  width?: string;
  showFilters?: boolean;
  refreshInterval?: number;
  onVehicleClick?: (vehicle: Vehicle) => void;
  onError?: (error: Error) => void;
  forceInitialLoad?: boolean; // New prop to force initialization
  forceScriptReload?: boolean; // New prop to force script reloading
  containerClassName?: string; // Additional class for container styling
  onMapReady?: (map: mapboxgl.Map) => void;
}

interface MapProps {
  mapId?: string;
  initialCenter?: { lat: number; lng: number };
  initialZoom?: number;
  mapStyle?: string;
  className?: string;
  onMapLoad?: (map: mapboxgl.Map) => void;
  skipSync?: boolean;
  fitBoundsOnVehicleLoad?: boolean;
}

// Create a wrapper component that handles loading state and errors
const FleetOverviewMapWrapper: React.FC<FleetOverviewMapProps> = (props) => {
  const [isLoading, setIsLoading] = useState(true);
  const [mapError, setMapError] = useState<Error | null>(null);
  const [mapKey, setMapKey] = useState<string>(`map-${Date.now()}`);
  const [forceRender, setForceRender] = useState(0);
  const [containerReady, setContainerReady] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mapIdRef = useRef<string>('');

  // Calculate explicit dimensions immediately
  const mapHeight = props.height || '100%';
  const mapWidth = props.width || '100%';

  // Clear global state on initial mount
  useEffect(() => {
    if (props.forceScriptReload) {
      console.log('Forced script reload requested, clearing global map state');
      clearGlobalMapState();
    }
  }, [props.forceScriptReload]);

  // Force a remount if needed - this helps when the map gets stuck
  useEffect(() => {
    if (props.forceInitialLoad) {
      // Clear global state before remounting
      clearGlobalMapState();
      
      const timer = setTimeout(() => {
        // This creates a new instance and forces a clean mount
        setMapKey(`map-${Date.now()}`);
        setForceRender(prev => prev + 1);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [props.forceInitialLoad]);

  // Ensure wrapper has dimensions before loading map
  useEffect(() => {
    let containerCheckInterval: NodeJS.Timeout;
    
    const checkContainer = () => {
      if (wrapperRef.current) {
        // Force explicit size
        wrapperRef.current.style.height = typeof mapHeight === 'string' ? mapHeight : `${mapHeight}px`;
        wrapperRef.current.style.width = typeof mapWidth === 'string' ? mapWidth : `${mapWidth}px`;
        
        // Ensure minimum dimensions
        if (!wrapperRef.current.style.minHeight) {
          wrapperRef.current.style.minHeight = '400px';
        }
        
        if (!wrapperRef.current.style.minWidth) {
          wrapperRef.current.style.minWidth = '300px';
        }
        
        const width = wrapperRef.current.clientWidth;
        const height = wrapperRef.current.clientHeight;
        
        console.log('FleetOverviewMapWrapper dimensions check:', {
          height: wrapperRef.current.style.height,
          width: wrapperRef.current.style.width,
          clientHeight: height,
          clientWidth: width
        });
        
        // Only consider container ready if it has actual dimensions
        if (width > 0 && height > 0) {
          console.log('Container has valid dimensions, marking as ready');
          setContainerReady(true);
          setIsLoading(false);
          clearInterval(containerCheckInterval);
        } else {
          console.log('Container dimensions still invalid, forcing explicit dimensions');
          // Try forcing specific pixel dimensions if percentage values aren't working
          wrapperRef.current.style.height = '400px';
          wrapperRef.current.style.width = '100%';
        }
      }
    };
    
    // Check immediately
    checkContainer();
    
    // Keep checking until the container has proper dimensions
    containerCheckInterval = setInterval(checkContainer, 200);
    
    // Set a timeout to eventually show the map even if container isn't perfect
    const finalTimer = setTimeout(() => {
      clearInterval(containerCheckInterval);
      setContainerReady(true);
      setIsLoading(false);
    }, 2000);
    
    return () => {
      clearInterval(containerCheckInterval);
      clearTimeout(finalTimer);
    };
  }, [mapHeight, mapWidth, forceRender]);

  const handleError = (error: Error) => {
    console.error('Map error:', error);
    setMapError(error);
    if (props.onError) {
      props.onError(error);
    }
  };

  // Force a remount by changing the key if needed
  const handleRetry = () => {
    setMapError(null);
    setMapKey(`map-${Date.now()}`);
    setForceRender(prev => prev + 1);
  };

  if (isLoading) {
    return (
      <div 
        className={`flex items-center justify-center w-full h-full bg-gray-100 rounded-lg min-h-[400px] ${props.containerClassName || ''}`}
        style={{ 
          height: mapHeight, 
          width: mapWidth
        }}
      >
        <LoadingSpinner size="large" />
        <span className="ml-2 text-gray-600">Preparing map container...</span>
      </div>
    );
  }

  if (mapError) {
    return (
      <div className={`p-4 bg-red-50 border border-red-200 rounded-md text-red-700 ${props.containerClassName || ''}`}>
        <h3 className="font-semibold mb-2">Map Error</h3>
        <p>{mapError.message}</p>
        <button 
          className="mt-3 bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded text-sm"
          onClick={handleRetry}
        >
          Retry Loading Map
        </button>
      </div>
    );
  }

  // Extract props needed for SimulatedVehicleMap
  const mapV2Props: MapProps = {
    mapId: mapIdRef.current,
    className: 'w-full h-full',
    initialZoom: 10,
    initialCenter: { lat: 3.1390, lng: 101.6869 }, // Kuala Lumpur
    mapStyle: 'mapbox://styles/mapbox/streets-v11',
    onMapLoad: (map) => {
      console.log(`Map loaded: ${mapIdRef.current}`);
      if (props.onMapReady) props.onMapReady(map);
    }
  };

  return (
    <ErrorBoundary 
      fallback={<div className="p-4 text-red-500">Error loading map. Please try refreshing the page.</div>}
    >
      <div 
        ref={wrapperRef}
        className={`relative ${props.containerClassName || ''}`} 
        style={{ height: mapHeight, width: mapWidth }}
        data-testid="map-container"
      >
        {containerReady && (
          <ErrorBoundary>
            <SimulatedVehicleMap {...mapV2Props} />
          </ErrorBoundary>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default FleetOverviewMapWrapper; 