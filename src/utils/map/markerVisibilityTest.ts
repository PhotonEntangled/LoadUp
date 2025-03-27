import { mapManager } from '../maps/MapManager';
import { VEHICLE_MAP_ID } from '../maps/constants';
import { runMapDiagnostics, createEmergencyMarkers, fixMapContainer } from './MapboxMarkerDebug';

/**
 * Marker visibility test utility
 * 
 * This utility provides functions to test and fix marker visibility issues,
 * especially after page refresh.
 */

// Track whether the refresh handler has been registered
let refreshHandlerRegistered = false;

/**
 * Register a page load handler to check and fix map issues after refresh
 */
export function registerRefreshHandler(): void {
  if (refreshHandlerRegistered) {
    return;
  }
  
  console.log('[MarkerVisibilityTest] Registering page refresh handler');
  
  // Add event listener for when the page has fully loaded
  window.addEventListener('load', handlePageLoad);
  
  // Also listen for DOMContentLoaded as a backup
  document.addEventListener('DOMContentLoaded', handlePageLoad);
  
  refreshHandlerRegistered = true;
}

/**
 * Handle page load event (after refresh)
 */
function handlePageLoad(): void {
  console.log('[MarkerVisibilityTest] Page loaded, running visibility checks');
  
  // Schedule checks after a short delay to ensure React components have mounted
  setTimeout(runPostRefreshChecks, 2000);
}

/**
 * Run post-refresh checks to ensure map and markers are visible
 */
function runPostRefreshChecks(): void {
  console.log('[MarkerVisibilityTest] Running post-refresh checks');
  
  // Find map container
  const mapContainer = document.getElementById(VEHICLE_MAP_ID);
  if (!mapContainer) {
    console.warn('[MarkerVisibilityTest] Map container not found in DOM');
    
    // Schedule another check
    setTimeout(runPostRefreshChecks, 1000);
    return;
  }
  
  console.log('[MarkerVisibilityTest] Map container found, checking map state');
  
  // Fix map container styles
  fixMapContainer(VEHICLE_MAP_ID);
  
  // Check if map is registered in MapManager
  const map = mapManager.getMap(VEHICLE_MAP_ID);
  if (!map) {
    console.warn('[MarkerVisibilityTest] Map not registered in MapManager');
    return;
  }
  
  // Run diagnostics
  runMapDiagnostics(VEHICLE_MAP_ID, map);
  
  // Check for existing markers
  const existingMarkers = document.querySelectorAll('.mapboxgl-marker');
  console.log(`[MarkerVisibilityTest] Found ${existingMarkers.length} markers in DOM`);
  
  // Force visibility on existing markers
  existingMarkers.forEach((markerElement, index) => {
    try {
      const element = markerElement as HTMLElement;
      element.style.visibility = 'visible';
      element.style.display = 'block';
      element.style.opacity = '1';
      element.style.zIndex = '10';
      
      console.log(`[MarkerVisibilityTest] Fixed visibility for marker ${index + 1}`);
    } catch (e) {
      console.error(`[MarkerVisibilityTest] Error fixing marker ${index + 1}:`, e);
    }
  });
  
  // If no markers found, we may need to run emergency marker creation
  if (existingMarkers.length === 0) {
    setTimeout(() => {
      if (document.querySelectorAll('.mapboxgl-marker').length === 0) {
        console.warn('[MarkerVisibilityTest] No markers found after delay, creating emergency markers');
        
        // Get current vehicle store from window
        const appWindow = window as any;
        if (appWindow.__DEBUG_VEHICLES__) {
          // Pass the map object, not the ID string
          createEmergencyMarkers(map, appWindow.__DEBUG_VEHICLES__, vehicle => {
            console.log(`[MarkerVisibilityTest] Emergency marker clicked for ${vehicle.id}`);
          });
        }
      }
    }, 3000);
  }
}

/**
 * Force recreate all markers
 */
export function forceRecreateMarkers(): void {
  console.log('[MarkerVisibilityTest] Force recreating all markers');
  
  // Remove existing markers
  const existingMarkers = document.querySelectorAll('.mapboxgl-marker');
  existingMarkers.forEach(marker => {
    try {
      marker.remove();
    } catch (e) {
      console.error('[MarkerVisibilityTest] Error removing marker:', e);
    }
  });
  
  // Get map from manager
  const map = mapManager.getMap(VEHICLE_MAP_ID);
  if (!map) {
    console.warn('[MarkerVisibilityTest] Map not found in manager');
    return;
  }
  
  // Get current vehicle store from window
  const appWindow = window as any;
  if (appWindow.__DEBUG_VEHICLES__) {
    // Pass the map object, not the ID string
    createEmergencyMarkers(map, appWindow.__DEBUG_VEHICLES__, vehicle => {
      console.log(`[MarkerVisibilityTest] Emergency marker clicked for ${vehicle.id}`);
    });
  }
}

/**
 * Update the global debug reference in window
 * This allows console debugging
 */
export function setupGlobalDebugReferences(): void {
  const appWindow = window as any;
  
  // Add global debug functions
  appWindow.__MAP_DEBUG__ = {
    runDiagnostics: () => {
      const map = mapManager.getMap(VEHICLE_MAP_ID);
      if (map) {
        runMapDiagnostics(VEHICLE_MAP_ID, map);
      } else {
        console.error('Map not found in manager');
      }
    },
    fixContainer: () => fixMapContainer(VEHICLE_MAP_ID),
    recreateMarkers: forceRecreateMarkers,
    getMapManager: () => mapManager,
    getMapElementById: (id: string) => document.getElementById(id),
  };
  
  console.log('[MarkerVisibilityTest] Global debug references setup - available as window.__MAP_DEBUG__');
} 