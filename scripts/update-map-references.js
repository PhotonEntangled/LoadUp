/**
 * Script to update all references to FleetOverviewMapV2 with SimulatedVehicleMap
 * This script searches for imports, component usage, and file references in the codebase
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import glob from 'glob';

// Setup __dirname equivalent for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

// Files to exclude from processing
const EXCLUDED_DIRS = [
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  '_deprecated_archive'
];

// Replacements to make
const REPLACEMENTS = [
  // Import statements
  {
    find: /import\s+(?:{\s*)?FleetOverviewMapV2(?:\s*})?\s+from\s+['"](.+?)\/FleetOverviewMapV2['"];?/g,
    replace: (match, p1) => `import SimulatedVehicleMap from '${p1}/SimulatedVehicleMap';`
  },
  // Component usage
  {
    find: /<FleetOverviewMapV2(\s+[^>]*?)>/g,
    replace: '<SimulatedVehicleMap$1>'
  },
  {
    find: /<\/FleetOverviewMapV2>/g,
    replace: '</SimulatedVehicleMap>'
  },
  // Props interface
  {
    find: /SimulatedVehicleMapProps/g,
    replace: 'SimulatedVehicleMapProps'
  },
  // Text references in comments or documentation
  {
    find: /FleetOverviewMapV2\.tsx/g,
    replace: 'SimulatedVehicleMap.tsx'
  }
];

// Find all files to process
function findFiles() {
  const allFiles = glob.sync('**/*.{ts,tsx,js,jsx,md}', {
    ignore: EXCLUDED_DIRS.map(dir => `**/${dir}/**`)
  });
  
  console.log(`Found ${allFiles.length} files to scan`);
  return allFiles;
}

// Process a single file
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let newContent = content;
    
    // Apply all replacements
    for (const { find, replace } of REPLACEMENTS) {
      const originalContent = newContent;
      newContent = newContent.replace(find, replace);
      
      if (originalContent !== newContent) {
        modified = true;
      }
    }
    
    // Update file if modified
    if (modified) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`Updated: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
}

// Main function
function main() {
  console.log('Starting map reference update script...');
  
  // Create backup of SimulatedVehicleMap.tsx if it exists
  const fleetOverviewPath = path.resolve(process.cwd(), './src/components/map/SimulatedVehicleMap.tsx');
  if (fs.existsSync(fleetOverviewPath)) {
    const backupDir = path.resolve(process.cwd(), './_deprecated_archive');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const backupPath = path.join(backupDir, `SimulatedVehicleMap.tsx.${timestamp}.deprecated`);
    
    fs.copyFileSync(fleetOverviewPath, backupPath);
    console.log(`Created backup of SimulatedVehicleMap.tsx at ${backupPath}`);
  }
  
  // Find and process files
  const files = findFiles();
  let updatedCount = 0;
  
  for (const file of files) {
    if (processFile(file)) {
      updatedCount++;
    }
  }
  
  console.log(`\nUpdate complete!`);
  console.log(`Updated ${updatedCount} files with SimulatedVehicleMap references.`);
}

// Run the script
main(); 