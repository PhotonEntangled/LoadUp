/**
 * Cleanup script for map implementation refactoring
 * 
 * This script removes redundant files after confirming that
 * the refactored map implementation is working correctly.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define files to be removed
const filesToRemove = [
  // Old store files
  'src/store/useMapViewStore.ts',
  'src/store/useTrackingStore.ts',
  'src/store/useVehicleStore.ts',
  
  // Old hook files
  'src/hooks/useVehicleTracking.ts',
  
  // Old utility files that are no longer needed
  'src/utils/mapUtils.ts',
  
  // Duplicate/old component files
  'src/components/map/FleetOverviewMap.tsx.nobom',
];

// Confirm removal function 
function confirmAndRemove() {
  console.log('The following files will be removed:');
  filesToRemove.forEach(file => console.log(`- ${file}`));
  
  // In a real implementation, you'd add a confirmation prompt here
  // For this script, we'll just show what would be removed
  
  console.log('\nTo execute the deletion, run this script with the --confirm flag:');
  console.log('node src/scripts/cleanup-map-implementation.js --confirm');
  
  // Check if --confirm flag is passed
  if (process.argv.includes('--confirm')) {
    removeFiles();
  }
}

// Remove the files
function removeFiles() {
  console.log('\nRemoving files...');
  
  filesToRemove.forEach(file => {
    const filePath = path.resolve(process.cwd(), file);
    
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`✅ Removed: ${file}`);
      } else {
        console.log(`⚠️ Not found: ${file}`);
      }
    } catch (error) {
      console.error(`❌ Error removing ${file}:`, error.message);
    }
  });
  
  console.log('\nCleanup complete! The map implementation has been fully refactored.');
}

// Run the script
confirmAndRemove(); 