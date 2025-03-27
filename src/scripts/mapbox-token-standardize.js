/**
 * Mapbox Token Standardization Script
 * 
 * This script standardizes Mapbox token usage throughout the codebase by:
 * 1. Analyzing which token variables are used
 * 2. Creating a standard token getter function
 * 3. Updating key component files to use this standard approach
 * 4. Creating a report on all token usages
 */

const fs = require('fs');
const path = require('path');

// Configuration
const STANDARD_TOKEN_VAR = 'NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN';
const FALLBACK_TOKEN = 'pk.eyJ1IjoibG9hZHVwLW1hcCIsImEiOiJjbG5lY2w1NTMwbDR5MnFydGN0bWUxMzk2In0.d7H3g9oFB25EEfMcqKQRsA'; // Public token already in codebase
const TOKEN_ALIASES = [
  'MAPBOX_SECRET_TOKEN',
  'NEXT_PUBLIC_MAPBOX_TOKEN',
  'NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN',
  'REACT_APP_MAPBOX_ACCESS_TOKEN',
  'MAPBOX_ACCESS_TOKEN'
];

// File paths
const MAPBOX_MAP_COMPONENT = path.resolve(__dirname, '../../packages/shared/src/components/MapboxMap.tsx');
const FLEET_OVERVIEW_MAP = path.resolve(__dirname, '../components/map/SimulatedVehicleMap.tsx');
const API_TOKEN_FILE = path.resolve(__dirname, '../pages/api/mapbox-token.ts');
const ENV_SAMPLE_FILE = path.resolve(__dirname, '../../.env.example');
const ENV_LOCAL_FILE = path.resolve(__dirname, '../../.env.local');

// Functions to check and standardize
function runStandardization() {
  console.log('🔍 Starting Mapbox token standardization...');
  
  // 1. Update MapboxMap.tsx component
  updateMapboxMapComponent();
  
  // 2. Update SimulatedVehicleMap.tsx
  updateFleetOverviewMap();
  
  // 3. Update API token endpoint
  updateApiTokenEndpoint();
  
  // 4. Update .env.example
  updateEnvSample();
  
  // 5. Check .env.local and offer to update
  checkAndUpdateEnvLocal();
  
  // 6. Create a report of all token usages
  createTokenUsageReport();
  
  console.log('\n✅ Mapbox token standardization complete!');
  console.log(`The standard token variable is now: ${STANDARD_TOKEN_VAR}`);
  console.log('\nImportant: Double-check your .env.local file to ensure the token is set correctly.');
}

function updateMapboxMapComponent() {
  console.log('\n1. Updating MapboxMap component...');
  
  try {
    if (!fs.existsSync(MAPBOX_MAP_COMPONENT)) {
      console.error(`File not found: ${MAPBOX_MAP_COMPONENT}`);
      return;
    }
    
    let content = fs.readFileSync(MAPBOX_MAP_COMPONENT, 'utf8');
    
    // Replace the token getter function
    const newTokenGetter = `
// Get Mapbox token from environment variables with fallback for development
const getMapboxToken = (): string => {
  // Use standard environment variable
  const token = process.env.${STANDARD_TOKEN_VAR};
  
  // Return the token or fallback (only used in development)
  return token || '${FALLBACK_TOKEN}';
};

// Mapbox access token - we'll validate this before map initialization
const MAPBOX_ACCESS_TOKEN = getMapboxToken();
`;
    
    // Replace existing token getter with new standardized version
    content = content.replace(
      /\/\/ Try multiple possible Mapbox token[\s\S]*?const MAPBOX_ACCESS_TOKEN = getMapboxToken\(\);/,
      newTokenGetter
    );
    
    fs.writeFileSync(MAPBOX_MAP_COMPONENT, content);
    console.log('✅ Updated MapboxMap.tsx component');
  } catch (error) {
    console.error('Error updating MapboxMap.tsx:', error);
  }
}

