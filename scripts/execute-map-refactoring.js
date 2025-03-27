const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

// Execute a command and return a promise
function execPromise(command, logPrefix = '') {
  return new Promise((resolve, reject) => {
    console.log(`${colors.blue}${logPrefix} Running: ${command}${colors.reset}`);
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`${colors.red}${logPrefix} Error: ${error.message}${colors.reset}`);
        reject(error);
        return;
      }
      
      if (stderr) {
        console.warn(`${colors.yellow}${logPrefix} Warning: ${stderr}${colors.reset}`);
      }
      
      console.log(`${colors.green}${logPrefix} ${stdout}${colors.reset}`);
      resolve(stdout);
    });
  });
}

// Ensure all necessary files exist
async function checkPrerequisites() {
  console.log(`${colors.blue}Checking prerequisites...${colors.reset}`);
  
  const requiredFiles = [
    'src/utils/maps/MapManager.ts',
    'src/components/map/VehicleTrackingMap.tsx',
    'src/components/map/MapMarkerLayer.tsx',
    'src/components/map/MapRouteLayer.tsx',
    'src/store/stableSelectorStore.ts',
    'src/store/stableVehicleStore.ts',
    'scripts/cleanup-deprecated-map-files.js',
    'scripts/update-map-component-imports.js'
  ];
  
  let allExist = true;
  
  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      console.error(`${colors.red}Missing required file: ${file}${colors.reset}`);
      allExist = false;
    }
  }
  
  if (!allExist) {
    throw new Error('Prerequisites check failed.');
  }
  
  console.log(`${colors.green}All prerequisite files exist.${colors.reset}`);
}

// Main execution function
async function main() {
  try {
    console.log(`${colors.magenta}=== Map Component Refactoring Script ===${colors.reset}`);
    
    // Check prerequisites
    await checkPrerequisites();
    
    // Backup the codebase
    console.log(`${colors.yellow}Creating backup...${colors.reset}`);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = `backup_${timestamp}`;
    
    if (!fs.existsSync('backups')) {
      fs.mkdirSync('backups');
    }
    
    await execPromise(`mkdir -p backups/${backupDir}`, '📦');
    await execPromise(`cp -r src backups/${backupDir}/`, '📦');
    console.log(`${colors.green}Backup created at backups/${backupDir}${colors.reset}`);
    
    // Step 1: Update imports
    console.log(`${colors.blue}Step 1: Updating component imports...${colors.reset}`);
    await execPromise('node scripts/update-map-component-imports.js', '🔄');
    
    // Step 2: Clean up deprecated files
    console.log(`${colors.blue}Step 2: Cleaning up deprecated files...${colors.reset}`);
    await execPromise('node scripts/cleanup-deprecated-map-files.js', '🧹');
    
    // Step 3: Suggest SimulationPanel refactoring
    console.log(`${colors.yellow}
Step 3: Manual task required:
- Refactor src/components/map/SimulationPanel.tsx to use stable selectors
- Create missing VehicleSimulationProvider.tsx
- Create missing ShipmentVehicleSimulator.ts

See docs/map-refactoring-checklist.md for details.
${colors.reset}`);
    
    // Step 4: Run tests if available
    if (fs.existsSync('package.json')) {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      if (packageJson.scripts && packageJson.scripts.test) {
        console.log(`${colors.blue}Step 4: Running tests...${colors.reset}`);
        try {
          await execPromise('npm test', '🧪');
        } catch (e) {
          console.warn(`${colors.yellow}Tests failed, but continuing. Please fix tests after refactoring.${colors.reset}`);
        }
      }
    }
    
    console.log(`${colors.magenta}
=== Map Component Refactoring Completed ===

Please check the following:
1. Open your application and verify map functionality
2. Check console for any render loop warnings
3. Complete any manual tasks from the checklist
4. Run performance tests with many vehicles

See docs/map-refactoring-checklist.md for remaining tasks.
${colors.reset}`);
    
  } catch (error) {
    console.error(`${colors.red}Refactoring failed: ${error.message}${colors.reset}`);
  }
}

// Execute main function
main(); 