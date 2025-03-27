// Windows-compatible cleanup script
const fs = require('fs');
const path = require('path');

// List of deprecated files
const deprecatedFiles = [
  'src/components/map/BasicMapComponent.tsx',
  'src/components/map/MarkerMapComponent.tsx',
  'src/components/map/RouteMapComponent.tsx',
  'src/components/map/StoreBasedMapComponent.tsx',
  'src/store/map/useMapStore.ts',
  'src/store/map/useMapViewStore.ts',
  'src/components/map/FleetOverviewMapV2.tsx' // Also clean up the old FleetOverviewMapV2
];

// Archive directory
const archiveDir = 'src\\_deprecated_archive';

// Create archive directory if it doesn't exist
if (!fs.existsSync(archiveDir)) {
  fs.mkdirSync(archiveDir, { recursive: true });
  console.log(`Created archive directory: ${archiveDir}`);
}

// Move files to archive instead of deleting
let processedCount = 0;
deprecatedFiles.forEach(filePath => {
  try {
    // Check if file exists
    if (fs.existsSync(filePath)) {
      // Create archive filename with timestamp
      const filename = path.basename(filePath);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const archivePath = path.join(archiveDir, `${filename}.${timestamp}.deprecated`);
      
      // Move file to archive
      fs.copyFileSync(filePath, archivePath);
      console.log(`Archived: ${filePath} -> ${archivePath}`);
      
      // Remove original file
      fs.unlinkSync(filePath);
      console.log(`Removed: ${filePath}`);
      
      processedCount++;
    } else {
      console.log(`File not found: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
});

// Check for empty directories after file removal
const dirToCheck = [
  'src/components/map',
  'src/store/map'
];

dirToCheck.forEach(dir => {
  try {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      if (files.length === 0) {
        console.log(`Directory is now empty: ${dir}`);
      }
    }
  } catch (error) {
    console.error(`Error checking directory ${dir}:`, error);
  }
});

console.log(`Cleanup completed. Processed ${processedCount} files.`); 