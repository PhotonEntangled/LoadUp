import React, { useRef, useState, useEffect, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Local implementation of the token utility since we can't import from the main project
// This matches the implementation in src/utils/mapbox-token.ts
const FALLBACK_PUBLIC_TOKEN = 'pk.eyJ1IjoibG9hZHVwIiwiYSI6ImNsbTUxcWVsajJnOXAzZG83cHo1bjB5dWYifQ.8Fh30KBunCj-FlP2E7hGUw';

const getMapboxPublicToken = (): string => {
  // Check all potential token environment variables
  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  const publicToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const mappingToken = process.env.NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN;
  
  // Use the first available token with fallback
  return accessToken || publicToken || mappingToken || FALLBACK_PUBLIC_TOKEN;
};

// Get Mapbox token using the local utility function
const MAPBOX_ACCESS_TOKEN = getMapboxPublicToken();

// Apply the token immediately to ensure it's available globally
if (MAPBOX_ACCESS_TOKEN) {
  mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
  console.log('[MapboxMap] Global access token set');
}

// Define Map region type
export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

// Define MapStyle options
export type MapStyle = 
  | 'streets-v12'  // Default street map
  | 'light-v11'    // Light theme for logistics views
  | 'dark-v11'     // Dark theme
  | 'satellite-v9' // Satellite imagery
  | 'satellite-streets-v12' // Satellite with street overlay
  | 'navigation-day-v1'     // Navigation optimized for day
  | 'navigation-night-v1';  // Navigation optimized for night

export interface MapboxMapProps {
  // Initial center position
  initialCenter?: {
    latitude: number;
    longitude: number;
  };
  // Initial zoom level (0-22)
  initialZoom?: number;
  // Map style
  mapStyle?: MapStyle;
  // Map container style
  style?: React.CSSProperties;
  // Container className
  className?: string;
  // Whether to show user location
  showUserLocation?: boolean;
  // Whether to show navigation controls
  showNavigation?: boolean;
  // Whether to show fullscreen control
  showFullscreen?: boolean;
  // Whether to show scale
  showScale?: boolean;
  // Optional callbacks
  onMapLoad?: (map: mapboxgl.Map) => void;
  onMapMove?: (center: { latitude: number; longitude: number }) => void;
  onMapClick?: (e: mapboxgl.MapMouseEvent) => void;
  onError?: (error: Error) => void;
}

// Memoized component to prevent unnecessary re-renders
const MapboxMap: React.FC<MapboxMapProps> = React.memo(({
  initialCenter = { latitude: 3.1390, longitude: 101.6869 }, // Default: Kuala Lumpur
  initialZoom = 12,
  mapStyle = 'streets-v12',
  style = { width: '100%', height: '100%' }, // Changed default to 100% height
  className = '',
  showUserLocation = false,
  showNavigation = true,
  showFullscreen = false,
  showScale = true,
  onMapLoad,
  onMapMove,
  onMapClick,
  onError,
}) => {
  // Refs for the map container element
  const mapContainer = useRef<HTMLDivElement>(null);
  // Ref for the map instance
  const map = useRef<mapboxgl.Map | null>(null);
  // State for tracking if the map has loaded
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  // State for tracking errors
  const [error, setError] = useState<Error | null>(null);
  // Ref to track if token has been checked (to prevent checking on every render)
  const tokenCheckedRef = useRef<boolean>(false);
  // Ref to track if we're initializing the map (to prevent multiple initialization attempts)
  const initializingRef = useRef<boolean>(false);
  // Track initialization attempts
  const [initAttempts, setInitAttempts] = useState(0);

  // Check if Mapbox token is available only once on initial render
  useEffect(() => {
    // Skip if we've already checked the token
    if (tokenCheckedRef.current) return;
    
    // Mark as checked so this only runs once
    tokenCheckedRef.current = true;
    
    if (!MAPBOX_ACCESS_TOKEN) {
      const tokenError = new Error('Mapbox access token is not defined. Please add NEXT_PUBLIC_MAPBOX_TOKEN to your environment variables.');
      console.error('[MapboxMap] ' + tokenError.message);
      setError(tokenError);
      if (onError) {
        onError(tokenError);
      }
    } else {
      console.log('[MapboxMap] Using Mapbox token: ' + MAPBOX_ACCESS_TOKEN.substring(0, 10) + '...');
      // Double-check global token is set
      if (mapboxgl.accessToken !== MAPBOX_ACCESS_TOKEN) {
        mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
        console.log('[MapboxMap] Re-set global access token');
      }
    }
  }, []); // Empty dependency array ensures this only runs once

  // Initialize map - highly stable memoized function with explicit dependencies
  const initializeMap = useCallback(() => {
    // Skip if we're already initializing, map exists, container is missing, or there's an error
    if (initializingRef.current || map.current || !mapContainer.current || error) {
      console.log('[MapboxMap] Skipping initialization:', { 
        isInitializing: initializingRef.current,
        hasMap: !!map.current,
        hasContainer: !!mapContainer.current,
        hasError: !!error 
      });
      return;
    }

    // Also skip if token is missing
    if (!MAPBOX_ACCESS_TOKEN) {
      console.error('[MapboxMap] Cannot initialize - token missing');
      return;
    }
    
    // Mark as initializing to prevent multiple initialization attempts
    initializingRef.current = true;
    console.log('[MapboxMap] Starting map initialization...');

    try {
      // Double-check global token is set
      if (mapboxgl.accessToken !== MAPBOX_ACCESS_TOKEN) {
        mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
        console.log('[MapboxMap] Re-set global access token before initialization');
      }

      // Create a new map instance
      const newMap = new mapboxgl.Map({
        container: mapContainer.current,
        style: `mapbox://styles/mapbox/${mapStyle}`,
        center: [initialCenter.longitude, initialCenter.latitude],
        zoom: initialZoom,
        attributionControl: true,
      });

      // Add navigation control if enabled
      if (showNavigation) {
        newMap.addControl(new mapboxgl.NavigationControl(), 'top-right');
      }

      // Add fullscreen control if enabled
      if (showFullscreen) {
        newMap.addControl(new mapboxgl.FullscreenControl(), 'top-right');
      }

      // Add scale control if enabled
      if (showScale) {
        newMap.addControl(new mapboxgl.ScaleControl(), 'bottom-left');
      }

      // Add geolocate control if user location is enabled
      if (showUserLocation) {
        newMap.addControl(
          new mapboxgl.GeolocateControl({
            positionOptions: {
              enableHighAccuracy: true,
            },
            trackUserLocation: true,
            showUserHeading: true,
          }),
          'top-right'
        );
      }

      // Set up event handlers
      newMap.on('load', () => {
        console.log('[MapboxMap] Map loaded successfully');
        setMapLoaded(true);
        
        // Store the map instance in the ref
        map.current = newMap;
        
        // Notify parent component
        if (onMapLoad) {
          console.log('[MapboxMap] Calling onMapLoad callback');
          onMapLoad(newMap);
        }
        
        // Reset initializing flag
        initializingRef.current = false;
      });

      newMap.on('move', () => {
        const center = newMap.getCenter();
        if (onMapMove) {
          onMapMove({
            latitude: center.lat,
            longitude: center.lng,
          });
        }
      });

      newMap.on('click', (e) => {
        if (onMapClick) onMapClick(e);
      });

      newMap.on('error', (e) => {
        initializingRef.current = false; // Reset initializing flag on error
        const mapError = new Error(`Mapbox error: ${e.error ? e.error.message : 'Unknown error'}`);
        console.error('[MapboxMap] Error during map operation:', e);
        setError(mapError);
        if (onError) onError(mapError);
      });

      // Temporary store the map instance - will be properly set after load
      map.current = newMap;
      
      // Set a timeout to detect if map fails to load
      const loadTimeout = setTimeout(() => {
        if (!mapLoaded && initializingRef.current) {
          console.warn('[MapboxMap] Map load timeout - attempting to recover');
          initializingRef.current = false;
          
          // Try again with another attempt, but only up to 2 retries
          if (initAttempts < 2) {
            setInitAttempts(prevAttempts => prevAttempts + 1);
          } else {
            const timeoutError = new Error('Map initialization timed out after multiple attempts');
            console.error('[MapboxMap] ' + timeoutError.message);
            setError(timeoutError);
            if (onError) onError(timeoutError);
          }
        }
      }, 10000); // 10 second timeout

      // Clear timeout on successful load
      newMap.once('load', () => {
        clearTimeout(loadTimeout);
      });
      
    } catch (initError) {
      initializingRef.current = false; // Reset initializing flag on error
      const mapInitError = initError instanceof Error 
        ? initError 
        : new Error('Failed to initialize Mapbox map');
      
      console.error('[MapboxMap] Initialization error:', mapInitError);
      setError(mapInitError);
      if (onError) onError(mapInitError);
    }
  }, [
    initialCenter.latitude,
    initialCenter.longitude,
    initialZoom,
    mapStyle,
    showUserLocation,
    showNavigation,
    showFullscreen,
    showScale,
    onMapLoad,
    onMapMove,
    onMapClick,
    onError,
    error,
    mapLoaded,
    initAttempts,
  ]);

  // Initialize map effect with proper dependencies
  useEffect(() => {
    // Only run initialization if we have a token and if map isn't already initialized
    if (MAPBOX_ACCESS_TOKEN && !mapLoaded && !error && !initializingRef.current) {
      console.log('[MapboxMap] Setting up map initialization');
      
      // Add small timeout to ensure DOM is ready
      const timeoutId = setTimeout(() => {
        console.log('[MapboxMap] DOM ready, initializing map');
        initializeMap();
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
    
    // Cleanup function
    return () => {
      if (map.current) {
        console.log('[MapboxMap] Cleaning up map');
        map.current.remove();
        map.current = null;
        setMapLoaded(false);
      }
    };
  }, [initializeMap, error, mapLoaded, initAttempts]);

  // Handle map resize on window resize
  useEffect(() => {
    const handleResize = () => {
      if (map.current) {
        map.current.resize();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Render the map container - memoized for stability
  return (
    <div className={`mapbox-container ${className}`} style={style}>
      {error ? (
        <div className="map-error-container p-4 bg-red-50 text-red-700 rounded">
          <p className="map-error-message">
            Failed to load map: {error.message}
          </p>
        </div>
      ) : (
        <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      )}
    </div>
  );
});

// Set display name for debugging
MapboxMap.displayName = 'MapboxMap';

export default MapboxMap; 