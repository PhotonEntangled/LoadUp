import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';

// Define marker types - align with ERD schema
export type MarkerType = 'pickup' | 'delivery' | 'vehicle' | 'depot' | 'waypoint' | 'custom' | 'simulated-vehicle';

// Define marker status for tracking - align with ERD schema and types
export type MarkerStatus = 'pending' | 'in-progress' | 'completed' | 'delayed' | 'failed' 
  | 'arrived' | 'departed' | 'skipped' | 'loading' | 'unloading' | 'moving' | 'idle' | 'maintenance' | 'delivered'; // Added to match ERD schema and simulation

export interface MarkerStyleOptions {
  color?: string;
  size?: number;
  pulseEffect?: boolean;
  icon?: string; // URL or data URI for custom icon
  rotation?: number;
  emoji?: string; // Emoji character to display
  fontSize?: number; // Font size for emoji
  anchor?: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export interface MapboxMarkerProps {
  // Required props
  map: mapboxgl.Map;
  longitude: number;
  latitude: number;
  
  // Marker identification and content
  id: string;
  title?: string;
  description?: string;
  
  // Marker type and status
  markerType?: MarkerType;
  status?: MarkerStatus;
  
  // Styling
  styleOptions?: MarkerStyleOptions;
  
  // Custom HTML element for the marker
  element?: HTMLElement;
  
  // Events
  onClick?: (e: mapboxgl.MapMouseEvent) => void;
  onDragEnd?: (lngLat: mapboxgl.LngLat) => void;
  onMarkerCreated?: (marker: mapboxgl.Marker, cleanup: () => void) => void;
  
  // Other options
  draggable?: boolean;
  showPopup?: boolean;
  popupOffset?: number;
  // Add support for route data
  routeData?: {
    id: string;
    type: string;
    coordinates: [number, number][];
    color: string;
    width: number;
    glow?: boolean; // Add support for glow effect
  };
  // Add support for zoom-dependent styling
  zoomDependent?: boolean;
  minZoom?: number; // Minimum zoom level for full details
  maxZoom?: number; // Maximum zoom level for full details
}

// Default style options based on marker type and status
const getDefaultStyleOptions = (
  markerType: MarkerType,
  status: MarkerStatus,
): MarkerStyleOptions => {
  // Base styles by marker type
  const baseStyles: Record<MarkerType, MarkerStyleOptions> = {
    pickup: { color: '#2196F3', size: 30 }, // Blue
    delivery: { color: '#4CAF50', size: 30 }, // Green
    vehicle: { color: '#FFC107', size: 40, pulseEffect: true }, // Yellow with pulse
    depot: { color: '#9C27B0', size: 35 }, // Purple
    waypoint: { color: '#FF5722', size: 25 }, // Orange for waypoints
    custom: { color: '#607D8B', size: 30 }, // Gray
    'simulated-vehicle': { 
      color: '#00BFFF', // Neon blue for simulated vehicles
      size: 50, 
      pulseEffect: true,
      emoji: '🚚',
      fontSize: 24
    }
  };

  // Status modifiers
  const statusModifiers: Record<MarkerStatus, Partial<MarkerStyleOptions>> = {
    pending: { pulseEffect: false },
    'in-progress': { pulseEffect: true },
    arrived: { pulseEffect: true, color: '#03A9F4' }, // Light blue for arrived
    departed: { color: '#9E9E9E' }, // Gray for departed 
    completed: { color: '#4CAF50' }, // Always green when completed
    delayed: { color: '#FF9800' }, // Orange when delayed
    failed: { color: '#F44336' }, // Red when failed
    skipped: { color: '#9E9E9E', size: 20 }, // Gray and smaller for skipped
    // Add simulation-specific statuses
    loading: { color: '#00BFFF', pulseEffect: true, emoji: '🚚' }, // Neon blue with truck emoji
    unloading: { color: '#4CAF50', pulseEffect: true, emoji: '🚚' }, // Green with truck emoji
    moving: { color: '#00BFFF', pulseEffect: true, emoji: '🚚' }, // Neon blue with truck emoji
    idle: { color: '#FFC107', emoji: '🚚' }, // Yellow with truck emoji
    maintenance: { color: '#F44336', emoji: '🔧' }, // Red with wrench emoji
    delivered: { color: '#4CAF50', emoji: '✅' } // Green with checkmark emoji
  };

  return {
    ...baseStyles[markerType],
    ...statusModifiers[status],
  };
};

// Implement a local version of the CSS fix function instead of importing
// from outside the shared package
const MARKER_STYLES_ID = 'mapbox-marker-visibility-fixes-shared';
const DEBUG_STYLES_ID = 'mapbox-marker-extreme-debug-shared';

// Local implementation of CSS fixes to avoid cross-package dependencies
const injectMarkerCSS = (debug = false): void => {
  // Constants needed for the CSS
  const Z_INDEX_MARKERS_BASE = 100;
  const DEFAULT_MARKER_SIZE = 40;
  
  // Base CSS for markers
  const CRITICAL_MARKER_CSS = `
    /* Base map container fixes */
    .mapboxgl-map {
      position: relative !important;
      overflow: visible !important;
      width: 100% !important;
      height: 100% !important;
      visibility: visible !important;
      opacity: 1 !important;
    }
    
    /* Marker visibility fixes */
    .mapboxgl-marker {
      position: absolute !important;
      visibility: visible !important;
      display: block !important;
      opacity: 1 !important;
      z-index: ${Z_INDEX_MARKERS_BASE} !important;
      transform-origin: bottom center !important;
      pointer-events: auto !important;
    }
    
    /* Fix transformation for centered markers */
    .mapboxgl-marker-anchor-center {
      transform: translate(-50%, -50%) !important;
    }
    
    /* Make marker contents visible */
    .mapboxgl-marker > div {
      visibility: visible !important;
      opacity: 1 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    }
    
    /* Force canvas visibility */
    .mapboxgl-canvas-container {
      visibility: visible !important;
      opacity: 1 !important;
    }
    
    .mapboxgl-canvas {
      visibility: visible !important;
      opacity: 1 !important;
    }
  `;
  
  // Debug CSS for extreme visibility
  const DEBUG_MARKER_CSS = `
    /* EXTREME DEBUG STYLES */
    .mapboxgl-marker {
      transform: scale(1.5) !important;
      z-index: ${Z_INDEX_MARKERS_BASE + 1000} !important;
      visibility: visible !important;
      opacity: 1 !important;
      position: absolute !important;
      display: block !important;
    }
    
    .mapboxgl-marker > div {
      background-color: #FF00FF !important; /* Bright magenta */
      border: 3px solid #FFFFFF !important;
      box-shadow: 0 0 10px 2px rgba(0,0,0,0.5) !important;
      width: ${DEFAULT_MARKER_SIZE}px !important;
      height: ${DEFAULT_MARKER_SIZE}px !important;
      visibility: visible !important;
      opacity: 1 !important;
      position: relative !important;
      font-size: 24px !important;
    }
  `;
  
  // Add base fixes if not already present
  if (!document.getElementById(MARKER_STYLES_ID)) {
    const style = document.createElement('style');
    style.id = MARKER_STYLES_ID;
    style.textContent = CRITICAL_MARKER_CSS;
    document.head.appendChild(style);
    console.log('[MapboxMarker] Injected critical CSS fixes');
  }
  
  // Add debug styles if requested and not already present
  if (debug && !document.getElementById(DEBUG_STYLES_ID)) {
    const debugStyle = document.createElement('style');
    debugStyle.id = DEBUG_STYLES_ID;
    debugStyle.textContent = DEBUG_MARKER_CSS;
    document.head.appendChild(debugStyle);
    console.log('[MapboxMarker] Injected debug CSS fixes');
  }
};

// Use our local implementation
const ensureMapContainerStyles = (mapContainer: HTMLElement | null) => {
  if (!mapContainer) return;
  
  try {
    // Ensure proper positioning context for markers
    mapContainer.style.position = 'relative';
    mapContainer.style.overflow = 'hidden';
    
    // Use local CSS injection utility
    injectMarkerCSS(true);
  } catch (error) {
    console.error('[MapboxMarker] Error applying container style fix:', error);
  }
};

const MapboxMarker: React.FC<MapboxMarkerProps> = ({
  map,
  longitude,
  latitude,
  id,
  title = '',
  description = '',
  markerType = 'custom',
  status = 'pending',
  styleOptions = {},
  element,
  onClick,
  onDragEnd,
  onMarkerCreated,
  draggable = false,
  showPopup = false,
  popupOffset = 25,
  routeData,
  zoomDependent = false,
  minZoom = 11,
  maxZoom = 15,
}) => {
  // Combine default style with provided style options
  const mergedStyleOptions = {
    ...getDefaultStyleOptions(markerType, status),
    ...styleOptions,
  };

  // Reference to the marker instance
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  // Reference to the popup instance
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  // Reference to the route line
  const routeLineRef = useRef<string | null>(null);
  // Reference to the pin element for zoom-dependent styling
  const pinElementRef = useRef<HTMLDivElement | null>(null);
  // State to track if the marker is mounted on the map
  const [isMounted, setIsMounted] = useState(false);
  // State to track current zoom level
  const [currentZoom, setCurrentZoom] = useState(map ? map.getZoom() : 0);
  // Track map ready state
  const [isMapReady, setIsMapReady] = useState(false);
  // Retry counter for initialization
  const [initAttempts, setInitAttempts] = useState(0);

  // Check if map is ready
  useEffect(() => {
    // If we already have a valid map instance, mark as ready
    if (map && map.loaded()) {
      console.log(`[MapboxMarker] Map is already loaded for marker ${id}`);
      setIsMapReady(true);
      return;
    }
    
    // If map is provided but not loaded yet, wait for it
    if (map && !map.loaded()) {
      console.log(`[MapboxMarker] Waiting for map to load for marker ${id}`);
      
      const onMapLoad = () => {
        console.log(`[MapboxMarker] Map loaded for marker ${id}`);
        setIsMapReady(true);
        map.off('load', onMapLoad);
      };
      
      map.on('load', onMapLoad);
      
      // Safety timeout - try to create marker even if load event never fires
      const safetyTimeout = setTimeout(() => {
        if (!isMapReady) {
          console.warn(`[MapboxMarker] Map load timeout for marker ${id}, attempting to create marker anyway`);
          setIsMapReady(true);
        }
      }, 2000);
      
      return () => {
        clearTimeout(safetyTimeout);
        map.off('load', onMapLoad);
      };
    }
    
    // If no map provided, log error
    if (!map) {
      console.error(`[MapboxMarker] No map instance provided for marker ${id}`);
    }
  }, [map, id, isMapReady]);

  // Create a custom HTML element for the marker if not provided
  const createMarkerElement = useCallback(() => {
    if (element) return element;

    console.log(`[MapboxMarker] Creating custom element for marker ${id} with type ${markerType} and status ${status}`);

    const el = document.createElement('div');
    el.className = `mapbox-marker marker-${markerType} status-${status}`;
    el.style.width = `${mergedStyleOptions.size}px`;
    el.style.height = `${mergedStyleOptions.size}px`;
    el.style.borderRadius = '50%';
    el.style.backgroundColor = mergedStyleOptions.color || '#000000';
    el.style.border = '2px solid #FFFFFF';
    el.style.cursor = 'pointer';
    el.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.3)';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';
    
    // CRITICAL FIX: Set proper CSS positioning for marker elements
    // Use absolute positioning instead of relative to ensure markers appear correctly
    el.style.position = 'absolute';
    
    // CRITICAL FIX: Ensure marker is always visible with proper z-index
    el.style.zIndex = '1000'; // High z-index to ensure visibility
    el.style.visibility = 'visible';
    el.style.opacity = '1';
    
    // Add data attributes for accessibility and testing
    el.setAttribute('data-marker-id', id);
    el.setAttribute('data-marker-type', markerType);
    el.setAttribute('data-marker-status', status);

    // Add pulse effect if enabled
    if (mergedStyleOptions.pulseEffect) {
      el.style.animation = 'pulse 2s infinite';
      
      // Add a style element for the pulse animation if it doesn't exist
      if (!document.getElementById('marker-pulse-style')) {
        const style = document.createElement('style');
        style.id = 'marker-pulse-style';
        style.innerHTML = `
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.8; }
            100% { transform: scale(1); opacity: 1; }
          }
        `;
        document.head.appendChild(style);
      }
    }

    // For simulated vehicle or custom markers, add the pin shape when zoomed out
    if ((markerType === 'simulated-vehicle' || markerType === 'vehicle') && zoomDependent) {
      // Create pin point at bottom if zoomed out
      const pin = document.createElement('div');
      pin.className = 'mapbox-marker-pin';
      pin.style.position = 'absolute';
      pin.style.bottom = '-8px';
      pin.style.left = '50%';
      pin.style.transform = 'translateX(-50%)';
      pin.style.width = '0';
      pin.style.height = '0';
      pin.style.borderLeft = '8px solid transparent';
      pin.style.borderRight = '8px solid transparent';
      pin.style.borderTop = `8px solid ${mergedStyleOptions.color || '#000000'}`;
      pin.style.zIndex = '-1';
      
      // Add the pin to the marker only if below max zoom
      if (currentZoom < maxZoom) {
        el.appendChild(pin);
      }
      
      // Store the reference
      pinElementRef.current = pin;
    }

    // Use emoji if provided
    if (mergedStyleOptions.emoji) {
      el.textContent = mergedStyleOptions.emoji;
      el.style.fontSize = `${mergedStyleOptions.fontSize || 24}px`;
      el.style.textAlign = 'center';
      
      // Add emoji shadow for better visibility
      el.style.textShadow = '0 1px 3px rgba(0, 0, 0, 0.8)';
      
      console.log(`[MapboxMarker] Created marker with emoji ${mergedStyleOptions.emoji}`);
    }
    // Use custom icon if provided and no emoji
    else if (mergedStyleOptions.icon) {
      el.style.backgroundImage = `url(${mergedStyleOptions.icon})`;
      el.style.backgroundSize = 'cover';
      el.style.backgroundColor = 'transparent';
    }

    // Add title for accessibility
    if (title) {
      el.setAttribute('title', title);
    }

    return el;
  }, [
    element,
    id,
    markerType,
    status,
    mergedStyleOptions,
    currentZoom,
    maxZoom,
    title,
    zoomDependent
  ]);

