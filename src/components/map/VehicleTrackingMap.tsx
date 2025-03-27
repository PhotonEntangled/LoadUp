import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useUnifiedVehicleStore } from '../../store/useUnifiedVehicleStore';
import { Vehicle } from '../../types/vehicle';
import { createVehicleMarkerElement, createVehiclePopupElement } from '../../utils/map/vehicleMarkerUtils';
import styles from './SimulatedVehicleMap.module.css';
import { getMapboxPublicToken } from '../../utils/mapbox-token';

// Get token from the centralized utility instead of directly from env vars
const MAPBOX_TOKEN = getMapboxPublicToken();

// IMPORTANT: Define store access functions outside of component render cycle
const getVehiclesFromStore = () => {
  console.log('[VehicleTrackingMap] Getting vehicles from store (outside render cycle)');
  return useUnifiedVehicleStore.getState().vehicles;
};

const getSelectedVehicleIdFromStore = () => {
  console.log('[VehicleTrackingMap] Getting selectedVehicleId from store (outside render cycle)');
  return useUnifiedVehicleStore.getState().selectedVehicleId;
};

const selectVehicleInStore = (id: string) => {
  console.log(`[VehicleTrackingMap] Selecting vehicle in store: ${id} (outside render cycle)`);
  useUnifiedVehicleStore.getState().selectVehicle(id);
};

interface Viewport {
  center: [number, number];
  zoom: number;
  bearing: number;
  pitch: number;
}

interface VehicleTrackingMapProps {
  height?: string;
  width?: string;
  showFilters?: boolean;
  onMapLoad?: (mapId: string) => void;
  onError?: (error: Error) => void;
  initialCenter?: { latitude: number; longitude: number };
  initialZoom?: number;
  onVehicleSelect?: (vehicleId: string) => void;
}

/**
 * VehicleTrackingMap Component
 * 
 * A map component that displays vehicle locations using Mapbox GL.
 * Incorporates important logic from the FleetOverviewMapV2 component.
 */
