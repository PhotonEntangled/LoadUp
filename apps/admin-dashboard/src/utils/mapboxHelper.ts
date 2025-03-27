// Map initialization helper functions
import { MutableRefObject } from 'react';

// TypeScript interface for MapOptions
export interface MapboxMapOptions {
  style?: string;
  center?: [number, number]; 
  zoom?: number;
  minZoom?: number;
  maxZoom?: number;
  bearing?: number;
  pitch?: number;
  interactive?: boolean;
}

// TypeScript interface for Marker options
export interface MapboxMarkerOptions {
  color?: string;
  draggable?: boolean;
  anchor?: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  offset?: [number, number];
  rotation?: number;
  scale?: number;
  element?: HTMLElement;
}

// Type for marker information
export interface MarkerInfo {
  id: string;
  lngLat: [number, number];
  popupContent?: string;
  options?: MapboxMarkerOptions;
}

// Declare the mapboxgl global
declare global {
  interface Window {
    mapboxgl: any;
  }
}

/**
 * Initialize a Mapbox map
 */
export const initializeMap = (
  mapContainerRef: MutableRefObject<HTMLDivElement | null>,
  accessToken: string,
  options: MapboxMapOptions = {}
) => {
  if (!mapContainerRef.current || !window.mapboxgl) {
    console.error('Map container or mapboxgl not available');
    return null;
  }

  try {
    // Set default options
    const defaultOptions: MapboxMapOptions = {
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-95.7129, 37.0902], // USA center
      zoom: 3.5,
    };

    // Merge defaults with provided options
    const mergedOptions = { ...defaultOptions, ...options };

    // Set access token
    window.mapboxgl.accessToken = accessToken;

    // Create and return the map
    return new window.mapboxgl.Map({
      container: mapContainerRef.current,
      ...mergedOptions
    });
  } catch (error) {
    console.error('Error initializing map:', error);
    return null;
  }
};

/**
 * Add markers to the map with optional popups
 */
export const addMarkers = (map: any, markers: MarkerInfo[]) => {
  if (!map || !markers || !markers.length) return [];

  const createdMarkers: any[] = [];

  markers.forEach(({ id, lngLat, popupContent, options = {} }) => {
    try {
      // Create marker
      const marker = new window.mapboxgl.Marker(options)
        .setLngLat(lngLat)
        .addTo(map);

      // Add popup if content is provided
      if (popupContent) {
        const popup = new window.mapboxgl.Popup({ offset: 25 })
          .setHTML(popupContent);
        
        marker.setPopup(popup);
      }

      // Store marker with ID for later reference
      createdMarkers.push({ id, marker });
    } catch (error) {
      console.error(`Error adding marker ${id}:`, error);
    }
  });

  return createdMarkers;
};

/**
 * Create a map instance with error handling and loading state management
 */
export const createMapWithErrorHandling = (
  mapContainerRef: MutableRefObject<HTMLDivElement | null>,
  accessToken: string,
  options: MapboxMapOptions = {},
  onSuccess?: (map: any) => void,
  onError?: (error: Error) => void
) => {
  try {
    const map = initializeMap(mapContainerRef, accessToken, options);
    
    if (map) {
      // Set up error event listener
      map.on('error', (e: any) => {
        console.error('Map error occurred');
        
        // Handle circular reference issue by extracting only needed information
        let errorMessage = 'Unknown map error';
        
        try {
          if (e.error && typeof e.error === 'string') {
            errorMessage = e.error;
          } else if (e.error && e.error.message) {
            errorMessage = e.error.message;
          } else if (typeof e === 'string') {
            errorMessage = e;
          }
        } catch (jsonErr) {
          console.error('Error extracting error message:', jsonErr);
          errorMessage = 'Error parsing map error (circular reference)';
        }
        
        if (onError) onError(new Error(`Map error: ${errorMessage}`));
      });

      // Set up load event listener
      map.on('load', () => {
        console.log('Map loaded successfully');
        if (onSuccess) onSuccess(map);
      });

      return map;
    }
    
    return null;
  } catch (error) {
    console.error('Error creating map:', error);
    if (onError && error instanceof Error) onError(error);
    return null;
  }
};

/**
 * Clean up map instance and resources
 */
export const cleanupMap = (map: any) => {
  if (!map) return;
  
  try {
    map.remove();
    console.log('Map resources cleaned up');
  } catch (error) {
    console.error('Error cleaning up map:', error);
  }
};

/**
 * Add a vehicle marker with custom styling
 */
export const addVehicleMarker = (map: any, vehicleId: string, lngLat: [number, number], angle = 0, details?: Record<string, any>) => {
  if (!map) return null;

  try {
    // Create custom element for vehicle marker
    const el = document.createElement('div');
    el.className = 'vehicle-marker';
    el.style.width = '24px';
    el.style.height = '24px';
    el.style.borderRadius = '50%';
    el.style.backgroundColor = '#3B82F6';
    el.style.border = '2px solid #FFFFFF';
    el.style.transform = `rotate(${angle}deg)`;
    
    // Create marker
    const marker = new window.mapboxgl.Marker({
      element: el,
      anchor: 'center',
    })
      .setLngLat(lngLat)
      .addTo(map);
    
    // Add popup with vehicle details if provided
    if (details) {
      const popupContent = `
        <div>
          <h3>Vehicle: ${details.name || vehicleId}</h3>
          ${details.status ? `<p>Status: ${details.status}</p>` : ''}
          ${details.speed ? `<p>Speed: ${details.speed} mph</p>` : ''}
          ${details.lastUpdate ? `<p>Last update: ${new Date(details.lastUpdate).toLocaleTimeString()}</p>` : ''}
        </div>
      `;
      
      const popup = new window.mapboxgl.Popup({ offset: 25 })
        .setHTML(popupContent);
      
      marker.setPopup(popup);
    }
    
    return marker;
  } catch (error) {
    console.error(`Error adding vehicle marker ${vehicleId}:`, error);
    return null;
  }
};

