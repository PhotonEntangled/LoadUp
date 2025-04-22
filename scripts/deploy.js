#!/usr/bin/env node

/**
 * LoadUp Admin Dashboard Deployment Script
 * 
 * This script automates the deployment process to Vercel
 * It handles environment setup, build, and deployment
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const VERCEL_ORG_ID = process.env.VERCEL_ORG_ID;
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;
const SENTRY_DSN = process.env.SENTRY_DSN;
const SENTRY_AUTH_TOKEN = process.env.SENTRY_AUTH_TOKEN;
const SENTRY_ORG = process.env.SENTRY_ORG;
const SENTRY_PROJECT = process.env.SENTRY_PROJECT;

// Determine if this is a production deployment
const args = process.argv.slice(2);
const isProd = args.includes('--prod') || args.includes('-p');
const environment = isProd ? 'production' : 'preview';

// Utility to run commands and log output
function runCommand(command, options = {}) {
  console.log(`\n> ${command}\n`);
  try {
    return execSync(command, {
      stdio: 'inherit',
      ...options
    });
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    console.error(error.message);
    process.exit(1);
  }
}

// Main deployment function
async function deploy() {
  console.log('\n🚀 Starting deployment process...\n');
  
  // Check for required environment variables
  if (!VERCEL_TOKEN) {
    console.error('Error: VERCEL_TOKEN environment variable is required');
    process.exit(1);
  }
  
  // Ensure we're in the admin-dashboard directory
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.error('Error: package.json not found. Make sure you run this script from the admin-dashboard directory');
    process.exit(1);
  }
  
  // Get package version for Sentry release
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const version = packageJson.version;
  
  console.log(`📦 Deploying version ${version} to ${environment} environment`);
  
  // Create Sentry release if configured
  if (SENTRY_DSN && SENTRY_AUTH_TOKEN) {
    console.log('\n🔍 Creating Sentry release...');
    
    // Install Sentry CLI if needed
    try {
      runCommand('npx sentry-cli --version', { stdio: 'ignore' });
    } catch (error) {
      console.log('Installing @sentry/cli...');
      runCommand('npm install --no-save @sentry/cli');
    }
    
    const releaseName = `loadup-admin-dashboard@${version}`;
    
    // Create and set up the release
    runCommand(`npx sentry-cli releases new ${releaseName}`);
    runCommand(`npx sentry-cli releases set-commits ${releaseName} --auto`);
    
    // Set environment variable for the build
    process.env.SENTRY_RELEASE = releaseName;
  }
  
  // Build the application
  console.log('\n🔨 Building application...');
  runCommand('npm run build');
  
  // Deploy to Vercel
  console.log('\n🚢 Deploying to Vercel...');
  const prodFlag = isProd ? '--prod' : '';
  runCommand(`npx vercel deploy ${prodFlag} --token=${VERCEL_TOKEN}`);
  
  // Finalize Sentry release if configured
  if (SENTRY_DSN && SENTRY_AUTH_TOKEN && process.env.SENTRY_RELEASE) {
    console.log('\n✅ Finalizing Sentry release...');
    runCommand(`npx sentry-cli releases finalize ${process.env.SENTRY_RELEASE}`);
    
    // Create deployment in Sentry
    runCommand(`npx sentry-cli releases deploys ${process.env.SENTRY_RELEASE} new -e ${environment}`);
  }
  
  console.log('\n✨ Deployment completed successfully!');
}

// Run the deployment
deploy().catch(error => {
  console.error('Deployment failed:', error);
  process.exit(1);
}); 