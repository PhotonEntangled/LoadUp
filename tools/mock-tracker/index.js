// tools/mock-tracker/index.cjs

// Load environment variables from .env file
require('dotenv').config();

const admin = require('firebase-admin');

// Neurotic Check: Ensure required environment variables are present
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error('FATAL ERROR: GOOGLE_APPLICATION_CREDENTIALS environment variable is not set.');
  console.error('Ensure you have created a .env file in the tools/mock-tracker directory with the correct path to your service account key.');
  process.exit(1);
}
if (!process.env.FIRESTORE_DATABASE_URL) {
  console.error('FATAL ERROR: FIRESTORE_DATABASE_URL environment variable is not set.');
  console.error('Ensure you have created a .env file in the tools/mock-tracker directory with your Firebase database URL.');
  process.exit(1);
}

try {
  // Initialize Firebase Admin SDK
  // It automatically uses the GOOGLE_APPLICATION_CREDENTIALS environment variable
  admin.initializeApp({
    // credential: admin.credential.applicationDefault(), // This is implicitly used if GOOGLE_APPLICATION_CREDENTIALS is set
    databaseURL: process.env.FIRESTORE_DATABASE_URL
  });
  console.log('Firebase Admin SDK initialized successfully.');
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:');
  console.error(error);
  console.error('\nPlease check the following:');
  console.error('  1. The path in GOOGLE_APPLICATION_CREDENTIALS in .env is correct.');
  console.error('  2. The service account key file is valid JSON.');
  console.error('  3. The FIRESTORE_DATABASE_URL in .env is correct.');
  process.exit(1);
}

// Get Firestore instance
const db = admin.firestore();
console.log('Firestore instance obtained.');

// --- Configuration & Control (Task 9.2.5) ---
const args = process.argv.slice(2); // Skip node path and script path

let targetShipmentId = 'MOCK_SHIPMENT_001'; // Default shipment ID
let updateIntervalSeconds = 5;         // Default update interval

if (args.length === 0) {
  console.warn(`No command-line arguments provided. Using defaults:`);
  console.warn(`  Shipment ID: ${targetShipmentId}`);
  console.warn(`  Update Interval: ${updateIntervalSeconds} seconds`);
  console.warn(`Usage: node tools/mock-tracker/index.cjs [shipmentId] [updateIntervalSeconds]`);
} else {
  // Argument 1: shipmentId (Required)
  targetShipmentId = args[0];
  console.log(`Using Shipment ID from command line: ${targetShipmentId}`);

  // Argument 2: updateIntervalSeconds (Optional)
  if (args[1]) {
    const intervalArg = parseInt(args[1], 10);
    if (!isNaN(intervalArg) && intervalArg > 0) {
      updateIntervalSeconds = intervalArg;
      console.log(`Using Update Interval from command line: ${updateIntervalSeconds} seconds`);
    } else {
      console.error(`Invalid update interval provided: '${args[1]}'. Must be a positive number. Using default: ${updateIntervalSeconds} seconds.`);
    }
  }
}
// Basic validation: Ensure shipmentId is not empty
if (!targetShipmentId) {
  console.error('FATAL ERROR: Shipment ID cannot be empty. Please provide a shipment ID as the first argument.');
  console.error(`Usage: node tools/mock-tracker/index.cjs [shipmentId] [updateIntervalSeconds]`);
  process.exit(1);
}

// --- Function to publish updates to Firestore (Task 9.2.4) ---
async function publishLocationUpdate(update) {
  // Neurotic Check: Confirming Firestore path matches plan Section 2.3
  // Path: /active_vehicles/{shipmentId}
  // Method: Overwrite document using set with merge: false
  const docRef = db.collection('active_vehicles').doc(update.shipmentId);

  try {
    // Use set with merge:false to overwrite the document entirely
    await docRef.set(update, { merge: false });
    console.log(` -> Published update for ${update.shipmentId} to Firestore at ${new Date(update.timestamp).toISOString()}`);
  } catch (error) {
    console.error(` *** Firestore Publish Error for ${update.shipmentId}:`);
    console.error(error);
    // For mock sender, log error and continue simulation. Real app might need retry/alerting.
  }
}