/**
 * Draw a route path on the map
 */
export const drawRoutePath = (
  map: any, 
  routeCoordinates: [number, number][], 
  options: {
    lineColor?: string,
    lineWidth?: number,
    lineOpacity?: number,
    animate?: boolean,
    sourceId?: string,
    layerId?: string
  } = {}
) => {
  if (!map || !routeCoordinates || routeCoordinates.length < 2) return;

  try {
    const {
      lineColor = '#3B82F6',
      lineWidth = 4,
      lineOpacity = 0.75,
      animate = false,
      sourceId = `route-${Date.now()}`,
      layerId = `route-layer-${Date.now()}`
    } = options;

    // Create GeoJSON source
    const routeSource = {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: routeCoordinates
        }
      }
    };

    // Add source to map
    if (map.getSource(sourceId)) {
      map.removeLayer(layerId);
      map.removeSource(sourceId);
    }
    
    map.addSource(sourceId, routeSource);

    // Add line layer
    map.addLayer({
      id: layerId,
      type: 'line',
      source: sourceId,
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': lineColor,
        'line-width': lineWidth,
        'line-opacity': lineOpacity
      }
    });

    // Add animation if requested
    if (animate) {
      // Simple animation of the line drawing
      let step = 0;
      const animationSteps = 100;
      
      const animateLine = () => {
        if (step > animationSteps) return;
        
        const progress = step / animationSteps;
        const currentCoordinates = routeCoordinates.slice(0, Math.max(2, Math.floor(routeCoordinates.length * progress)));
        
        if (map.getSource(sourceId)) {
          map.getSource(sourceId).setData({
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: currentCoordinates
            }
          });
        }
        
        step++;
        requestAnimationFrame(animateLine);
      };
      
      animateLine();
    }

    return { sourceId, layerId };
  } catch (error) {
    console.error('Error drawing route path:', error);
  }
};

/**
 * Update vehicle marker position with smooth animation
 */
export const updateVehiclePosition = (
  marker: any, 
  newLngLat: [number, number], 
  duration = 1000, 
  newAngle?: number
) => {
  if (!marker) return;

  try {
    const startLngLat = marker.getLngLat();
    const startTime = Date.now();
    
    // Get the marker element for rotation
    const el = marker.getElement();
    const startAngle = newAngle !== undefined 
      ? (el && el.style.transform ? parseInt(el.style.transform.replace(/\D/g, '')) || 0 : 0) 
      : undefined;
    
    const animate = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      
      if (elapsed >= duration) {
        // Animation completed
        marker.setLngLat(newLngLat);
        
        if (newAngle !== undefined && el) {
          el.style.transform = `rotate(${newAngle}deg)`;
        }
        return;
      }
      
      // Calculate interpolation factor
      const factor = elapsed / duration;
      
      // Interpolate position
      const lng = startLngLat.lng + (newLngLat[0] - startLngLat.lng) * factor;
      const lat = startLngLat.lat + (newLngLat[1] - startLngLat.lat) * factor;
      marker.setLngLat([lng, lat]);
      
      // Interpolate angle if provided
      if (newAngle !== undefined && startAngle !== undefined && el) {
        const currentAngle = startAngle + (newAngle - startAngle) * factor;
        el.style.transform = `rotate(${currentAngle}deg)`;
      }
      
      // Continue animation
      requestAnimationFrame(animate);
    };
    
    animate();
  } catch (error) {
    console.error('Error updating vehicle position:', error);
    // Fallback to instant update without animation
    marker.setLngLat(newLngLat);
  }
};

/**
 * Fit map bounds to include all coordinates
 */
export const fitMapToCoordinates = (map: any, coordinates: [number, number][], padding = 50) => {
  if (!map || !coordinates || coordinates.length === 0) return;
  
  try {
    const bounds = coordinates.reduce((bounds, coord) => {
      return bounds.extend(coord);
    }, new window.mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
    
    map.fitBounds(bounds, { padding });
  } catch (error) {
    console.error('Error fitting map to coordinates:', error);
  }
};

/**
 * Create and return API configuration and token URL helper
 */
export const getMapboxConfig = () => {
  return {
    // URL to fetch token from your secured API endpoint
    tokenUrl: '/api/mapbox-token',
    
    // Default map options
    defaultOptions: {
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-95.7129, 37.0902],
      zoom: 3.5,
    },
    
    // Map event handlers
    eventHandlers: {
      click: (e: any, map: any) => {
        console.log('Map clicked at:', e.lngLat);
      }
    }
  };
}; 