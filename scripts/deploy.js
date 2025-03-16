/**
 * deploy.js
 * 
 * Deployment script for LoadUp application.
 * This script handles deploying the application to both staging and production environments.
 * 
 * Usage:
 *   node scripts/deploy.js [environment]
 * 
 * Where [environment] is either 'staging' or 'production'.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get the environment from command line arguments
const environment = process.argv[2];

// Validate environment
if (!environment || (environment !== 'staging' && environment !== 'production')) {
  console.error('Please specify a valid environment: staging or production');
  process.exit(1);
}

// Configuration for different environments
const config = {
  staging: {
    adminDashboardUrl: process.env.STAGING_ADMIN_URL || 'https://staging-admin.loadup.com',
    driverAppUrl: process.env.STAGING_DRIVER_URL || 'https://staging-driver.loadup.com',
    apiUrl: process.env.STAGING_API_URL || 'https://staging-api.loadup.com',
  },
  production: {
    adminDashboardUrl: process.env.PRODUCTION_ADMIN_URL || 'https://admin.loadup.com',
    driverAppUrl: process.env.PRODUCTION_DRIVER_URL || 'https://driver.loadup.com',
    apiUrl: process.env.PRODUCTION_API_URL || 'https://api.loadup.com',
  },
};

// Get the configuration for the current environment
const currentConfig = config[environment];

console.log(`Starting deployment to ${environment} environment...`);

// Function to check if a directory exists
function directoryExists(dirPath) {
  try {
    return fs.statSync(dirPath).isDirectory();
  } catch (err) {
    return false;
  }
}

// Verify build artifacts exist
const adminBuildPath = path.resolve(__dirname, '../apps/admin-dashboard/.next');
const driverBuildPath = path.resolve(__dirname, '../apps/driver-app/dist');
const apiBuildPath = path.resolve(__dirname, '../packages/api/dist');

if (!directoryExists(adminBuildPath)) {
  console.error('Admin dashboard build artifacts not found. Make sure the build step completed successfully.');
  process.exit(1);
}

if (!directoryExists(driverBuildPath)) {
  console.error('Driver app build artifacts not found. Make sure the build step completed successfully.');
  process.exit(1);
}

if (!directoryExists(apiBuildPath)) {
  console.error('API build artifacts not found. Make sure the build step completed successfully.');
  process.exit(1);
}

// Deploy admin dashboard
console.log(`Deploying admin dashboard to ${currentConfig.adminDashboardUrl}...`);
try {
  // This is a placeholder for your actual deployment command
  // Replace with your actual deployment logic (e.g., AWS S3, Vercel, Netlify, etc.)
  console.log('Admin dashboard deployment command would run here');
  // Example: execSync(`aws s3 sync ${adminBuildPath} s3://loadup-${environment}-admin --delete`);
} catch (error) {
  console.error('Failed to deploy admin dashboard:', error);
  process.exit(1);
}

// Deploy driver app
console.log(`Deploying driver app to ${currentConfig.driverAppUrl}...`);
try {
  // This is a placeholder for your actual deployment command
  // Replace with your actual deployment logic
  console.log('Driver app deployment command would run here');
  // Example: execSync(`aws s3 sync ${driverBuildPath} s3://loadup-${environment}-driver --delete`);
} catch (error) {
  console.error('Failed to deploy driver app:', error);
  process.exit(1);
}

// Deploy API
console.log(`Deploying API to ${currentConfig.apiUrl}...`);
try {
  // This is a placeholder for your actual deployment command
  // Replace with your actual deployment logic
  console.log('API deployment command would run here');
  // Example: execSync(`aws lambda update-function-code --function-name loadup-${environment}-api --zip-file fileb://${apiBuildPath}/api.zip`);
} catch (error) {
  console.error('Failed to deploy API:', error);
  process.exit(1);
}

// Run database migrations if needed
if (process.env.RUN_MIGRATIONS === 'true') {
  console.log('Running database migrations...');
  try {
    execSync('npx drizzle-kit push:pg', {
      env: {
        ...process.env,
        DATABASE_URL: process.env.DATABASE_URL,
      },
    });
  } catch (error) {
    console.error('Failed to run database migrations:', error);
    process.exit(1);
  }
}

// Update Sentry release if Sentry is configured
if (process.env.SENTRY_AUTH_TOKEN && process.env.SENTRY_ORG && process.env.SENTRY_PROJECT) {
  console.log('Creating Sentry release...');
  try {
    const version = `loadup-${environment}-${new Date().toISOString().split('T')[0]}-${Math.floor(Math.random() * 1000)}`;
    execSync(`npx @sentry/cli releases new ${version}`);
    execSync(`npx @sentry/cli releases set-commits ${version} --auto`);
    execSync(`npx @sentry/cli releases finalize ${version}`);
  } catch (error) {
    console.error('Failed to create Sentry release:', error);
    // Don't exit on Sentry error, as it's not critical
  }
}

console.log(`Deployment to ${environment} completed successfully!`);
console.log(`Admin Dashboard: ${currentConfig.adminDashboardUrl}`);
console.log(`Driver App: ${currentConfig.driverAppUrl}`);
console.log(`API: ${currentConfig.apiUrl}`); 