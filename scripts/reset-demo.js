#!/usr/bin/env node

/**
 * LoadUp Demo Reset Script
 * 
 * This script resets the demo data for the LoadUp application.
 * It removes all demo users, shipments, and files.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import pg from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database connection
const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Demo user emails
const demoUserEmails = [
  'admin@loadup.com',
  'driver@loadup.com',
  'customer@loadup.com',
];

// Demo tracking numbers
const demoTrackingNumbers = [
  'TRACK-001-DEMO',
  'TRACK-002-DEMO',
  'TRACK-003-DEMO',
];

// Demo file paths
const demoDirectories = [
  '/storage/demo/ocr',
  '/storage/demo/excel',
];

/**
 * Remove demo users
 */
async function removeDemoUsers() {
  console.log('Removing demo users...');
  
  for (const email of demoUserEmails) {
    // Get user ID
    const userResult = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    
    if (userResult.rows.length === 0) {
      console.log(`User ${email} not found, skipping...`);
      continue;
    }
    
    const userId = userResult.rows[0].id;
    
    // Delete user
    await pool.query(
      'DELETE FROM users WHERE id = $1',
      [userId]
    );
    
    console.log(`Removed user: ${email}`);
  }
  
  console.log('Demo users removed successfully.');
}

/**
 * Remove demo shipments
 */
async function removeDemoShipments() {
  console.log('Removing demo shipments...');
  
  for (const trackingNumber of demoTrackingNumbers) {
    // Delete shipment
    await pool.query(
      'DELETE FROM shipments WHERE tracking_number = $1',
      [trackingNumber]
    );
    
    console.log(`Removed shipment: ${trackingNumber}`);
  }
  
  console.log('Demo shipments removed successfully.');
}

/**
 * Remove demo files
 */
function removeDemoFiles() {
  console.log('Removing demo files...');
  
  for (const dir of demoDirectories) {
    if (fs.existsSync(dir)) {
      // Remove all files in the directory
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        fs.unlinkSync(filePath);
        console.log(`Removed file: ${filePath}`);
      }
      
      // Remove the directory
      fs.rmdirSync(dir);
      console.log(`Removed directory: ${dir}`);
    } else {
      console.log(`Directory ${dir} not found, skipping...`);
    }
  }
  
  console.log('Demo files removed successfully.');
}

/**
 * Reset environment variables
 */
function resetEnvironmentVariables() {
  console.log('Resetting environment variables...');
  
  const envVarsToRemove = [
    'DEMO_MODE',
    'DEMO_ADMIN_EMAIL',
    'DEMO_DRIVER_EMAIL',
    'DEMO_CUSTOMER_EMAIL',
    'DEMO_OCR_PATH',
    'DEMO_EXCEL_PATH',
    'ENABLE_DEMO_LOGIN',
    'SKIP_EMAIL_VERIFICATION',
    'ENABLE_MOCK_LOCATION',
    'ENABLE_DEMO_NOTIFICATIONS',
  ];
  
  // Update .env file
  if (fs.existsSync('.env')) {
    let envContent = fs.readFileSync('.env', 'utf8');
    
    for (const key of envVarsToRemove) {
      // Remove the variable
      const regex = new RegExp(`^${key}=.*\n?`, 'm');
      envContent = envContent.replace(regex, '');
    }
    
    fs.writeFileSync('.env', envContent);
  }
  
  console.log('Environment variables reset successfully.');
}

/**
 * Main function to run the reset
 */
async function main() {
  try {
    console.log('Starting LoadUp demo reset...');
    
    // Remove demo shipments
    await removeDemoShipments();
    
    // Remove demo users
    await removeDemoUsers();
    
    // Remove demo files
    removeDemoFiles();
    
    // Reset environment variables
    resetEnvironmentVariables();
    
    console.log('LoadUp demo reset completed successfully!');
    
    // Run setup script if requested
    if (process.argv.includes('--setup')) {
      console.log('Running demo setup script...');
      const setupScript = path.join(__dirname, 'setup-demo.js');
      const { execSync } = await import('child_process');
      execSync(`node ${setupScript}`, { stdio: 'inherit' });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error resetting demo:', error);
    process.exit(1);
  } finally {
    // Close database connection
    await pool.end();
  }
}

// Run the main function
main(); 