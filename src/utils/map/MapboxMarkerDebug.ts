/**
 * MapboxMarkerDebug.ts
 * 
 * Utility functions for diagnosing and fixing Mapbox GL marker visibility issues.
 * This file provides tools for debugging marker rendering, direct DOM manipulation
 * for visibility fixes, and fallback marker creation.
 */

import mapboxgl from 'mapbox-gl';
import { Vehicle } from '../../types/vehicle';

// Check if a marker is visible and log diagnostics
export function checkMarkerVisibility(marker: mapboxgl.Marker, id: string): boolean {
  try {
    const element = marker.getElement();
    if (!element || !document.body.contains(element)) {
      console.error(`[MapboxMarkerDebug] Marker ${id} element not found in DOM`);
      return false;
    }
    
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    const isVisible = rect.width > 0 && 
                     rect.height > 0 && 
                     style.visibility !== 'hidden' && 
                     style.display !== 'none' && 
                     parseFloat(style.opacity) > 0;
    
    console.log(`[MapboxMarkerDebug] Marker ${id} visibility check:`, {
      isVisible,
      dimensions: {
        width: rect.width,
        height: rect.height
      },
      position: {
        top: rect.top,
        left: rect.left
      },
      style: {
        visibility: style.visibility,
        display: style.display,
        opacity: style.opacity,
        zIndex: style.zIndex,
        position: style.position
      },
      nodeType: element.nodeType,
      tagName: element.tagName,
      className: element.className
    });
    
    return isVisible;
  } catch (error) {
    console.error(`[MapboxMarkerDebug] Error checking marker ${id} visibility:`, error);
    return false;
  }
}

// Apply extreme visibility fixes to a marker
export function forceMarkerVisibility(marker: mapboxgl.Marker, id: string): void {
  try {
    const element = marker.getElement();
    if (!element) {
      console.error(`[MapboxMarkerDebug] Cannot fix marker ${id} - element not found`);
      return;
    }
    
    console.log(`[MapboxMarkerDebug] Applying extreme visibility fixes to marker ${id}`);
    
    // Apply fixes to the marker container
    element.style.visibility = 'visible';
    element.style.display = 'block';
    element.style.opacity = '1';
    element.style.position = 'absolute';
    element.style.zIndex = '10000';
    element.style.pointerEvents = 'auto';
    
    // Try to find the inner div element and apply fixes
    const innerDiv = element.querySelector('div');
    if (innerDiv) {
      innerDiv.style.visibility = 'visible';
      innerDiv.style.display = 'flex';
      innerDiv.style.opacity = '1';
      innerDiv.style.backgroundColor = '#FF00FF'; // Bright magenta
      innerDiv.style.border = '3px solid white';
      innerDiv.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
      innerDiv.style.width = '40px';
      innerDiv.style.height = '40px';
      innerDiv.style.borderRadius = '50%';
      innerDiv.style.alignItems = 'center';
      innerDiv.style.justifyContent = 'center';
      innerDiv.style.fontSize = '24px';
      
      // Add truck emoji if empty
      if (!innerDiv.textContent || innerDiv.textContent.trim() === '') {
        innerDiv.textContent = '🚚';
      }
    }
    
    // Log result
    checkMarkerVisibility(marker, id);
  } catch (error) {
    console.error(`[MapboxMarkerDebug] Error fixing marker ${id} visibility:`, error);
  }
}

