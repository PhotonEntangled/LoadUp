import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

// Mapping of old file paths to new file paths
const fileRenameMap = {
  'src/components/map/SimulatedVehicleMap.tsx': 'src/components/map/VehicleTrackingMap.tsx',
  'src/components/StabilizedVehicleTrackingProvider.tsx': 'src/components/map/VehicleSimulationProvider.tsx',
  'src/services/shipment/SimulationFromShipmentService.ts': 'src/services/vehicle/ShipmentVehicleSimulator.ts',
  // ... add other files to rename
};

// Files to create
const filesToCreate = [
  'src/utils/maps/MapManager.ts',
  'src/components/map/MapMarkerLayer.tsx',
  'src/components/map/MapRouteLayer.tsx',
  'src/hooks/useMapMarkers.ts',
];

// Files to mark as deprecated (will add a comment at the top)
const deprecatedFiles = [
  'src/components/map/BasicMap.tsx',
  'src/components/map/FleetOverviewMap.tsx',
  'src/components/map/RouteMap.tsx',
  'apps/admin-dashboard/components/map/FleetOverviewMap.tsx',
];

// Deprecation comment to add at the top of deprecated files
const deprecationComment = `/**
 * @deprecated This component is deprecated and will be removed in a future release.
 * Please use the new map components in src/components/map/ instead.
 * See docs/PLANNING.md for more information on the new map architecture.
 */
`;

// Function to rename files
async function renameFiles() {
  console.log('Renaming files...');
  
  for (const [oldPath, newPath] of Object.entries(fileRenameMap)) {
    if (fs.existsSync(oldPath)) {
      // Create directory if it doesn't exist
      const dir = path.dirname(newPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Copy the file
      fs.copyFileSync(oldPath, newPath);
      console.log(`Copied ${oldPath} to ${newPath}`);
      
      // Add deprecated comment to the original file
      const content = fs.readFileSync(oldPath, 'utf8');
      fs.writeFileSync(oldPath, `${deprecationComment}${content}`);
      console.log(`Marked ${oldPath} as deprecated`);
    } else {
      console.log(`Warning: Source file ${oldPath} does not exist`);
    }
  }
}

// Function to mark files as deprecated
async function markFilesAsDeprecated() {
  console.log('Marking files as deprecated...');
  
  for (const filePath of deprecatedFiles) {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      fs.writeFileSync(filePath, `${deprecationComment}${content}`);
      console.log(`Marked ${filePath} as deprecated`);
    } else {
      console.log(`Warning: File ${filePath} does not exist`);
    }
  }
}

// Function to update imports in all files
async function updateImports() {
  console.log('Updating imports...');
  
  // Find all TypeScript files in the project
  const files = await glob('**/*.{ts,tsx}', {
    ignore: ['node_modules/**', 'dist/**', 'build/**', '.next/**'],
  });
  
  // Create a map of old imports to new imports
  const importMap: Record<string, string> = {};
  
  // Add file renames to import map
  for (const [oldPath, newPath] of Object.entries(fileRenameMap)) {
    // Convert file path to import path (remove .ts/.tsx extension and handle index files)
    const oldImport = oldPath.replace(/\.(ts|tsx)$/, '');
    const newImport = newPath.replace(/\.(ts|tsx)$/, '');
    
    importMap[oldImport] = newImport;
  }
  
  // Update imports in each file
  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let updated = false;
    
    // Check for each import that needs to be updated
    for (const [oldImport, newImport] of Object.entries(importMap)) {
      // Match import statements for the old path
      const importRegex = new RegExp(`import\\s+(.+?)\\s+from\\s+['"](.+?${path.basename(oldImport)})['"]`, 'g');
      
      // Replace imports
      const newContent = content.replace(importRegex, (match, importNames, importPath) => {
        updated = true;
        return `import ${importNames} from '${newImport}'`;
      });
      
      if (newContent !== content) {
        content = newContent;
      }
    }
    
    // Write updated content if changes were made
    if (updated) {
      fs.writeFileSync(file, content);
      console.log(`Updated imports in ${file}`);
    }
  }
}

// Main function to run the reorganization
async function reorganizeMapFiles() {
  try {
    await renameFiles();
    await markFilesAsDeprecated();
    await updateImports();
    console.log('Map file reorganization completed successfully!');
  } catch (error) {
    console.error('Error reorganizing map files:', error);
  }
}

// Run the reorganization
reorganizeMapFiles();
