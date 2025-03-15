#!/usr/bin/env node

/**
 * LoadUp Demo Setup Script
 * 
 * This script sets up demo data for the LoadUp application.
 * It creates user accounts, sample shipments, and copies demo files to the appropriate locations.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { execSync } from 'child_process';
import pg from 'pg';
import bcrypt from 'bcrypt';
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

// Demo user credentials
const demoUsers = [
  {
    email: 'admin@loadup.com',
    name: 'Demo Admin',
    role: 'admin',
    password: 'demo-admin-password',
  },
  {
    email: 'driver@loadup.com',
    name: 'Demo Driver',
    role: 'driver',
    password: 'demo-driver-password',
  },
  {
    email: 'customer@loadup.com',
    name: 'Demo Customer',
    role: 'customer',
    password: 'demo-customer-password',
  },
];

// Sample shipment data
const sampleShipments = [
  {
    trackingNumber: 'TRACK-001-DEMO',
    status: 'pending',
    customerEmail: 'customer@loadup.com',
    description: 'Demo Shipment - Office Supplies',
    pickupLocation: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
    },
    pickupContact: {
      name: 'John Office',
      phone: '555-1234',
      email: 'john@example.com',
    },
    deliveryLocation: {
      street: '456 Market St',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94103',
      country: 'USA',
    },
    deliveryContact: {
      name: 'Jane Office',
      phone: '555-5678',
      email: 'jane@example.com',
    },
    pickupDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    deliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
  },
  {
    trackingNumber: 'TRACK-002-DEMO',
    status: 'in_transit',
    customerEmail: 'customer@loadup.com',
    driverEmail: 'driver@loadup.com',
    description: 'Demo Shipment - Electronics',
    pickupLocation: {
      street: '789 Tech Blvd',
      city: 'Boston',
      state: 'MA',
      zipCode: '02110',
      country: 'USA',
    },
    pickupContact: {
      name: 'Tech Sender',
      phone: '555-2468',
      email: 'sender@tech.com',
    },
    deliveryLocation: {
      street: '101 Innovation Way',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
      country: 'USA',
    },
    deliveryContact: {
      name: 'Tech Receiver',
      phone: '555-1357',
      email: 'receiver@tech.com',
    },
    pickupDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    deliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
  },
  {
    trackingNumber: 'TRACK-003-DEMO',
    status: 'delivered',
    customerEmail: 'customer@loadup.com',
    driverEmail: 'driver@loadup.com',
    description: 'Demo Shipment - Furniture',
    pickupLocation: {
      street: '222 Warehouse Rd',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60607',
      country: 'USA',
    },
    pickupContact: {
      name: 'Furniture Store',
      phone: '555-9876',
      email: 'store@furniture.com',
    },
    deliveryLocation: {
      street: '333 Home Ave',
      city: 'Denver',
      state: 'CO',
      zipCode: '80202',
      country: 'USA',
    },
    deliveryContact: {
      name: 'Home Owner',
      phone: '555-5432',
      email: 'owner@home.com',
    },
    pickupDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    deliveryDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  },
];

// Demo file paths
const demoFiles = {
  ocr: [
    {
      source: path.join(__dirname, '../demo-assets/ocr/demo-document-1.jpg'),
      destination: '/storage/demo/ocr/demo-document-1.jpg',
    },
    {
      source: path.join(__dirname, '../demo-assets/ocr/demo-document-2.jpg'),
      destination: '/storage/demo/ocr/demo-document-2.jpg',
    },
    {
      source: path.join(__dirname, '../demo-assets/ocr/demo-document-3.jpg'),
      destination: '/storage/demo/ocr/demo-document-3.jpg',
    },
  ],
  excel: [
    {
      source: path.join(__dirname, '../demo-assets/excel/demo-shipments.xlsx'),
      destination: '/storage/demo/excel/demo-shipments.xlsx',
    },
    {
      source: path.join(__dirname, '../demo-assets/excel/demo-customers.xlsx'),
      destination: '/storage/demo/excel/demo-customers.xlsx',
    },
  ],
};

/**
 * Create demo user accounts
 */
async function createDemoUsers() {
  console.log('Creating demo user accounts...');
  
  for (const user of demoUsers) {
    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [user.email]
    );
    
    if (existingUser.rows.length > 0) {
      console.log(`User ${user.email} already exists, skipping...`);
      continue;
    }
    
    // Hash the password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(user.password, saltRounds);
    
    // Insert the user
    await pool.query(
      'INSERT INTO users (email, name, role, password_hash, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW())',
      [user.email, user.name, user.role, passwordHash]
    );
    
    console.log(`Created user: ${user.email} with role: ${user.role}`);
  }
  
  console.log('Demo users created successfully.');
}