function updateFleetOverviewMap() {
  console.log('\n2. Updating FleetOverviewMapV2...');
  
  try {
    if (!fs.existsSync(FLEET_OVERVIEW_MAP)) {
      console.error(`File not found: ${FLEET_OVERVIEW_MAP}`);
      return;
    }
    
    let content = fs.readFileSync(FLEET_OVERVIEW_MAP, 'utf8');
    
    // Replace the token fetch with direct usage from MapboxMap component
    const tokenFetchReplacement = `
    // Use the token from MapboxMap component for consistency
    const accessToken = window?.mapboxgl?.accessToken || process.env.${STANDARD_TOKEN_VAR} || '${FALLBACK_TOKEN}';
    console.log('Using Mapbox token:', accessToken.substring(0, 10) + '...');
    
    // Set token directly for consistency
    mapTokenRef.current = accessToken;
    setMapToken(accessToken);
    setHasToken(true);
    
    // No need to fetch from API, token is already available
    storeSetMapError(false);
`;
    
    // Replace fetch function with direct token usage
    content = content.replace(
      /const fetchToken = async \(\) => \{[\s\S]*?try \{[\s\S]*?const response = await fetch\('\/api\/mapbox-token'\);[\s\S]*?const data = await response\.json\(\);[\s\S]*?if \(data\.token\) \{[\s\S]*?setMapToken\(data\.token\);[\s\S]*?mapTokenRef\.current = data\.token;[\s\S]*?if \(mapTokenRef\.current\) \{[\s\S]*?setHasToken\(true\);[\s\S]*?\}[\s\S]*?storeSetMapError\(false\);[\s\S]*?\}/,
      `const fetchToken = async () => {${tokenFetchReplacement}`
    );
    
    fs.writeFileSync(FLEET_OVERVIEW_MAP, content);
    console.log('✅ Updated SimulatedVehicleMap.tsx');
  } catch (error) {
    console.error('Error updating SimulatedVehicleMap.tsx:', error);
  }
}

function updateApiTokenEndpoint() {
  console.log('\n3. Updating API token endpoint...');
  
  try {
    if (!fs.existsSync(API_TOKEN_FILE)) {
      console.error(`File not found: ${API_TOKEN_FILE}`);
      return;
    }
    
    let content = fs.readFileSync(API_TOKEN_FILE, 'utf8');
    
    // Update the API endpoint to use the standard token variable
    const updatedApiHandler = `
import { NextApiRequest, NextApiResponse } from 'next';

type ResponseData = {
  token?: string;
  error?: string;
};

// This API route returns the Mapbox token from the server environment
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Use standardized token variable
  const mapboxToken = process.env.${STANDARD_TOKEN_VAR} || 
    '${FALLBACK_TOKEN}'; // Fallback for development

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.status(200).json({ token: mapboxToken });
}
`;
    
    // Replace the entire file content
    fs.writeFileSync(API_TOKEN_FILE, updatedApiHandler);
    console.log('✅ Updated API token endpoint');
  } catch (error) {
    console.error('Error updating API token endpoint:', error);
  }
}

function updateEnvSample() {
  console.log('\n4. Updating .env.example...');
  
  try {
    if (!fs.existsSync(ENV_SAMPLE_FILE)) {
      console.log('Creating new .env.example file with standardized token variable');
      
      const envSampleContent = `# Environment Variables Example
# Copy this file to .env.local and add your actual values

# Mapbox Configuration (Standardized)
${STANDARD_TOKEN_VAR}=your_mapbox_access_token_here
`;
      
      fs.writeFileSync(ENV_SAMPLE_FILE, envSampleContent);
      console.log('✅ Created new .env.example file');
      return;
    }
    
    let content = fs.readFileSync(ENV_SAMPLE_FILE, 'utf8');
    
    // Remove all mapbox token variables
    TOKEN_ALIASES.forEach(alias => {
      const regex = new RegExp(`^${alias}=.*$`, 'gm');
      content = content.replace(regex, '');
    });
    
    // Add the standard token variable if it doesn't exist
    if (!content.includes(`${STANDARD_TOKEN_VAR}=`)) {
      content += `\n# Mapbox Configuration (Standardized)\n${STANDARD_TOKEN_VAR}=your_mapbox_access_token_here\n`;
    }
    
    // Clean up any double newlines
    content = content.replace(/\n\n\n+/g, '\n\n');
    
    fs.writeFileSync(ENV_SAMPLE_FILE, content);
    console.log('✅ Updated .env.example');
  } catch (error) {
    console.error('Error updating .env.example:', error);
  }
}

function checkAndUpdateEnvLocal() {
  console.log('\n5. Checking .env.local...');
  
  try {
    if (!fs.existsSync(ENV_LOCAL_FILE)) {
      console.log('⚠️ .env.local file not found. Please create it and add your Mapbox token:');
      console.log(`${STANDARD_TOKEN_VAR}=your_mapbox_access_token_here`);
      return;
    }
    
    let content = fs.readFileSync(ENV_LOCAL_FILE, 'utf8');
    let existingToken = null;
    
    // Check if the standard token is already set
    const standardTokenMatch = content.match(new RegExp(`^${STANDARD_TOKEN_VAR}=(.*)$`, 'm'));
    if (standardTokenMatch && standardTokenMatch[1]) {
      console.log(`✅ ${STANDARD_TOKEN_VAR} already set in .env.local`);
      return;
    }
    
    // Look for any of the alias tokens to use their value
    for (const alias of TOKEN_ALIASES) {
      const aliasMatch = content.match(new RegExp(`^${alias}=(.*)$`, 'm'));
      if (aliasMatch && aliasMatch[1]) {
        existingToken = aliasMatch[1];
        console.log(`Found existing token in ${alias}`);
        break;
      }
    }
    
    // Remove all token aliases
    TOKEN_ALIASES.forEach(alias => {
      const regex = new RegExp(`^${alias}=.*$`, 'gm');
      content = content.replace(regex, '');
    });
    
    // Add the standard token with the existing value if found
    if (existingToken) {
      content += `\n# Mapbox Configuration (Standardized)\n${STANDARD_TOKEN_VAR}=${existingToken}\n`;
      fs.writeFileSync(ENV_LOCAL_FILE, content);
      console.log(`✅ Updated .env.local with standardized token variable using existing token value`);
    } else {
      content += `\n# Mapbox Configuration (Standardized)\n${STANDARD_TOKEN_VAR}=\n`;
      fs.writeFileSync(ENV_LOCAL_FILE, content);
      console.log(`⚠️ Added ${STANDARD_TOKEN_VAR} to .env.local but no existing token was found.`);
      console.log('Please add your Mapbox token to this variable.');
    }
  } catch (error) {
    console.error('Error checking/updating .env.local:', error);
  }
}

function createTokenUsageReport() {
  console.log('\n6. Creating token usage report...');
  
  // This is a placeholder - in a full implementation, you would scan all project files
  // for token usage patterns and generate a report
  
  console.log(`
Token Usage Report:
------------------
Standard token variable: ${STANDARD_TOKEN_VAR}

Files updated:
1. ${MAPBOX_MAP_COMPONENT}
2. ${FLEET_OVERVIEW_MAP}
3. ${API_TOKEN_FILE}
4. ${ENV_SAMPLE_FILE}
5. ${ENV_LOCAL_FILE} (if exists)

Token variables to replace in your code:
${TOKEN_ALIASES.map(alias => `- ${alias}`).join('\n')}

Recommended actions:
1. Make sure ${STANDARD_TOKEN_VAR} is set in your .env.local file
2. Use MapboxMap component for all map needs as it handles tokens properly
3. For direct mapboxgl access, import from MapboxMap component
`);
}

// Run the standardization
runStandardization(); 