const VehicleTrackingMap: React.FC<VehicleTrackingMapProps> = ({
  height = '500px',
  width = '100%',
  showFilters = false,
  onMapLoad,
  onError,
  initialCenter = { latitude: 3.1402, longitude: 101.6869 }, // Kuala Lumpur
  initialZoom = 12,
  onVehicleSelect,
}) => {
  console.log('[VehicleTrackingMap] Component rendering');
  
  // Debug render count
  const renderCount = useRef(0);
  renderCount.current++;
  console.log(`[VehicleTrackingMap] Render #${renderCount.current}`);

  // Refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Record<string, mapboxgl.Marker>>({});
  const popupsRef = useRef<Record<string, mapboxgl.Popup>>({});
  
  // State
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isCssLoaded, setIsCssLoaded] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [mapError, setMapError] = useState<Error | null>(null);

  // IMPORTANT: Use refs instead of state for vehicles data to avoid re-renders
  const vehiclesRef = useRef<Record<string, Vehicle>>({});
  const selectedVehicleIdRef = useRef<string | null>(null);
  
  // Update vehicle data only when the map loads, not on every render
  useEffect(() => {
    if (!isMapLoaded) return;
    
    console.log('[VehicleTrackingMap] Updating vehicle data from store');
    vehiclesRef.current = getVehiclesFromStore();
    selectedVehicleIdRef.current = getSelectedVehicleIdFromStore();
  }, [isMapLoaded]);

  // Create stable vehicle selection handler
  const handleVehicleSelect = useCallback((id: string) => {
    console.log(`[VehicleTrackingMap] Vehicle selected: ${id}`);
    if (onVehicleSelect) {
      onVehicleSelect(id);
    } else {
      selectVehicleInStore(id);
    }
  }, [onVehicleSelect]);

  // Create a stable marker update function with useCallback
  const updateMarkers = useCallback(() => {
    if (!mapRef.current || !isMapLoaded) {
      console.log('[VehicleTrackingMap] Map not ready, skipping marker update');
      return;
    }

    // Get vehicles from ref to avoid triggering re-renders
    const vehicles = Object.values(vehiclesRef.current);
    console.log(`[VehicleTrackingMap] Updating markers for ${vehicles.length} vehicles`);
    
    const map = mapRef.current;
    const currentMarkerIds = new Set(Object.keys(markersRef.current));
    
    // Process each vehicle
    vehicles.forEach(vehicle => {
      // Skip vehicles without location
      if (!vehicle.location) return;
      
      const { id } = vehicle;
      const { latitude, longitude } = vehicle.location;
      
      // Check if marker already exists
      if (currentMarkerIds.has(id)) {
        // Update existing marker position
        markersRef.current[id].setLngLat([longitude, latitude]);
        currentMarkerIds.delete(id);
      } else {
        // Create new marker
        const markerElement = createVehicleMarkerElement(vehicle);
        const marker = new mapboxgl.Marker({ element: markerElement })
          .setLngLat([longitude, latitude])
          .addTo(map);
        
        // Create popup but don't add to map yet
        const popupElement = createVehiclePopupElement(vehicle);
        const popup = new mapboxgl.Popup({ closeButton: true, closeOnClick: true })
          .setDOMContent(popupElement);
        
        // Add click handler to marker
        marker.getElement().addEventListener('click', () => {
          // Close any open popups
          Object.values(popupsRef.current).forEach(p => p.remove());
          
          // Show this popup
          marker.setPopup(popup);
          popup.addTo(map);
          
          // Use the stable callback
          handleVehicleSelect(id);
        });
        
        // Store references
        markersRef.current[id] = marker;
        popupsRef.current[id] = popup;
      }
    });
    
    // Remove markers for vehicles no longer in the list
    currentMarkerIds.forEach(id => {
      if (markersRef.current[id]) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
      if (popupsRef.current[id]) {
        popupsRef.current[id].remove();
        delete popupsRef.current[id];
      }
    });
    
    // If a vehicle is selected, ensure its popup is shown
    if (selectedVehicleIdRef.current && markersRef.current[selectedVehicleIdRef.current]) {
      const marker = markersRef.current[selectedVehicleIdRef.current];
      const popup = popupsRef.current[selectedVehicleIdRef.current];
      
      if (popup) {
        marker.setPopup(popup);
        popup.addTo(map);
      }
    }
  }, [isMapLoaded, handleVehicleSelect]); // Only depend on map loaded state and the stable callback

  // IMPORTANT: Subscribe to Zustand manually for vehicle changes
  useEffect(() => {
    console.log('[VehicleTrackingMap] Setting up store subscription');
    
    // Standard Zustand subscription pattern (no extra parameters)
    const unsubscribe = useUnifiedVehicleStore.subscribe((state) => {
      // Get vehicles directly from the store and update ref
      const storeVehicles = state.vehicles;
      if (vehiclesRef.current !== storeVehicles) {
        console.log('[VehicleTrackingMap] Vehicle update from store subscription');
        vehiclesRef.current = storeVehicles;
        window.requestAnimationFrame(updateMarkers);
      }
    });
    
    // Initialize immediately
    vehiclesRef.current = useUnifiedVehicleStore.getState().vehicles;
    window.requestAnimationFrame(updateMarkers);
    
    return unsubscribe;
  }, [updateMarkers]); // Added updateMarkers to dependencies

  // Check if mapboxgl has been correctly loaded
  useEffect(() => {
    // Check for existing Mapbox script and CSS
    const existingScript = document.querySelector('script[src*="mapbox-gl.js"]');
    const existingCSS = document.querySelector('link[href*="mapbox-gl.css"]');
    
    if (existingScript) {
      setIsScriptLoaded(true);
    }
    
    if (existingCSS) {
      setIsCssLoaded(true);
    }
    
    // Set access token
    if (mapboxgl) {
      try {
        mapboxgl.accessToken = MAPBOX_TOKEN;
        setHasToken(true);
      } catch (err) {
        console.error('[VehicleTrackingMap] Error setting Mapbox token:', err);
        if (onError) onError(new Error('Failed to set Mapbox token'));
      }
    }
  }, [onError]);

  // Initial viewport
  const initialViewport: Viewport = useMemo(() => ({
    center: [initialCenter.longitude, initialCenter.latitude],
    zoom: initialZoom,
    bearing: 0,
    pitch: 0
  }), [initialCenter.longitude, initialCenter.latitude, initialZoom]);

  // Initialize map
  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current || !isScriptLoaded || !hasToken) return;

    try {
      // Create map
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: initialViewport.center,
        zoom: initialViewport.zoom,
        bearing: initialViewport.bearing,
        pitch: initialViewport.pitch,
        failIfMajorPerformanceCaveat: false,
        preserveDrawingBuffer: true
      });

      // Add navigation control
      map.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Save reference
      mapRef.current = map;

      // Handle load
      map.on('load', () => {
        console.log('[VehicleTrackingMap] Map loaded successfully');
        setIsMapLoaded(true);
        if (onMapLoad && map.getCanvasContainer) {
          onMapLoad(map.getCanvasContainer().id);
        }
      });

      // Handle errors
      map.on('error', (e: any) => {
        console.error('[VehicleTrackingMap] Map error:', e);
        const errorMessage = e.error?.message || 'Unknown map error';
        setMapError(new Error(errorMessage));
        if (onError) onError(new Error(errorMessage));
      });

    } catch (err) {
      console.error('[VehicleTrackingMap] Error initializing map:', err);
      const error = err instanceof Error ? err : new Error('Unknown error initializing map');
      setMapError(error);
      if (onError) onError(error);
    }

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      // Clear all markers and popups
      Object.values(markersRef.current).forEach(marker => marker.remove());
      Object.values(popupsRef.current).forEach(popup => popup.remove());
      markersRef.current = {};
      popupsRef.current = {};
    };
  }, [initialViewport, onMapLoad, onError, isScriptLoaded, hasToken]);

  // Render error state if map fails to load
  if (mapError) {
    return (
      <div className={styles.errorContainer} style={{ height, width }}>
        <p>Failed to load map: {mapError.message}</p>
        <button onClick={() => window.location.reload()}>Reload</button>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', height, width }}>
      <div 
        ref={mapContainerRef} 
        className={styles.mapContainer}
        style={{ height, width }}
      />
      {!isMapLoaded && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading map...</p>
        </div>
      )}
    </div>
  );
};

export default React.memo(VehicleTrackingMap); 