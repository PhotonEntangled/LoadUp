/**
 * upload-env-to-vercel.js
 * 
 * Script to upload environment variables from .env file to Vercel.
 * This script uses npx vercel to interact with the Vercel CLI.
 * 
 * Usage:
 *   node scripts/upload-env-to-vercel.js
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

// Get current file directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Project name on Vercel
const PROJECT_NAME = 'load-up';

console.log('Uploading environment variables to Vercel...');

// Function to run a command and return its output
function runCommand(command) {
  try {
    return execSync(command, { encoding: 'utf8', cwd: projectRoot }).trim();
  } catch (error) {
    console.error(`Error running command: ${command}`);
    console.error(error.message);
    return null;
  }
}

// Check if user is logged in to Vercel
try {
  const vercelUser = runCommand('npx vercel whoami');
  console.log(`Logged in to Vercel as: ${vercelUser}`);
} catch (error) {
  console.error('Not logged in to Vercel. Please login:');
  execSync('npx vercel login', { stdio: 'inherit', cwd: projectRoot });
}

// Path to .env file
const envFilePath = path.join(projectRoot, '.env');

// Check if .env file exists
if (!fs.existsSync(envFilePath)) {
  console.error(`Error: .env file not found at ${envFilePath}`);
  process.exit(1);
}

console.log(`Reading environment variables from ${envFilePath}`);

// Read .env file
const envContent = fs.readFileSync(envFilePath, 'utf8');
const envLines = envContent.split('\n');

// Process each line
for (const line of envLines) {
  // Skip comments and empty lines
  if (line.startsWith('#') || line.trim() === '') {
    continue;
  }

  // Parse key-value pair
  const parts = line.split('=', 2);
  if (parts.length === 2) {
    const key = parts[0].trim();
    const value = parts[1].trim();

    // Skip if key or value is empty
    if (key === '' || value === '') {
      continue;
    }

    // Skip placeholder values
    if (value === `your_${key.toLowerCase()}_here` || value.includes('your_') && value.includes('_here')) {
      console.log(`Skipping placeholder value for ${key}`);
      continue;
    }

    console.log(`Adding environment variable: ${key}`);
    
    // Create a temporary file with the value
    const tempFilePath = path.join(projectRoot, `temp_${key}.txt`);
    fs.writeFileSync(tempFilePath, value);

    try {
      // Add environment variable to Vercel with correct arguments
      // Usage: vercel env add <name> <production|preview|development> [gitbranch] < <file>
      const result = runCommand(`npx vercel env add ${key} production < ${tempFilePath}`);
      console.log(`Successfully added ${key} to Vercel`);
    } catch (error) {
      console.error(`Failed to add ${key} to Vercel: ${error.message}`);
    } finally {
      // Clean up temporary file
      fs.unlinkSync(tempFilePath);
    }
  }
}

// Pull the latest environment variables
console.log('\nPulling the latest environment variables...');
runCommand(`npx vercel pull --environment=production`);

console.log('\nEnvironment variables upload completed!');
console.log('You may need to redeploy your project for the changes to take effect.');
console.log('Run "npx vercel --prod" to deploy to production.'); 