// Create a direct marker using the Mapbox GL API
export function createDirectMarker(
  map: mapboxgl.Map, 
  vehicle: Vehicle, 
  onClick?: (vehicle: Vehicle) => void
): mapboxgl.Marker | null {
  if (!map || !vehicle || !vehicle.location) {
    console.error('[MapboxMarkerDebug] Cannot create direct marker - invalid input');
    return null;
  }
  
  try {
    const { latitude, longitude } = vehicle.location;
    if (typeof latitude !== 'number' || typeof longitude !== 'number' || 
        isNaN(latitude) || isNaN(longitude)) {
      console.error(`[MapboxMarkerDebug] Invalid coordinates for vehicle ${vehicle.id}`);
      return null;
    }
    
    console.log(`[MapboxMarkerDebug] Creating direct marker for vehicle ${vehicle.id} at [${longitude}, ${latitude}]`);
    
    // Create marker element with high visibility styling
    const el = document.createElement('div');
    el.style.width = '40px';
    el.style.height = '40px';
    el.style.borderRadius = '50%';
    el.style.backgroundColor = '#FF00FF'; // Bright magenta for visibility
    el.style.border = '3px solid white';
    el.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';
    el.style.position = 'absolute';
    el.style.visibility = 'visible';
    el.style.opacity = '1';
    el.style.zIndex = '10000';
    el.style.fontSize = '24px';
    
    // Add data attributes for debugging
    el.setAttribute('data-vehicle-id', vehicle.id);
    el.setAttribute('data-marker-type', 'direct');
    el.setAttribute('data-vehicle-status', vehicle.status || 'unknown');
    
    // Add emoji content
    el.textContent = '🚚';
    
    // Create and add the marker
    const marker = new mapboxgl.Marker({
      element: el,
    })
      .setLngLat([longitude, latitude])
      .addTo(map);
    
    // Add click handler if provided
    if (onClick) {
      el.style.cursor = 'pointer';
      el.addEventListener('click', () => onClick(vehicle));
    }
    
    return marker;
  } catch (error) {
    console.error(`[MapboxMarkerDebug] Error creating direct marker for vehicle ${vehicle.id}:`, error);
    return null;
  }
}

// Create emergency markers for all vehicles
export function createEmergencyMarkers(
  map: mapboxgl.Map, 
  vehicles: Vehicle[], 
  onClick?: (vehicle: Vehicle) => void
): Record<string, mapboxgl.Marker> {
  const markers: Record<string, mapboxgl.Marker> = {};
  
  if (!map || !vehicles || vehicles.length === 0) {
    console.error('[MapboxMarkerDebug] Cannot create emergency markers - invalid input');
    return markers;
  }
  
  console.log(`[MapboxMarkerDebug] Creating emergency markers for ${vehicles.length} vehicles`);
  
  // Filter vehicles with valid location data
  const validVehicles = vehicles.filter(v => 
    v && v.location && 
    typeof v.location.latitude === 'number' && 
    typeof v.location.longitude === 'number' &&
    !isNaN(v.location.latitude) && !isNaN(v.location.longitude)
  );
  
  if (validVehicles.length === 0) {
    console.error('[MapboxMarkerDebug] No vehicles with valid location data');
    return markers;
  }
  
  // Create markers for each valid vehicle
  validVehicles.forEach(vehicle => {
    const marker = createDirectMarker(map, vehicle, onClick);
    if (marker) {
      markers[vehicle.id] = marker;
    }
  });
  
  console.log(`[MapboxMarkerDebug] Created ${Object.keys(markers).length} emergency markers`);
  return markers;
}

// Check if the map element is properly initialized
export function checkMapElement(mapId: string): boolean {
  try {
    const mapElement = document.getElementById(mapId);
    if (!mapElement) {
      console.error(`[MapboxMarkerDebug] Map element with ID ${mapId} not found in DOM`);
      return false;
    }
    
    console.log(`[MapboxMarkerDebug] Map element found:`, {
      dimensions: {
        clientWidth: mapElement.clientWidth,
        clientHeight: mapElement.clientHeight,
        offsetWidth: mapElement.offsetWidth,
        offsetHeight: mapElement.offsetHeight
      },
      style: {
        position: window.getComputedStyle(mapElement).position,
        overflow: window.getComputedStyle(mapElement).overflow,
        display: window.getComputedStyle(mapElement).display,
        visibility: window.getComputedStyle(mapElement).visibility,
        zIndex: window.getComputedStyle(mapElement).zIndex
      },
      isVisible: mapElement.offsetWidth > 0 && mapElement.offsetHeight > 0
    });
    
    // Check if map has the _map property (internal Mapbox GL JS reference)
    const hasMapInstance = !!(mapElement as any)._map;
    console.log(`[MapboxMarkerDebug] Map element has _map property: ${hasMapInstance}`);
    
    return true;
  } catch (error) {
    console.error(`[MapboxMarkerDebug] Error checking map element ${mapId}:`, error);
    return false;
  }
}

