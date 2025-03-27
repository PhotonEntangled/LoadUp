/**
 * vercel-setup.js
 * 
 * Script to set up Vercel deployment with environment variables.
 * This script configures the Vercel project and sets up all required environment variables.
 * 
 * Usage:
 *   node scripts/vercel-setup.js
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('Setting up Vercel deployment...');

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
  const whoami = runCommand('npx vercel whoami');
  console.log(`Logged in to Vercel as: ${whoami}`);
} catch (error) {
  console.log('Not logged in to Vercel. Please login:');
  execSync('npx vercel login', { stdio: 'inherit', cwd: projectRoot });
}

// Link the project to Vercel if not already linked
if (!fs.existsSync(path.join(projectRoot, '.vercel'))) {
  console.log('Linking project to Vercel...');
  execSync('npx vercel link', { stdio: 'inherit', cwd: projectRoot });
}

// Get environment variables from GitHub secrets
console.log('Setting up environment variables...');

// List of environment variables to set
const envVars = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'SENTRY_DSN',
  'SENTRY_ORG',
  'SENTRY_PROJECT',
  'SENTRY_AUTH_TOKEN',
  'GOOGLE_CLOUD_VISION_API_KEY',
  'MAPBOX_ACCESS_TOKEN',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_PUBLISHABLE_KEY'
];

// Set environment variables
for (const envVar of envVars) {
  // Check if the environment variable exists in the current environment
  if (process.env[envVar]) {
    console.log(`Setting ${envVar}...`);
    // Create a temporary file with the environment variable value
    const tempFilePath = path.join(projectRoot, '.env-temp');
    fs.writeFileSync(tempFilePath, process.env[envVar]);
    
    try {
      runCommand(`npx vercel env add ${envVar} production < ${tempFilePath}`);
      // Clean up the temporary file
      fs.unlinkSync(tempFilePath);
    } catch (error) {
      console.error(`Failed to set ${envVar}: ${error.message}`);
      // Clean up the temporary file
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    }
  } else {
    console.log(`Warning: ${envVar} not found in environment. Skipping.`);
  }
}

// Set up project settings
console.log('Configuring Vercel project settings...');

// Update vercel.json if needed
const vercelConfigPath = path.join(projectRoot, 'vercel.json');
const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));

// Ensure the configuration is correct
vercelConfig.buildCommand = 'npm run build';
vercelConfig.outputDirectory = 'apps/admin-dashboard/.next';
vercelConfig.installCommand = 'npm ci';
vercelConfig.framework = 'nextjs';

// Add or update rewrites
vercelConfig.rewrites = [
  {
    "source": "/(.*)",
    "destination": "/apps/admin-dashboard/$1"
  }
];

// Add or update environment variables
vercelConfig.env = {
  ...vercelConfig.env,
  "NEXT_PUBLIC_API_URL": "/api"
};

// Write the updated config back to the file
fs.writeFileSync(vercelConfigPath, JSON.stringify(vercelConfig, null, 2));

// Deploy to Vercel
console.log('Deploying to Vercel...');
execSync('npx vercel --prod', { stdio: 'inherit', cwd: projectRoot });

console.log('Vercel deployment setup completed successfully!'); 