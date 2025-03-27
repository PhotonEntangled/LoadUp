#!/usr/bin/env node

/**
 * Quick Map Fix Script
 * 
 * This script performs quick fixes for common Mapbox map rendering issues:
 * 1. Verifies that the Mapbox token is correctly set in the .env.local file
 * 2. Creates a backup of the MapboxMap.tsx component
 * 3. Updates the component with the standardized token approach
 * 4. Clears browser caches to ensure the changes take effect
 * 
 * Usage:
 *   node src/scripts/quick-map-fix.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { execSync } from 'child_process';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const STANDARD_TOKEN_VAR = 'NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN';
const FALLBACK_TOKEN = 'pk.eyJ1IjoibG9hZHVwLW1hcCIsImEiOiJjbG5lY2w1NTMwbDR5MnFydGN0bWUxMzk2In0.d7H3g9oFB25EEfMcqKQRsA';
const MAPBOX_MAP_COMPONENT = path.resolve(__dirname, '../../packages/shared/src/components/MapboxMap.tsx');
const ENV_LOCAL_FILE = path.resolve(__dirname, '../../.env.local');
const BACKUP_DIR = path.resolve(__dirname, '../../.backups');

// ASCII art banner
console.log(`
╭───────────────────────────────────────╮
│                                       │
│        Mapbox Quick Fix Script        │
│                                       │
│        🗺️  Map Rendering Fix  🗺️        │
│                                       │
╰───────────────────────────────────────╯
`);

// Create backup directory if it doesn't exist
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  console.log(`Created backup directory: ${BACKUP_DIR}`);
}

// Add timestamp to backup files
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

// Function to create a backup of a file
function backupFile(filePath, label) {
  const fileName = path.basename(filePath);
  const backupPath = path.join(BACKUP_DIR, `${fileName}.${label}.${timestamp}.bak`);
  
  if (fs.existsSync(filePath)) {
    fs.copyFileSync(filePath, backupPath);
    console.log(`✅ Created backup of ${fileName} at ${backupPath}`);
    return true;
  } else {
    console.log(`❌ Cannot backup ${fileName} - file not found`);
    return false;
  }
}

// Function to check and update .env.local
function checkAndUpdateEnvLocal() {
  console.log('\n🔍 Checking .env.local...');
  
  // Create .env.local if it doesn't exist
  if (!fs.existsSync(ENV_LOCAL_FILE)) {
    console.log('❌ .env.local file not found. Creating it...');
    fs.writeFileSync(ENV_LOCAL_FILE, `# Environment Variables\n\n# Mapbox Token\n${STANDARD_TOKEN_VAR}=${FALLBACK_TOKEN}\n`);
    console.log(`✅ Created .env.local with default Mapbox token`);
    return;
  }
  
  // Backup .env.local
  backupFile(ENV_LOCAL_FILE, 'envlocal');
  
  // Check if standard token variable exists
  let content = fs.readFileSync(ENV_LOCAL_FILE, 'utf8');
  const hasStandardToken = content.includes(`${STANDARD_TOKEN_VAR}=`);
  
  if (!hasStandardToken) {
    console.log(`❌ ${STANDARD_TOKEN_VAR} not found in .env.local. Adding it...`);
    content += `\n# Mapbox Token (Added by quick-fix)\n${STANDARD_TOKEN_VAR}=${FALLBACK_TOKEN}\n`;
    fs.writeFileSync(ENV_LOCAL_FILE, content);
    console.log(`✅ Added ${STANDARD_TOKEN_VAR} to .env.local`);
  } else {
    console.log(`✅ ${STANDARD_TOKEN_VAR} already exists in .env.local`);
  }
}

// Function to update MapboxMap component
function updateMapboxMapComponent() {
  console.log('\n🔍 Checking MapboxMap component...');
  
  if (!fs.existsSync(MAPBOX_MAP_COMPONENT)) {
    console.log(`❌ MapboxMap component not found at ${MAPBOX_MAP_COMPONENT}`);
    return;
  }
  
  // Backup MapboxMap component
  backupFile(MAPBOX_MAP_COMPONENT, 'component');
  
  // Read the component file
  let content = fs.readFileSync(MAPBOX_MAP_COMPONENT, 'utf8');
  
  // Define the token getter implementation
  const tokenGetterImplementation = `
// Use a simple local implementation that doesn't rely on external imports
// This avoids circular dependencies and path issues
const getMapboxToken = (): string => {
  // Use standard environment variable
  const token = process.env.${STANDARD_TOKEN_VAR};
  
  // Fallback token for development
  const fallbackToken = '${FALLBACK_TOKEN}';
  
  // Return the token or fallback
  return token || fallbackToken;
};

// Mapbox access token - we'll validate this before map initialization
const MAPBOX_ACCESS_TOKEN = getMapboxToken();
`;

  // Look for different token getter patterns
  const patterns = [
    /\/\/ Try multiple possible Mapbox token[\s\S]*?const MAPBOX_ACCESS_TOKEN = getMapboxToken\(\);/,
    /\/\/ Get Mapbox token[\s\S]*?const MAPBOX_ACCESS_TOKEN = getMapboxToken\(\);/,
    /\/\/ Use a simple local implementation[\s\S]*?const MAPBOX_ACCESS_TOKEN = getMapboxToken\(\);/,
    /import \{ getMapboxToken[\s\S]*?const MAPBOX_ACCESS_TOKEN = getMapboxToken\(\);/
  ];
  
  let patternFound = false;
  
  for (const pattern of patterns) {
    if (pattern.test(content)) {
      content = content.replace(pattern, tokenGetterImplementation);
      patternFound = true;
      break;
    }
  }
  
  if (patternFound) {
    fs.writeFileSync(MAPBOX_MAP_COMPONENT, content);
    console.log(`✅ Updated token getter in MapboxMap component`);
  } else {
    console.log(`❓ Could not find token getter pattern in MapboxMap component`);
    console.log(`⚠️ You may need to manually update the component`);
  }
}

// Function to clear Next.js cache
function clearNextJsCache() {
  console.log('\n🔍 Clearing Next.js cache...');
  
  try {
    // Check if .next directory exists
    const nextDir = path.resolve(__dirname, '../../.next');
    if (fs.existsSync(nextDir)) {
      // Backup might not be necessary for cache, but just in case
      backupFile(path.join(nextDir, 'cache'), 'nextcache');
      
      console.log('Clearing Next.js cache...');
      try {
        // Use rimraf to delete the .next directory
        console.log('Removing .next directory...');
        fs.rmSync(nextDir, { recursive: true, force: true });
        console.log('✅ Next.js cache cleared by removing .next directory');
      } catch (rmError) {
        console.error('Failed to remove .next directory:', rmError.message);
        console.log('Trying alternative method...');
        
        // Alternative: Try to delete key cache files
        try {
          const cacheDir = path.join(nextDir, 'cache');
          if (fs.existsSync(cacheDir)) {
            fs.rmSync(cacheDir, { recursive: true, force: true });
            console.log('✅ Removed .next/cache directory');
          }
        } catch (cacheError) {
          console.error('Failed to remove cache directory:', cacheError.message);
        }
      }
    } else {
      console.log('⚠️ .next directory not found. No cache to clear.');
    }
  } catch (error) {
    console.error('❌ Error clearing Next.js cache:', error.message);
  }
}

// Main function
function main() {
  try {
    // Check and update .env.local
    checkAndUpdateEnvLocal();
    
    // Update MapboxMap component
    updateMapboxMapComponent();
    
    // Clear Next.js cache
    clearNextJsCache();
    
    console.log('\n✅ Quick fix completed! Please:');
    console.log('1. Restart your Next.js development server');
    console.log('2. Clear your browser cache (or use incognito mode)');
    console.log('3. If issues persist, run npm run dev with the NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN explicitly set:');
    console.log(`   NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=${FALLBACK_TOKEN} npm run dev`);
    
  } catch (error) {
    console.error('❌ Error in quick fix script:', error.message);
    console.error('⚠️ Some steps may not have completed successfully');
  }
}

// Run the main function
main(); 