/**
 * Create sample shipments
 */
async function createSampleShipments() {
  console.log('Creating sample shipments...');
  
  for (const shipment of sampleShipments) {
    // Check if shipment already exists
    const existingShipment = await pool.query(
      'SELECT * FROM shipments WHERE tracking_number = $1',
      [shipment.trackingNumber]
    );
    
    if (existingShipment.rows.length > 0) {
      console.log(`Shipment ${shipment.trackingNumber} already exists, skipping...`);
      continue;
    }
    
    // Get customer ID
    const customerResult = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [shipment.customerEmail]
    );
    
    if (customerResult.rows.length === 0) {
      console.error(`Customer ${shipment.customerEmail} not found, skipping shipment...`);
      continue;
    }
    
    const customerId = customerResult.rows[0].id;
    
    // Get driver ID if applicable
    let driverId = null;
    if (shipment.driverEmail) {
      const driverResult = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [shipment.driverEmail]
      );
      
      if (driverResult.rows.length > 0) {
        driverId = driverResult.rows[0].id;
      }
    }
    
    // Insert the shipment
    await pool.query(
      `INSERT INTO shipments (
        tracking_number,
        status,
        customer_id,
        driver_id,
        description,
        pickup_location,
        pickup_contact,
        delivery_location,
        delivery_contact,
        pickup_date,
        delivery_date,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())`,
      [
        shipment.trackingNumber,
        shipment.status,
        customerId,
        driverId,
        shipment.description,
        JSON.stringify(shipment.pickupLocation),
        JSON.stringify(shipment.pickupContact),
        JSON.stringify(shipment.deliveryLocation),
        JSON.stringify(shipment.deliveryContact),
        shipment.pickupDate,
        shipment.deliveryDate,
      ]
    );
    
    console.log(`Created shipment: ${shipment.trackingNumber} with status: ${shipment.status}`);
  }
  
  console.log('Sample shipments created successfully.');
}

/**
 * Set up demo files
 */
function setupDemoFiles() {
  console.log('Setting up demo files...');
  
  // Create directories if they don't exist
  const directories = [
    '/storage/demo/ocr',
    '/storage/demo/excel',
  ];
  
  for (const dir of directories) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  }
  
  // Copy OCR files
  for (const file of demoFiles.ocr) {
    fs.copyFileSync(file.source, file.destination);
    console.log(`Copied OCR file: ${file.source} to ${file.destination}`);
  }
  
  // Copy Excel files
  for (const file of demoFiles.excel) {
    fs.copyFileSync(file.source, file.destination);
    console.log(`Copied Excel file: ${file.source} to ${file.destination}`);
  }
  
  console.log('Demo files set up successfully.');
}

/**
 * Set up environment variables
 */
function setupEnvironmentVariables() {
  console.log('Setting up environment variables...');
  
  const envVars = {
    DEMO_MODE: 'true',
    DEMO_ADMIN_EMAIL: 'admin@loadup.com',
    DEMO_DRIVER_EMAIL: 'driver@loadup.com',
    DEMO_CUSTOMER_EMAIL: 'customer@loadup.com',
    DEMO_OCR_PATH: '/storage/demo/ocr/',
    DEMO_EXCEL_PATH: '/storage/demo/excel/',
    ENABLE_DEMO_LOGIN: 'true',
    SKIP_EMAIL_VERIFICATION: 'true',
    ENABLE_MOCK_LOCATION: 'true',
    ENABLE_DEMO_NOTIFICATIONS: 'true',
  };
  
  // Update .env file
  let envContent = '';
  if (fs.existsSync('.env')) {
    envContent = fs.readFileSync('.env', 'utf8');
  }
  
  for (const [key, value] of Object.entries(envVars)) {
    // Check if the variable already exists
    const regex = new RegExp(`^${key}=.*`, 'm');
    if (regex.test(envContent)) {
      // Replace existing variable
      envContent = envContent.replace(regex, `${key}=${value}`);
    } else {
      // Add new variable
      envContent += `\n${key}=${value}`;
    }
  }
  
  fs.writeFileSync('.env', envContent);
  console.log('Environment variables set up successfully.');
}

/**
 * Main function to run the setup
 */
async function main() {
  try {
    console.log('Starting LoadUp demo setup...');
    
    // Create demo users
    await createDemoUsers();
    
    // Create sample shipments
    await createSampleShipments();
    
    // Set up demo files
    setupDemoFiles();
    
    // Set up environment variables
    setupEnvironmentVariables();
    
    console.log('LoadUp demo setup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up demo:', error);
    process.exit(1);
  } finally {
    // Close database connection
    await pool.end();
  }
}

// Run the main function
main(); 