/**
 * Map Debugging Report Generator
 * 
 * This script analyzes the map implementation and reports issues.
 * It checks:
 * 1. Environment variables related to maps
 * 2. Dependencies in package.json
 * 3. Files related to map implementations
 * 4. Potential issues in map components
 */

const fs = require('fs');
const path = require('path');
const util = require('util');
const readFile = util.promisify(fs.readFile);
const readdir = util.promisify(fs.readdir);
const stat = util.promisify(fs.stat);

// Configuration
const MAP_IMPLEMENTATION_FILES = [
  'src/components/map/FleetOverviewMap.tsx',
  'src/components/map/SimulatedVehicleMap.tsx',
  'src/components/map/FleetOverviewMapWrapper.tsx',
  'src/store/map/useMapViewStore.ts',
  'src/store/map/useVehicleStore.ts',
  'src/store/map/useLocationStore.ts',
  'src/pages/admin/emergency-map.tsx',
  'src/pages/admin/truly-minimal-map.tsx'
];

// Helper functions
async function fileExists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch (err) {
    return false;
  }
}

async function searchFilesForPattern(directory, pattern, fileExtensions = ['.ts', '.tsx', '.js', '.jsx']) {
  const results = [];
  
  async function searchDirectory(currentPath) {
    const files = await readdir(currentPath);
    
    for (const file of files) {
      const filePath = path.join(currentPath, file);
      const stats = await stat(filePath);
      
      if (stats.isDirectory()) {
        await searchDirectory(filePath);
      } else if (fileExtensions.includes(path.extname(file))) {
        const content = await readFile(filePath, 'utf8');
        if (content.includes(pattern)) {
          results.push(filePath);
        }
      }
    }
  }
  
  await searchDirectory(directory);
  return results;
}

// Main analysis function
async function analyzeMapImplementation() {
  console.log('='.repeat(80));
  console.log('MAP DEBUGGING REPORT');
  console.log('='.repeat(80));
  
  // Check environment variables
  console.log('\n1. Environment Variables Check');
  console.log('-'.repeat(40));
  
  const envVars = [
    'NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN',  // Standardized token variable
    'MAPBOX_SECRET_TOKEN',              // Old token variables
    'NEXT_PUBLIC_MAPBOX_TOKEN',
    'REACT_APP_MAPBOX_ACCESS_TOKEN'
  ];
  
  try {
    const envFile = await readFile('.env', 'utf8');
    const envLines = envFile.split('\n');
    
    for (const varName of envVars) {
      const varLine = envLines.find(line => line.startsWith(varName + '='));
      if (varLine) {
        const value = varLine.split('=')[1].trim();
        const maskedValue = value.substring(0, 12) + '...';
        console.log(`${varName}: Defined in .env (${maskedValue})`);
      } else {
        console.log(`${varName}: Not defined`);
      }
    }
  } catch (err) {
    console.log('Could not read .env file:', err.message);
  }
  
  // Check dependencies
  console.log('\n2. Dependencies Check');
  console.log('-'.repeat(40));
  
  try {
    const packageJson = JSON.parse(await readFile('package.json', 'utf8'));
    const mapDeps = {
      'mapbox-gl': packageJson.dependencies['mapbox-gl'] || 'Not installed',
      'react-map-gl': packageJson.dependencies['react-map-gl'] || 'Not installed',
      '@turf/turf': packageJson.dependencies['@turf/turf'] || 'Not installed',
      '@types/mapbox-gl': packageJson.devDependencies?.['@types/mapbox-gl'] || packageJson.dependencies?.['@types/mapbox-gl'] || 'Not installed'
    };
    
    console.log('Map-related dependencies:');
    Object.entries(mapDeps).forEach(([dep, version]) => {
      console.log(`- ${dep}: ${version}`);
    });
  } catch (err) {
    console.log('Could not read package.json:', err.message);
  }
  
  // Check file existence
  console.log('\n3. Files Check');
  console.log('-'.repeat(40));
  
  for (const filePath of MAP_IMPLEMENTATION_FILES) {
    const exists = await fileExists(filePath);
    console.log(`${filePath}: ${exists ? 'Exists' : 'Missing'}`);
  }
  
  // Check token usage
  console.log('\n4. Mapbox Token Usage');
  console.log('-'.repeat(40));
  
  try {
    const tokenAccessPatterns = [
      'process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN',  // Standardized token - should be used
      'process.env.MAPBOX_SECRET_TOKEN',              // Old tokens - should be removed
      'process.env.NEXT_PUBLIC_MAPBOX_TOKEN',
      'process.env.REACT_APP_MAPBOX_ACCESS_TOKEN',
      'pk.eyJ1'  // Hardcoded token pattern
    ];
    
    for (const pattern of tokenAccessPatterns) {
      const files = await searchFilesForPattern('src', pattern);
      console.log(`Files using ${pattern}:`);
      if (files.length === 0) {
        console.log('  None found');
      } else {
        files.forEach(file => console.log(`  - ${file}`));
      }
    }
  } catch (err) {
    console.log('Error analyzing token usage:', err.message);
  }
  
  // Check for potential infinite loop patterns
  console.log('\n5. Potential Infinite Loop Patterns');
  console.log('-'.repeat(40));
  
  const infiniteLoopPatterns = [
    'useCallback( without dependency array',
    'useEffect( without dependency array',
    'useState( inside render',
    'setViewState(',
    'setState( inside render'
  ];
  
  for (const pattern of infiniteLoopPatterns) {
    console.log(`Checking for: ${pattern}`);
    try {
      // These patterns need custom checks rather than simple string includes
      if (pattern.includes('useCallback( without')) {
        const files = await searchFilesForPattern('src', 'useCallback(');
        for (const file of files) {
          const content = await readFile(file, 'utf8');
          if (content.includes('useCallback(') && !content.includes('useCallback(', [])) {
            console.log(`  - ${file}`);
          }
        }
      } else if (pattern.includes('useEffect( without')) {
        const files = await searchFilesForPattern('src', 'useEffect(');
        for (const file of files) {
          const content = await readFile(file, 'utf8');
          if (content.includes('useEffect(') && !content.includes('useEffect(', [])) {
            console.log(`  - ${file}`);
          }
        }
      } else {
        const simplifiedPattern = pattern.split(' ')[0];
        const files = await searchFilesForPattern('src', simplifiedPattern);
        if (files.length > 0) {
          console.log(`  Found in ${files.length} files:`);
          files.slice(0, 5).forEach(file => console.log(`  - ${file}`));
          if (files.length > 5) {
            console.log(`  ... and ${files.length - 5} more`);
          }
        } else {
          console.log('  None found');
        }
      }
    } catch (err) {
      console.log(`  Error checking for ${pattern}:`, err.message);
    }
  }
  
  console.log('\n6. Recommendations');
  console.log('-'.repeat(40));
  console.log('1. Verify NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN is correctly set in .env file (standardized token)');
  console.log('2. Update all components to consistently use NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN');
  console.log('3. Memoize state selectors and event handlers to prevent re-renders');
  console.log('4. Add React.memo() to map components to prevent unnecessary re-renders');
  console.log('5. Test the emergency-map.tsx implementation to verify token access works');
  console.log('6. Consider rebuilding map implementation using useReducer instead of Zustand');
  
  console.log('\n='.repeat(80));
}

// Run the analysis
analyzeMapImplementation().catch(error => {
  console.error('Analysis failed:', error);
  process.exit(1);
}); 