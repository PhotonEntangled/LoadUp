/**
 * Hook for handling map events with proper cleanup
 */
import { useCallback, useEffect, useRef } from 'react';
// Removed: useMapViewStore - use mapManager from utils/maps/MapManager instead '../../store/map/useMapViewStore';
import { useVehicleStore } from '../../store/map/useVehicleStore';
import { Coordinate } from '../../utils/map/boundingBox';

interface MapInstance {
  on: (event: string, handler: Function) => void;
  off: (event: string, handler: Function) => void;
  getCenter: () => { lng: number; lat: number };
  getZoom: () => number;
  getBearing: () => number;
  getPitch: () => number;
  [key: string]: any;
}

interface MapEventsOptions {
  // Enable/disable specific event handlers
  enableViewportSync?: boolean;
  enableVehicleSelection?: boolean;
  enableZoomControls?: boolean;
  
  // Callbacks
  onMapClick?: (lngLat: [number, number]) => void;
  onMapDrag?: () => void;
  onMapZoom?: (zoom: number) => void;
  onViewportChange?: (viewport: {
    center: [number, number];
    zoom: number;
    bearing: number;
    pitch: number;
  }) => void;
  onVehicleSelect?: (vehicleId: string | null) => void;
  
  /**
   * Optional callback when a vehicle marker is clicked
   */
  onVehicleClick?: (vehicleId: string) => void;
  
  /**
   * Optional callback when a popup is closed
   */
  onPopupClose?: () => void;
  
  /**
   * Optional callback when the map is moved
   */
  onMapMove?: (center: [number, number], zoom: number) => void;
}

const DEFAULT_OPTIONS: MapEventsOptions = {
  enableViewportSync: true,
  enableVehicleSelection: true,
  enableZoomControls: true,
  onMapClick: undefined,
  onMapDrag: undefined,
  onMapZoom: undefined,
  onViewportChange: undefined,
  onVehicleSelect: undefined,
  onVehicleClick: undefined,
  onPopupClose: undefined,
  onMapMove: undefined,
};

/**
 * Hook to handle map events in a consistent way
 * This centralizes event handling logic for map interactions
 */
export const useMapEvents = (
  mapInstance: any | null,
  options: MapEventsOptions = {}
) => {
  const { 
    onVehicleClick, 
    onPopupClose, 
    onMapMove, 
    onMapClick
  } = options;

  // Use a ref to access the selectVehicle function from the store
  const selectVehicleRef = useRef<(id: string | null) => void>(() => {});
  
  // Update the ref when the component mounts
  useEffect(() => {
    selectVehicleRef.current = useVehicleStore.getState().selectVehicle;
    
    // Also subscribe to store changes to keep the ref updated
    const unsubscribe = useVehicleStore.subscribe(
      () => {
        selectVehicleRef.current = useVehicleStore.getState().selectVehicle;
      }
    );
    
    return unsubscribe;
  }, []);
  
  // Keep track of previous map instance for cleanup
  const prevMapRef = useRef<any | null>(null);
  
  // Handle vehicle marker clicks
  const handleVehicleMarkerClick = useCallback((e: MouseEvent) => {
    // Find the closest vehicle marker element
    const marker = findClosestWithClass(e.target as HTMLElement, 'vehicle-marker');
    
    if (marker) {
      const vehicleId = marker.getAttribute('data-vehicle-id');
      
      if (vehicleId) {
        // Select the vehicle in the store using the ref
        selectVehicleRef.current(vehicleId);
        
        // Call optional callback
        if (onVehicleClick) {
          onVehicleClick(vehicleId);
        }
        
        // Prevent map click
        e.stopPropagation();
      }
    }
  }, [onVehicleClick]);
  
  // Handle map popup close
  const handlePopupClose = useCallback(() => {
    // Deselect vehicle when popup is closed using the ref
    selectVehicleRef.current(null);
    
    // Call optional callback
    if (onPopupClose) {
      onPopupClose();
    }
  }, [onPopupClose]);
  
  // Handle map movement
  const handleMapMove = useCallback(() => {
    if (!mapInstance) return;
    
    const center = mapInstance.getCenter();
    const zoom = mapInstance.getZoom();
    
    // Call optional callback
    if (onMapMove) {
      onMapMove([center.lng, center.lat], zoom);
    }
  }, [mapInstance, onMapMove]);
  
  // Handle map clicks
  const handleMapClick = useCallback((e: any) => {
    // Call optional callback
    if (onMapClick && e.lngLat) {
      onMapClick([e.lngLat.lng, e.lngLat.lat]);
    }
  }, [onMapClick]);
  
  // Set up event listeners when map instance changes
  useEffect(() => {
    // Clean up previous event listeners if map instance changed
    if (prevMapRef.current && prevMapRef.current !== mapInstance) {
      // Clean up any global event listeners
      document.removeEventListener('click', handleVehicleMarkerClick);
      
      // Clean up map-specific event listeners
      if (onMapMove) {
        prevMapRef.current.off('move', handleMapMove);
        prevMapRef.current.off('zoom', handleMapMove);
      }
      
      if (onMapClick) {
        prevMapRef.current.off('click', handleMapClick);
      }
    }
    
    // Set up new event listeners if map instance exists
    if (mapInstance) {
      // Set up global event listeners for marker clicks
      // We use document level listeners to catch clicks on markers which are outside the map element
      document.addEventListener('click', handleVehicleMarkerClick);
      
      // Set up map-specific event listeners
      if (onMapMove) {
        mapInstance.on('move', handleMapMove);
        mapInstance.on('zoom', handleMapMove);
      }
      
      if (onMapClick) {
        mapInstance.on('click', handleMapClick);
      }
      
      // Update ref for next cleanup
      prevMapRef.current = mapInstance;
    }
    
    // Clean up all event listeners on unmount
    return () => {
      document.removeEventListener('click', handleVehicleMarkerClick);
      
      if (mapInstance) {
        if (onMapMove) {
          mapInstance.off('move', handleMapMove);
          mapInstance.off('zoom', handleMapMove);
        }
        
        if (onMapClick) {
          mapInstance.off('click', handleMapClick);
        }
      }
    };
  }, [
    mapInstance, 
    handleVehicleMarkerClick, 
    handleMapMove, 
    handleMapClick, 
    onMapMove, 
    onMapClick
  ]);
  
  return {
    handleVehicleMarkerClick,
    handlePopupClose,
    handleMapMove,
    handleMapClick
  };
};

/**
 * Utility function to find closest parent element with a specific class
 */
function findClosestWithClass(element: HTMLElement | null, className: string): HTMLElement | null {
  if (!element) return null;
  
  if (element.classList && element.classList.contains(className)) {
    return element;
  }
  
  return findClosestWithClass(element.parentElement, className);
}

export default useMapEvents; 