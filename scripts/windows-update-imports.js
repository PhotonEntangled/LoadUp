// Windows-compatible import update script
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Import mapping (old import -> new import)
const importMapping = {
  // Component imports
  'import FleetOverviewMapV2 from': 'import VehicleTrackingMap from',
  'import { FleetOverviewMapV2 } from': 'import { VehicleTrackingMap } from',
  'import MarkerMapComponent from': 'import MapMarkerLayer from',
  'import { MarkerMapComponent } from': 'import { MapMarkerLayer } from',
  'import RouteMapComponent from': 'import MapRouteLayer from',
  'import { RouteMapComponent } from': 'import { MapRouteLayer } from',
  'import StoreBasedMapComponent from': '// Removed: StoreBasedMapComponent - use VehicleTrackingMap instead',
  'import { StoreBasedMapComponent } from': '// Removed: StoreBasedMapComponent - use VehicleTrackingMap instead',
  'import BasicMapComponent from': '// Removed: BasicMapComponent - use MapboxMap from packages/shared instead',
  'import { BasicMapComponent } from': '// Removed: BasicMapComponent - use MapboxMap from packages/shared instead',
  
  // Store imports
  'import { useMapStore } from': 'import { mapManager } from',
  'import useMapStore from': 'import { mapManager } from',
  'import { useMapViewStore } from': '// Removed: useMapViewStore - use mapManager from utils/maps/MapManager instead',
  'import useMapViewStore from': '// Removed: useMapViewStore - use mapManager from utils/maps/MapManager instead',
  
  // Path updates
  '../store/map/useMapStore': '../../utils/maps/MapManager',
  './store/map/useMapStore': './utils/maps/MapManager',
  '../../store/map/useMapStore': '../../../utils/maps/MapManager',
};

// Component name mapping (for JSX usage)
const componentMapping = {
  '<FleetOverviewMapV2': '<VehicleTrackingMap',
  '</SimulatedVehicleMap>': '</VehicleTrackingMap>',
  '<MarkerMapComponent': '<MapMarkerLayer',
  '</MarkerMapComponent>': '</MapMarkerLayer>',
  '<RouteMapComponent': '<MapRouteLayer',
  '</RouteMapComponent>': '</MapRouteLayer>',
  '<StoreBasedMapComponent': '{/* Removed StoreBasedMapComponent - use VehicleTrackingMap */}',
  '</StoreBasedMapComponent>': '',
  '<BasicMapComponent': '{/* Removed BasicMapComponent - use MapboxMap */}',
  '</BasicMapComponent>': '',
};

// Windows-compatible directory walking
function walkSync(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      fileList = walkSync(filePath, fileList);
    } else {
      // Only include TypeScript and JavaScript files
      const ext = path.extname(filePath).toLowerCase();
      if (['.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
        fileList.push(filePath);
      }
    }
  });
  
  return fileList;
}

// Main function
function updateImports() {
  try {
    // Find files using Windows-compatible method
    console.log('Searching for TypeScript/JavaScript files...');
    const files = walkSync('src');
    console.log(`Found ${files.length} files to check.`);
    
    let modifiedFilesCount = 0;
    
    // Process each file
    files.forEach(filePath => {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        let newContent = content;
        let modified = false;
        
        // Check for import statements
        Object.entries(importMapping).forEach(([oldImport, newImport]) => {
          if (newContent.includes(oldImport)) {
            // Use string replace to avoid regex escape issues
            while (newContent.includes(oldImport)) {
              newContent = newContent.replace(oldImport, newImport);
            }
            modified = true;
            console.log(`Updated import in ${filePath}: ${oldImport} -> ${newImport}`);
          }
        });
        
        // Check for component usage
        Object.entries(componentMapping).forEach(([oldComponent, newComponent]) => {
          if (newContent.includes(oldComponent)) {
            // Use string replace to avoid regex escape issues
            while (newContent.includes(oldComponent)) {
              newContent = newContent.replace(oldComponent, newComponent);
            }
            modified = true;
            console.log(`Updated component in ${filePath}: ${oldComponent} -> ${newComponent}`);
          }
        });
        
        // Update file if modified
        if (modified) {
          fs.writeFileSync(filePath, newContent, 'utf8');
          modifiedFilesCount++;
        }
      } catch (err) {
        console.error(`Error processing ${filePath}: ${err.message}`);
      }
    });
    
    console.log(`Updated imports in ${modifiedFilesCount} files.`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

// Execute main function
updateImports(); 