// --- Placeholder for future logic (Task 9.2.3 onwards) ---
console.log('\nMock Tracker Initialized. Ready for simulation logic.');
console.log('Target Firestore DB:', process.env.FIRESTORE_DATABASE_URL);

// --- Simulation Logic (Task 9.2.3) ---

// 1. Define Sample Route (Hardcoded Lon, Lat pairs)
// Example: Short route within Kuala Lumpur for testing
const sampleRoute = [
  [101.6869, 3.1390], // KL Sentral area (approx)
  [101.6900, 3.1400],
  [101.6950, 3.1420], // Towards KLCC area
  [101.7000, 3.1450],
  [101.7050, 3.1480],
  [101.7100, 3.1520],
  [101.7126, 3.1582]  // KLCC area (approx)
];

// Simulation parameters
let currentStepIndex = 0;
// const updateIntervalSeconds = 5; // Using value from args/defaults
// const targetShipmentId = 'MOCK_SHIPMENT_001'; // Using value from args/defaults

// 2. Simulation Step Function (Simple Linear Interpolation)
function simulateStep(stepIndex, route) {
  if (stepIndex >= route.length - 1) {
    console.log('End of route reached.');
    return null; // Indicate end of route
  }

  const startPoint = route[stepIndex];
  const endPoint = route[stepIndex + 1];

  // Basic linear interpolation (for simplicity, not geographically accurate scaling)
  const nextLon = startPoint[0] + (endPoint[0] - startPoint[0]); // Moves full segment per step
  const nextLat = startPoint[1] + (endPoint[1] - startPoint[1]);

  // TODO: Calculate heading based on start/end points if needed
  const heading = null; // Placeholder

  return {
    longitude: nextLon,
    latitude: nextLat,
    heading: heading
  };
}

// Check if interval is valid before starting timer
if (updateIntervalSeconds <= 0) {
    console.error('FATAL ERROR: Update interval must be positive.');
    process.exit(1);
}

// 3. Timer Loop
const simulationInterval = setInterval(() => {
  console.log(`\nSimulating step for ${targetShipmentId}, index: ${currentStepIndex}`);
  const nextPosition = simulateStep(currentStepIndex, sampleRoute);

  if (nextPosition === null) {
    console.log('Stopping simulation interval.');
    clearInterval(simulationInterval);
    return;
  }

  // 4. Construct LiveVehicleUpdate
  const updateData = {
    shipmentId: targetShipmentId,
    latitude: nextPosition.latitude,
    longitude: nextPosition.longitude,
    timestamp: Date.now(), // Current time in Unix milliseconds UTC
    heading: nextPosition.heading, // Currently null
    speed: null,         // Mock data, add if needed
    accuracy: null,      // Mock data, add if needed
    batteryLevel: null   // Mock data, add if needed
  };

  // Log the update object (Task 9.2.3 Verification)
  console.log('Generated Update:', JSON.stringify(updateData));

  // TODO: Implement Firestore publishing (Task 9.2.4)
  // publishLocationUpdate(updateData);
  publishLocationUpdate(updateData); // Calling the publish function

  currentStepIndex++;

}, updateIntervalSeconds * 1000);

console.log(`Mock tracker started. Simulating updates every ${updateIntervalSeconds} seconds for shipment ${targetShipmentId}.`);

// Example: Accessing firestore (uncomment to test basic connectivity after initialization)
/*
async function testFirestoreAccess() {
  try {
    const docRef = db.collection('test_collection').doc('test_doc');
    await docRef.set({ initializedAt: new Date().toISOString(), status: 'OK' });
    console.log('\nSuccessfully wrote a test document to Firestore.');
    const docSnap = await docRef.get();
    if (docSnap.exists) {
      console.log('Successfully read test document:', docSnap.data());
    } else {
      console.error('Failed to read back test document.');
    }
  } catch (error) {
    console.error('\nError during Firestore test access:');
    console.error(error);
    console.error('Check Firestore security rules and service account permissions.');
  }
}
testFirestoreAccess();
*/

// Keep the script running indefinitely for testing purposes, or implement proper exit logic
// setInterval(() => {}, 1 << 30); // Keeps node running 