  // Create popup content
  const createPopupContent = useCallback(() => {
    if (!title && !description) return null;

    const container = document.createElement('div');
    container.className = 'mapbox-marker-popup';
    container.style.padding = '8px';
    container.style.maxWidth = '300px';

    if (title) {
      const titleEl = document.createElement('h3');
      titleEl.className = 'mapbox-marker-popup-title';
      titleEl.textContent = title;
      titleEl.style.margin = '0 0 4px 0';
      titleEl.style.fontSize = '16px';
      titleEl.style.fontWeight = 'bold';
      container.appendChild(titleEl);
    }

    if (description) {
      const descEl = document.createElement('p');
      descEl.className = 'mapbox-marker-popup-description';
      descEl.textContent = description;
      descEl.style.margin = '0';
      descEl.style.fontSize = '14px';
      container.appendChild(descEl);
    }

    // Add status badge if available
    if (status) {
      const statusEl = document.createElement('div');
      statusEl.className = `mapbox-marker-popup-status status-${status}`;
      statusEl.textContent = status.charAt(0).toUpperCase() + status.slice(1);
      statusEl.style.marginTop = '8px';
      statusEl.style.display = 'inline-block';
      statusEl.style.padding = '2px 6px';
      statusEl.style.borderRadius = '4px';
      statusEl.style.fontSize = '12px';
      statusEl.style.fontWeight = 'bold';
      
      // Set background color based on status
      switch (status) {
        case 'completed':
        case 'delivered':
        case 'unloading':
          statusEl.style.backgroundColor = '#E8F5E9'; // Light green
          statusEl.style.color = '#2E7D32'; // Dark green
          break;
        case 'moving':
          statusEl.style.backgroundColor = '#E3F2FD'; // Light blue
          statusEl.style.color = '#1565C0'; // Dark blue
          break;
        case 'delayed':
        case 'pending':
          statusEl.style.backgroundColor = '#FFF8E1'; // Light yellow
          statusEl.style.color = '#F57F17'; // Dark yellow
          break;
        case 'failed':
        case 'maintenance':
          statusEl.style.backgroundColor = '#FFEBEE'; // Light red
          statusEl.style.color = '#C62828'; // Dark red
          break;
        default:
          statusEl.style.backgroundColor = '#ECEFF1'; // Light gray
          statusEl.style.color = '#455A64'; // Dark gray
      }
      
      container.appendChild(statusEl);
    }

    return container;
  }, [title, description, status]);

