/**
 * Map Constants
 * 
 * This file contains shared constants for map components to ensure consistency
 * across different parts of the application.
 */

import mapboxgl from 'mapbox-gl';

// Global map ID constants
export const VEHICLE_MAP_ID = 'simulated-vehicle-map';
export const MAP_STYLES_ID = 'map-styles';

// Default map settings
export const DEFAULT_MAP_CENTER: mapboxgl.LngLat = new mapboxgl.LngLat(-95.7129, 37.0902); // Center of USA
export const DEFAULT_MAP_ZOOM = 4;

// CSS z-index constants for proper layering
export const MARKER_BASE_Z_INDEX = 10;
export const POPUP_Z_INDEX = 20;
export const CONTROL_Z_INDEX = 30;

// Debug mode state
let mapDebugModeEnabled = false;

/**
 * Injects critical CSS fixes to ensure Mapbox markers are visible
 * Note: Most CSS is now in the global CSS file, this is just for dynamic styles
 * @param enableDebug Enables visual debugging aids for markers
 */
export function injectMapboxCSS(enableDebug = false): void {
  // Set debug mode
  mapDebugModeEnabled = enableDebug;
  
  // Ensure we don't inject CSS multiple times
  if (document.getElementById('mapbox-critical-css')) {
    // Update debug mode in existing stylesheet if needed
    if (enableDebug) {
      updateDebugStyles();
    }
    return;
  }
  
  console.log(`[MapUtils] Injecting critical CSS fixes${enableDebug ? ' (with debug mode)' : ''}`);
  
  // Create style element
  const style = document.createElement('style');
  style.id = 'mapbox-critical-css';
  style.innerHTML = `
    /* Dynamic styles that need to be injected at runtime */
    #${VEHICLE_MAP_ID} {
      overflow: visible !important;
      position: relative !important;
      height: 100% !important;
      width: 100% !important;
      min-height: 300px !important;
    }
    
    ${enableDebug ? getDebugStyles() : ''}
  `;
  
  // Add to document head
  document.head.appendChild(style);
  
  console.log(`[MapUtils] CSS fixes injected successfully`);
}

/**
 * Updates the debug styles in the existing CSS
 */
function updateDebugStyles(): void {
  const styleElement = document.getElementById('mapbox-critical-css');
  if (styleElement && mapDebugModeEnabled) {
    const currentStyles = styleElement.innerHTML;
    if (!currentStyles.includes('/* DEBUG STYLES */')) {
      styleElement.innerHTML = currentStyles + getDebugStyles();
      console.log('[MapUtils] Debug styles added to existing CSS');
    }
  }
}

/**
 * Returns CSS for debugging marker issues
 */
function getDebugStyles(): string {
  return `
    /* DEBUG STYLES */
    .mapboxgl-marker {
      border: 2px solid red !important;
      min-width: 24px !important;
      min-height: 24px !important;
    }
    
    #${VEHICLE_MAP_ID} {
      border: 2px dashed blue !important;
    }
  `;
}

/**
 * Checks if debug mode is enabled
 */
export function isMapDebugModeEnabled(): boolean {
  return mapDebugModeEnabled;
}

/**
 * Gets a properly scoped marker ID
 */
export function getMarkerIdForVehicle(vehicleId: string): string {
  return `marker-${vehicleId}`;
}

// Export the proper Mapbox GL type to ensure proper usage across the application
export type MapboxMap = mapboxgl.Map; 