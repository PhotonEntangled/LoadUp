#!/usr/bin/env node

/**
 * Mapbox Token Check Script
 * This script checks for Mapbox token issues and provides diagnostics
 * 
 * Usage:
 *   node src/scripts/map-token-check.js
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const STANDARD_TOKEN_VAR = 'NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN';
const TOKEN_ALIASES = [
  'MAPBOX_SECRET_TOKEN',
  'NEXT_PUBLIC_MAPBOX_TOKEN',
  'NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN',
  'REACT_APP_MAPBOX_ACCESS_TOKEN',
  'MAPBOX_ACCESS_TOKEN'
];

// Parse environment variables from .env files
function loadEnvVariables() {
  // Try loading from .env.local first
  let localEnv = {};
  try {
    if (fs.existsSync('.env.local')) {
      localEnv = dotenv.parse(fs.readFileSync('.env.local'));
      console.log('✅ Loaded variables from .env.local');
    } else {
      console.log('⚠️ No .env.local file found.');
    }
  } catch (err) {
    console.error('❌ Error loading .env.local:', err.message);
  }

  // Try loading from .env
  let defaultEnv = {};
  try {
    if (fs.existsSync('.env')) {
      defaultEnv = dotenv.parse(fs.readFileSync('.env'));
      console.log('✅ Loaded variables from .env');
    } else {
      console.log('⚠️ No .env file found.');
    }
  } catch (err) {
    console.error('❌ Error loading .env:', err.message);
  }

  // Merge the environments, with .env.local taking precedence
  return { ...defaultEnv, ...localEnv };
}

// Check if a token appears to be valid based on format
function checkTokenValidity(token) {
  if (!token) return { valid: false, reason: 'Token is empty or undefined' };
  
  // Basic checks for Mapbox token format (starts with 'pk.ey')
  if (!token.startsWith('pk.ey')) {
    return { valid: false, reason: 'Token does not start with expected prefix (pk.ey)' };
  }
  
  // Check token length (typical Mapbox tokens are ~100+ chars)
  if (token.length < 80) {
    return { valid: false, reason: 'Token appears too short for a Mapbox token' };
  }
  
  return { valid: true, reason: 'Token appears to be valid' };
}

// Mask a token for display (show only first few chars)
function maskToken(token) {
  if (!token) return 'undefined';
  return token.substring(0, 8) + '...' + token.substring(token.length - 4);
}

// Test a Mapbox token against the API
function testMapboxToken(token) {
  return new Promise((resolve, reject) => {
    if (!token) {
      reject(new Error('No token provided for testing'));
      return;
    }

    const url = `https://api.mapbox.com/styles/v1/mapbox/streets-v11?access_token=${token}`;
    
    https.get(url, (res) => {
      const { statusCode } = res;
      let rawData = '';
      
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        if (statusCode === 200) {
          resolve({ success: true, status: statusCode });
        } else {
          let parsedData;
          try {
            parsedData = JSON.parse(rawData);
          } catch (e) {
            parsedData = { message: 'Failed to parse response' };
          }
          resolve({ 
            success: false, 
            status: statusCode, 
            message: parsedData.message || 'Unknown error' 
          });
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Find all environment files in the project
function findEnvFiles() {
  const envFiles = [];
  const rootDir = path.resolve(__dirname, '../..');
  
  // Helper function to search for files
  function searchDir(dir) {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        // Skip node_modules and .git directories
        if (entry.isDirectory()) {
          if (entry.name !== 'node_modules' && entry.name !== '.git') {
            searchDir(fullPath);
          }
        } else if (entry.name.startsWith('.env')) {
          envFiles.push(fullPath);
        }
      }
    } catch (err) {
      console.error(`Error searching directory ${dir}:`, err.message);
    }
  }
  
  searchDir(rootDir);
  return envFiles;
}

// Find files that reference Mapbox tokens
function findMapboxTokenReferences() {
  const references = [];
  const rootDir = path.resolve(__dirname, '../..');
  
  // Extensions to search
  const extensions = ['.js', '.jsx', '.ts', '.tsx'];
  
  // Patterns to search for
  const patterns = [
    'mapbox.*token',
    'mapboxgl.accessToken',
    'process.env.NEXT_PUBLIC_MAPBOX',
    'MAPBOX_ACCESS_TOKEN'
  ];
  
  // Helper function to search file content
  function searchFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      for (const pattern of patterns) {
        if (content.toLowerCase().includes(pattern.toLowerCase())) {
          references.push({
            file: path.relative(rootDir, filePath),
            pattern
          });
          break; // Only add the file once
        }
      }
    } catch (err) {
      // Ignore read errors
    }
  }
  
  // Helper function to search for files
  function searchDir(dir) {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        // Skip node_modules and .git directories
        if (entry.isDirectory()) {
          if (entry.name !== 'node_modules' && entry.name !== '.git') {
            searchDir(fullPath);
          }
        } else if (extensions.includes(path.extname(entry.name))) {
          searchFile(fullPath);
        }
      }
    } catch (err) {
      console.error(`Error searching directory ${dir}:`, err.message);
    }
  }
  
  searchDir(rootDir);
  return references;
}

// Main function
async function main() {
  console.log('🔍 Mapbox Token Check\n');
  
  // Load environment variables
  console.log('📦 Loading environment variables...');
  const env = loadEnvVariables();
  
  // Check for the standard token
  console.log(`\n🔑 Checking for standard token variable (${STANDARD_TOKEN_VAR})...`);
  const standardToken = env[STANDARD_TOKEN_VAR];
  
  if (standardToken) {
    console.log(`✅ ${STANDARD_TOKEN_VAR} is defined: ${maskToken(standardToken)}`);
    
    // Validate the token format
    const validity = checkTokenValidity(standardToken);
    console.log(`   Validation: ${validity.valid ? '✅ Valid' : '❌ Invalid'} - ${validity.reason}`);
    
    // Test the token against the API
    console.log('\n🌐 Testing standard token against Mapbox API...');
    try {
      const testResult = await testMapboxToken(standardToken);
      if (testResult.success) {
        console.log(`✅ API test successful! (Status ${testResult.status})`);
      } else {
        console.log(`❌ API test failed: ${testResult.message} (Status ${testResult.status})`);
      }
    } catch (err) {
      console.error(`❌ Error testing token: ${err.message}`);
    }
  } else {
    console.log(`❌ ${STANDARD_TOKEN_VAR} is not defined.`);
  }
  
  // Check for token aliases
  console.log('\n🔄 Checking for token aliases...');
  const aliases = {};
  
  for (const alias of TOKEN_ALIASES) {
    const aliasValue = env[alias];
    if (aliasValue) {
      aliases[alias] = aliasValue;
      console.log(`⚠️ Found alias: ${alias} = ${maskToken(aliasValue)}`);
      
      // Check if it matches the standard token
      if (standardToken && aliasValue === standardToken) {
        console.log(`   ✅ Matches standard token`);
      } else if (standardToken) {
        console.log(`   ❌ Different from standard token`);
      }
    }
  }
  
  // Find all .env files
  console.log('\n📁 Finding all .env files in the project...');
  const envFiles = findEnvFiles();
  
  console.log(`Found ${envFiles.length} .env files:`);
  for (const file of envFiles) {
    console.log(`   📄 ${path.relative(path.resolve(__dirname, '../..'), file)}`);
  }
  
  // Find files that reference Mapbox tokens
  console.log('\n📝 Finding files that reference Mapbox tokens...');
  const tokenReferences = findMapboxTokenReferences();
  
  console.log(`Found ${tokenReferences.length} files with Mapbox token references:`);
  for (const ref of tokenReferences) {
    console.log(`   📄 ${ref.file} (matched pattern: ${ref.pattern})`);
  }
  
  // Provide recommendations
  console.log('\n📋 Recommendations:');
  
  if (!standardToken) {
    console.log(`1. Add ${STANDARD_TOKEN_VAR} to your .env.local file`);
    
    // If we found an alias, suggest using its value
    const aliasKeys = Object.keys(aliases);
    if (aliasKeys.length > 0) {
      console.log(`   Suggested value from existing alias (${aliasKeys[0]}): ${maskToken(aliases[aliasKeys[0]])}`);
    }
  }
  
  if (Object.keys(aliases).length > 0) {
    console.log(`2. Remove aliases (${Object.keys(aliases).join(', ')}) and use only ${STANDARD_TOKEN_VAR}`);
  }
  
  console.log(`3. Run the standardization script: node src/scripts/mapbox-token-standardize.js`);
  console.log(`4. Ensure your Mapbox account has an active token with the correct scopes`);
}

// Run the main function
main().catch(err => {
  console.error('Error running checks:', err);
  process.exit(1);
}); 