// Apply visibility fixes to the map container
export function fixMapContainer(mapId: string): void {
  try {
    const mapElement = document.getElementById(mapId);
    if (!mapElement) {
      console.error(`[MapboxMarkerDebug] Cannot fix map container - element with ID ${mapId} not found`);
      return;
    }
    
    console.log(`[MapboxMarkerDebug] Applying fixes to map container ${mapId}`);
    
    // Apply critical style fixes
    mapElement.style.position = 'relative';
    mapElement.style.overflow = 'visible';
    mapElement.style.width = '100%';
    mapElement.style.height = '100%';
    mapElement.style.minHeight = '300px';
    mapElement.style.visibility = 'visible';
    mapElement.style.display = 'block';
    mapElement.style.opacity = '1';
    
    // Apply fixes to canvas container if it exists
    const canvasContainer = mapElement.querySelector('.mapboxgl-canvas-container');
    if (canvasContainer) {
      (canvasContainer as HTMLElement).style.visibility = 'visible';
      (canvasContainer as HTMLElement).style.opacity = '1';
    }
    
    // Apply fixes to canvas if it exists
    const canvas = mapElement.querySelector('.mapboxgl-canvas');
    if (canvas) {
      (canvas as HTMLElement).style.visibility = 'visible';
      (canvas as HTMLElement).style.opacity = '1';
    }
    
    console.log(`[MapboxMarkerDebug] Map container fixes applied to ${mapId}`);
  } catch (error) {
    console.error(`[MapboxMarkerDebug] Error fixing map container ${mapId}:`, error);
  }
}

// Export a diagnostic function that can be called from any component
export function runMapDiagnostics(mapId: string, map: mapboxgl.Map | null): void {
  console.log(`[MapboxMarkerDebug] Running diagnostics for map ${mapId}`);
  
  // Check map element in DOM
  const mapElementOk = checkMapElement(mapId);
  
  // Apply fixes to map container
  if (mapElementOk) {
    fixMapContainer(mapId);
  }
  
  // Check map instance
  if (!map) {
    console.error(`[MapboxMarkerDebug] No map instance provided for diagnostics`);
    return;
  }
  
  // Log map state
  try {
    console.log(`[MapboxMarkerDebug] Map instance state:`, {
      loaded: typeof (map as any).loaded === 'function' ? (map as any).loaded() : 'method not available',
      center: map.getCenter(),
      zoom: map.getZoom(),
      style: typeof (map as any).getStyle === 'function' ? (map as any).getStyle().name : 'style not available',
      container: map.getContainer().id
    });
  } catch (error) {
    console.error(`[MapboxMarkerDebug] Error getting map state:`, error);
  }
  
  // Check for existing markers
  try {
    const markers = document.querySelectorAll('.mapboxgl-marker');
    console.log(`[MapboxMarkerDebug] Found ${markers.length} markers in DOM`);
    
    // Log details of first few markers
    Array.from(markers).slice(0, 3).forEach((marker, index) => {
      console.log(`[MapboxMarkerDebug] Marker ${index} state:`, {
        style: {
          visibility: window.getComputedStyle(marker).visibility,
          display: window.getComputedStyle(marker).display,
          opacity: window.getComputedStyle(marker).opacity,
          zIndex: window.getComputedStyle(marker).zIndex,
          position: window.getComputedStyle(marker).position
        },
        dimensions: {
          width: (marker as HTMLElement).offsetWidth,
          height: (marker as HTMLElement).offsetHeight
        },
        attributes: {
          vehicleId: marker.getAttribute('data-vehicle-id'),
          markerType: marker.getAttribute('data-marker-type'),
          vehicleStatus: marker.getAttribute('data-vehicle-status')
        }
      });
    });
  } catch (error) {
    console.error(`[MapboxMarkerDebug] Error checking existing markers:`, error);
  }
} 