  // Add route line to the map if route data is provided
  const addRouteLine = useCallback(() => {
    if (!routeData || !map || !map.loaded()) return;
    
    // Let's first try to clean up any existing route with the same ID to prevent duplicates
    removeRouteLine();
    
    try {
      const sourceId = `route-source-${routeData.id}`;
      const layerId = `route-layer-${routeData.id}`;
      routeLineRef.current = layerId;

      console.log(`[MapboxMarker] Adding route line ${layerId} for marker ${id}`);
      console.log(`[MapboxMarker] Route details:`, {
        color: routeData.color,
        width: routeData.width,
        coordinates: routeData.coordinates.length > 0 
          ? `${routeData.coordinates.length} points, first: [${routeData.coordinates[0]}]` 
          : 'No coordinates'
      });

      // Skip if invalid coordinates
      if (!routeData.coordinates || routeData.coordinates.length < 2) {
        console.warn(`[MapboxMarker] Invalid route coordinates for marker ${id}`);
        return;
      }

      // Check if the source already exists and remove it to ensure fresh data
      if (map.getSource(sourceId)) {
        if (map.getLayer(layerId)) {
          map.removeLayer(layerId);
        }
        map.removeSource(sourceId);
      }

      // Add source with fresh data
      map.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: routeData.coordinates
          }
        }
      });

      // Create paint properties with optional glow effect
      const paintProps: mapboxgl.LinePaint = {
        'line-color': routeData.color || '#00FF00', // Default to bright green
        'line-width': routeData.width || 5, // Thicker line by default
        'line-opacity': 0.8
      };
      
      // Add glow effect if requested
      if (routeData.glow) {
        paintProps['line-blur'] = routeData.width ? routeData.width / 2 : 2.5;
      }
      
      map.addLayer({
        id: layerId,
        type: 'line',
        source: sourceId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: paintProps
      });
      
      console.log(`[MapboxMarker] Route line ${layerId} added successfully`);
    } catch (error) {
      console.error(`[MapboxMarker] Error adding route line for marker ${id}:`, error);
    }
  }, [routeData, map, id]);

  // Remove route line from the map
  const removeRouteLine = useCallback(() => {
    if (!routeLineRef.current || !map || !map.loaded()) return;
    
    try {
      const layerId = routeLineRef.current;
      const sourceId = layerId.replace('layer', 'source');
      
      if (map.getLayer(layerId)) {
        map.removeLayer(layerId);
        console.log(`[MapboxMarker] Removed route layer ${layerId}`);
      }
      
      if (map.getSource(sourceId)) {
        map.removeSource(sourceId);
        console.log(`[MapboxMarker] Removed route source ${sourceId}`);
      }
      
      routeLineRef.current = null;
    } catch (error) {
      console.error(`[MapboxMarker] Error removing route line for marker ${id}:`, error);
    }
  }, [map, id]);

  // Update marker style based on zoom level
  const updateMarkerStyle = useCallback(() => {
    if (!zoomDependent || !markerRef.current || !map || !map.loaded()) return;
  
    const zoom = map.getZoom();
    setCurrentZoom(zoom);
    
    const markerElement = markerRef.current.getElement();
    
    // Low zoom (far away) - show as pin
    if (zoom < minZoom) {
      markerElement.style.width = `${(mergedStyleOptions.size || 30) * 0.6}px`;
      markerElement.style.height = `${(mergedStyleOptions.size || 30) * 0.6}px`;
      
      // Ensure the pin is displayed
      if (pinElementRef.current && !markerElement.contains(pinElementRef.current)) {
        markerElement.appendChild(pinElementRef.current);
      }
      
      // Make emoji smaller or hide it
      if (mergedStyleOptions.emoji) {
        markerElement.style.fontSize = `${(mergedStyleOptions.fontSize || 24) * 0.5}px`;
      }
    } 
    // Medium zoom
    else if (zoom < maxZoom) {
      markerElement.style.width = `${(mergedStyleOptions.size || 30) * 0.8}px`;
      markerElement.style.height = `${(mergedStyleOptions.size || 30) * 0.8}px`;
      
      // Ensure the pin is displayed
      if (pinElementRef.current && !markerElement.contains(pinElementRef.current)) {
        markerElement.appendChild(pinElementRef.current);
      }
      
      // Adjust emoji size
      if (mergedStyleOptions.emoji) {
        markerElement.style.fontSize = `${(mergedStyleOptions.fontSize || 24) * 0.7}px`;
      }
    } 
    // High zoom (close up) - show full marker
    else {
      markerElement.style.width = `${mergedStyleOptions.size || 30}px`;
      markerElement.style.height = `${mergedStyleOptions.size || 30}px`;
      
      // Remove pin for clean look
      if (pinElementRef.current && markerElement.contains(pinElementRef.current)) {
        markerElement.removeChild(pinElementRef.current);
      }
      
      // Full emoji size
      if (mergedStyleOptions.emoji) {
        markerElement.style.fontSize = `${mergedStyleOptions.fontSize || 24}px`;
      }
    }
  }, [map, minZoom, maxZoom, zoomDependent, mergedStyleOptions]);

  // Update marker position
  useEffect(() => {
    if (!markerRef.current || !map || !map.loaded() || !isMounted) return;
    
    try {
      markerRef.current.setLngLat([longitude, latitude]);
    } catch (error) {
      console.error(`[MapboxMarker] Error updating position for marker ${id}:`, error);
    }
  }, [latitude, longitude, id, map, isMounted]);

  // Create and add marker to map
  useEffect(() => {
    // Don't try to create the marker until the map is ready
    if (!isMapReady || !map) {
      if (initAttempts < 5) {  // FIXED: Increased retry attempts from 3 to 5
        // Set up retry after delay
        const retryTimeout = setTimeout(() => {
          console.log(`[MapboxMarker] Retry ${initAttempts + 1} for marker ${id}`);
          setInitAttempts(prev => prev + 1);
        }, 1000);  // FIXED: Increased timeout from 500ms to 1000ms
        
        return () => clearTimeout(retryTimeout);
      } else if (initAttempts === 5) {
        console.error(`[MapboxMarker] Failed to initialize marker ${id} after multiple attempts`);
      }
      return;
    }
    
    // FIXED: Double-check marker ref to prevent issues on refresh
    if (markerRef.current) {
      // Instead of returning, try removing the existing marker and creating a new one
      try {
        console.log(`[MapboxMarker] Removing existing marker for ${id} and creating new one`);
        markerRef.current.remove();
        markerRef.current = null;
      } catch (error) {
        console.error(`[MapboxMarker] Error removing existing marker for ${id}:`, error);
        return; // Only return if we can't remove the existing marker
      }
    }
    
    // Let's verify again if the map is properly loaded
    if (!map.loaded()) {
      console.warn(`[MapboxMarker] Map not fully loaded yet for marker ${id}, but proceeding anyway`);
    }
    
    console.log(`[MapboxMarker] Creating marker ${id} at ${latitude}, ${longitude} with type ${markerType}`);
    
    // FIXED: Apply container styling fixes - CRITICAL FOR VISIBILITY
    try {
      // Add global styles for map container
      ensureMapContainerStyles(map.getContainer());
    } catch (error) {
      console.error(`[MapboxMarker] Container style fix error:`, error);
    }
    
    try {
      // Create marker element
      const el = createMarkerElement();
      
      // FIXED: Add data attributes for debugging
      el.setAttribute('data-marker-id', id);
      el.setAttribute('data-marker-type', markerType);
      el.setAttribute('data-marker-status', status);
      el.style.position = 'absolute';
      el.style.visibility = 'visible';
      el.style.display = 'flex';
      el.style.opacity = '1';
      el.style.zIndex = '1000';
      
      // Create marker with options
      const marker = new mapboxgl.Marker({
        element: el,
        draggable: draggable,
      })
        .setLngLat([longitude, latitude])
        .addTo(map);
      
      // FIXED: Store dimensions and position for debugging
      try {
        const markerEl = marker.getElement();
        const rect = markerEl.getBoundingClientRect();
        console.log(`[MapboxMarker] Marker ${id} dimensions:`, {
          width: rect.width,
          height: rect.height,
          top: rect.top,
          left: rect.left,
          visible: window.getComputedStyle(markerEl).visibility,
          display: window.getComputedStyle(markerEl).display,
          opacity: window.getComputedStyle(markerEl).opacity,
          zIndex: window.getComputedStyle(markerEl).zIndex
        });
      } catch (error) {
        console.warn(`[MapboxMarker] Error logging marker dimensions:`, error);
      }
      
      // ... rest of marker creation code
      
      // FIXED: Set up a visibility check on a delay
      const visibilityCheckTimeout = setTimeout(() => {
        try {
          const markerEl = marker.getElement();
          if (!markerEl || !document.body.contains(markerEl)) {
            console.error(`[MapboxMarker] Marker ${id} not found in DOM after creation`);
            
            // Try to recreate the marker
            if (map && map.loaded()) {
              console.log(`[MapboxMarker] Attempting to recreate marker ${id}`);
              const newEl = createMarkerElement();
              const newMarker = new mapboxgl.Marker({
                element: newEl,
                draggable: draggable,
              })
                .setLngLat([longitude, latitude])
                .addTo(map);
              
              markerRef.current = newMarker;
            }
          } else {
            const rect = markerEl.getBoundingClientRect();
            const isHidden = rect.width === 0 || 
                             rect.height === 0 || 
                             window.getComputedStyle(markerEl).visibility === 'hidden' ||
                             window.getComputedStyle(markerEl).display === 'none' ||
                             window.getComputedStyle(markerEl).opacity === '0';
            
            if (isHidden) {
              console.error(`[MapboxMarker] Marker ${id} is hidden after creation:`, {
                width: rect.width,
                height: rect.height,
                visibility: window.getComputedStyle(markerEl).visibility,
                display: window.getComputedStyle(markerEl).display,
                opacity: window.getComputedStyle(markerEl).opacity
              });
              
              // Apply direct visibility fixes
              markerEl.style.visibility = 'visible';
              markerEl.style.display = 'block';
              markerEl.style.opacity = '1';
              markerEl.style.zIndex = '1000';
              
              // Force marker reposition - sometimes helps with rendering
              marker.setLngLat([longitude, latitude]);
            }
          }
        } catch (error) {
          console.error(`[MapboxMarker] Error during visibility check for ${id}:`, error);
        }
      }, 2000);
      
      // Store timeout for cleanup
      const timeouts = [visibilityCheckTimeout];
      
      // Return cleanup function
      return () => {
        // Clear all timeouts
        timeouts.forEach(clearTimeout);
        
        // Clean up marker and popup
        if (markerRef.current) {
          try {
            markerRef.current.remove();
            markerRef.current = null;
          } catch (error) {
            console.error(`[MapboxMarker] Error cleaning up marker ${id}:`, error);
          }
        }
        
        if (popupRef.current) {
          try {
            popupRef.current.remove();
            popupRef.current = null;
          } catch (error) {
            console.error(`[MapboxMarker] Error cleaning up popup for ${id}:`, error);
          }
        }
        
        // Clean up route
        removeRouteLine();
        
        setIsMounted(false);
      };
    } catch (error) {
      console.error(`[MapboxMarker] Error creating marker ${id}:`, error);
    }
  }, [
    map, 
    id, 
    isMapReady, 
    initAttempts, 
    createMarkerElement,
    createPopupContent,
    addRouteLine,
    removeRouteLine,
    updateMarkerStyle,
    latitude, 
    longitude, 
    markerType, 
    status, 
    draggable, 
    showPopup, 
    popupOffset, 
    onClick, 
    onDragEnd, 
    onMarkerCreated, 
    routeData, 
    zoomDependent
  ]);

  // Update route line when coordinates change
  useEffect(() => {
    if (isMounted && routeData) {
      addRouteLine();
    }
    
    return () => {
      if (routeLineRef.current) {
        removeRouteLine();
      }
    };
  }, [isMounted, routeData, addRouteLine, removeRouteLine]);
  
  // Force marker re-attach if it becomes orphaned
  useEffect(() => {
    if (!isMounted || !map) return;
    
    const markerEl = markerRef.current?.getElement?.();
    if (markerEl && !document.contains(markerEl)) {
      console.warn(`[MapboxMarker] Marker ${id} DOM was detached. Reattaching.`);
      markerRef.current?.addTo(map);
    }
  }, [map, id, isMounted]);

  // Create the marker when the component mounts and map is ready

  // Empty fragment since the marker is handled by mapbox
  return null;
};

export default React.memo(MapboxMarker); 