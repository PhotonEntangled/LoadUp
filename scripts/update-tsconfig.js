/**
 * update-tsconfig.js
 * 
 * This script updates the tsconfig.json file with path mappings from the centralized configuration.
 */

const fs = require('fs');
const path = require('path');
const { getTsConfigPathMappings } = require('./path-aliases');

// Path to the root tsconfig.json
const tsconfigPath = path.resolve(__dirname, '../tsconfig.json');

// Read the existing tsconfig.json
let tsconfig;
try {
  const tsconfigContent = fs.readFileSync(tsconfigPath, 'utf8');
  tsconfig = JSON.parse(tsconfigContent);
} catch (error) {
  console.error('Error reading tsconfig.json:', error);
  process.exit(1);
}

// Update the paths in compilerOptions
tsconfig.compilerOptions = tsconfig.compilerOptions || {};
tsconfig.compilerOptions.paths = getTsConfigPathMappings();

// Write the updated tsconfig.json
try {
  fs.writeFileSync(
    tsconfigPath,
    JSON.stringify(tsconfig, null, 2),
    'utf8'
  );
  console.log('Successfully updated tsconfig.json with path mappings');
} catch (error) {
  console.error('Error writing tsconfig.json:', error);
  process.exit(1);
}

// Now update package-specific tsconfig.json files to extend the root config
const packagesDir = path.resolve(__dirname, '../packages');
const appsDir = path.resolve(__dirname, '../apps');

// Function to update a package's tsconfig.json
function updatePackageTsConfig(packageDir) {
  const packageTsconfigPath = path.resolve(packageDir, 'tsconfig.json');
  
  // Check if the package has a tsconfig.json
  if (!fs.existsSync(packageTsconfigPath)) {
    return;
  }
  
  // Read the existing package tsconfig.json
  let packageTsconfig;
  try {
    const packageTsconfigContent = fs.readFileSync(packageTsconfigPath, 'utf8');
    packageTsconfig = JSON.parse(packageTsconfigContent);
  } catch (error) {
    console.error(`Error reading ${packageTsconfigPath}:`, error);
    return;
  }
  
  // Update to extend the root tsconfig.json
  packageTsconfig.extends = '../../tsconfig.json';
  
  // Remove paths if they exist (they'll be inherited from the root config)
  if (packageTsconfig.compilerOptions && packageTsconfig.compilerOptions.paths) {
    delete packageTsconfig.compilerOptions.paths;
  }
  
  // Write the updated package tsconfig.json
  try {
    fs.writeFileSync(
      packageTsconfigPath,
      JSON.stringify(packageTsconfig, null, 2),
      'utf8'
    );
    console.log(`Successfully updated ${packageTsconfigPath}`);
  } catch (error) {
    console.error(`Error writing ${packageTsconfigPath}:`, error);
  }
}

// Update tsconfig.json for all packages
if (fs.existsSync(packagesDir)) {
  const packages = fs.readdirSync(packagesDir);
  packages.forEach(packageName => {
    const packageDir = path.resolve(packagesDir, packageName);
    if (fs.statSync(packageDir).isDirectory()) {
      updatePackageTsConfig(packageDir);
    }
  });
}

// Update tsconfig.json for all apps
if (fs.existsSync(appsDir)) {
  const apps = fs.readdirSync(appsDir);
  apps.forEach(appName => {
    const appDir = path.resolve(appsDir, appName);
    if (fs.statSync(appDir).isDirectory()) {
      updatePackageTsConfig(appDir);
    }
  });
}

console.log('Finished updating all tsconfig.json files'); 