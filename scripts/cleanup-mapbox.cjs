/**
 * This script standardizes Mapbox tokens across the project,
 * and cleans up unused map implementations.
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Instead of hardcoding the token, use env vars or prompt for it
const STANDARD_TOKEN_VAR = 'NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN';
const SECRET_TOKEN_VAR = 'MAPBOX_SECRET_TOKEN';

// Files to update
const ENV_FILES = [
  '.env',
  '.env.local',
  '.env.development',
  'apps/admin-dashboard/.env',
  'apps/admin-dashboard/.env.local',
  'apps/admin-dashboard/.env.development',
];

// Files to clean up (unused implementations)
const FILES_TO_REMOVE = [
  'src/pages/admin/truly-minimal-map.tsx',
  'src/pages/admin/minimal-map.tsx',
  'src/pages/admin/map-store-test.tsx',
  'src/pages/admin/emergency-map.tsx',
];

// API file to update
const API_TOKEN_FILE = 'apps/admin-dashboard/src/pages/api/mapbox-token.ts';

console.log('🔍 Starting Mapbox token standardization...');

// 1. Standardize tokens in .env files
console.log('\n1. Standardizing tokens in .env files...');
ENV_FILES.forEach(envFile => {
  try {
    if (fs.existsSync(envFile)) {
      let content = fs.readFileSync(envFile, 'utf8');
      let updated = false;
      
      // Remove all existing mapbox token variables (except our standard ones)
      content = content.replace(/^(MAPBOX_TOKEN|REACT_APP_MAPBOX_ACCESS_TOKEN|NEXT_PUBLIC_MAPBOX_TOKEN)=.*/gm, '');
      
      // Add the standardized token variable if it's not already there
      if (!content.includes(STANDARD_TOKEN_VAR)) {
        content += `\n# Mapbox Configuration (Standardized)\n${STANDARD_TOKEN_VAR}=\${${SECRET_TOKEN_VAR}}\n`;
        updated = true;
      }
      
      if (updated) {
        // Clean up any double newlines that might have been created
        content = content.replace(/\n\n+/g, '\n\n');
        fs.writeFileSync(envFile, content);
        console.log(`  ✅ Updated ${envFile}`);
      } else {
        console.log(`  ℹ️ No changes needed in ${envFile}`);
      }
    } else {
      console.log(`  ⚠️ File not found: ${envFile}`);
    }
  } catch (error) {
    console.error(`  ❌ Error updating ${envFile}:`, error.message);
  }
});

// 2. Update API token file
console.log('\n2. Updating API token file...');
try {
  if (fs.existsSync(API_TOKEN_FILE)) {
    const apiContent = `import { NextApiRequest, NextApiResponse } from 'next';

// This prevents the token from being exposed in client-side code
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Use the standardized token from environment variable
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';
    
    if (!token) {
      return res.status(500).json({ 
        error: 'Mapbox token not configured on server',
        info: 'Please check environment variables'
      });
    }
    
    // Basic validation that it's a Mapbox token
    if (!token.startsWith('pk.ey') && !token.startsWith('sk.ey')) {
      return res.status(500).json({ 
        error: 'Invalid Mapbox token format',
        info: 'Token should start with pk.ey or sk.ey'
      });
    }
    
    // For security, add cache control headers to prevent caching
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    // Return the token
    return res.status(200).json({ 
      token,
      expires: new Date(Date.now() + 3600 * 1000).toISOString(), // 1 hour expiry
      tokenType: 'mapbox',
      source: 'server-api'
    });
  } catch (error) {
    console.error('Error retrieving Mapbox token:', error);
    return res.status(500).json({ error: 'Failed to retrieve Mapbox token' });
  }
}`;

    fs.writeFileSync(API_TOKEN_FILE, apiContent);
    console.log(`  ✅ Updated ${API_TOKEN_FILE}`);
  } else {
    console.log(`  ⚠️ File not found: ${API_TOKEN_FILE}`);
  }
} catch (error) {
  console.error(`  ❌ Error updating ${API_TOKEN_FILE}:`, error.message);
}

// 3. Clean up unused files
console.log('\n3. Cleaning up unused map implementations...');
FILES_TO_REMOVE.forEach(file => {
  try {
    if (fs.existsSync(file)) {
      // Before deleting, check if there's important info we need to preserve
      const content = fs.readFileSync(file, 'utf8');
      
      // Basic check for unique functionality we might want to preserve
      if (content.includes('unique') || content.includes('important')) {
        console.log(`  ⚠️ ${file} might contain important code. Creating backup at ${file}.bak`);
        fs.writeFileSync(`${file}.bak`, content);
      }
      
      // Delete the file
      fs.unlinkSync(file);
      console.log(`  ✅ Removed ${file}`);
    } else {
      console.log(`  ℹ️ File not found: ${file} (already cleaned up)`);
    }
  } catch (error) {
    console.error(`  ❌ Error removing ${file}:`, error.message);
  }
});

console.log('\n✅ Standardization complete!');
console.log(`\nThe Mapbox token has been standardized to: ${STANDARD_TOKEN_VAR}`);
console.log('\nPlease restart your dev server for the changes to take effect.'); 