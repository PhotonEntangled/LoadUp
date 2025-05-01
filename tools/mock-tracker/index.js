// tools/mock-tracker/index.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const admin = require('firebase-admin');
const xlsx = require('xlsx');
const MapboxDirections = require('@mapbox/mapbox-sdk/services/directions');
const turf = require('@turf/turf');

// --- Environment Variable Checks ---
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error('FATAL ERROR: GOOGLE_APPLICATION_CREDENTIALS environment variable is not set.');
  process.exit(1);
}
if (!process.env.FIRESTORE_DATABASE_URL) {
  console.error('FATAL ERROR: FIRESTORE_DATABASE_URL environment variable is not set.');
  process.exit(1);
}
// Neurotic: Check for Mapbox Token needed for Directions API
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || process.env.MAPBOX_SECRET_TOKEN;
if (!MAPBOX_TOKEN) {
    console.error('FATAL ERROR: MAPBOX_TOKEN (checked NEXT_PUBLIC_MAPBOX_TOKEN or MAPBOX_SECRET_TOKEN) is not set in .env');
  process.exit(1);
}

// --- Firebase Initialization ---
try {
  admin.initializeApp({
    databaseURL: process.env.FIRESTORE_DATABASE_URL
  });
  console.log('Firebase Admin SDK initialized successfully.');
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
  process.exit(1);
}
const db = admin.firestore();
console.log('Firestore instance obtained.');

// --- Mapbox Directions Client Initialization ---
const directionsClient = MapboxDirections({ accessToken: MAPBOX_TOKEN });
console.log('Mapbox Directions client initialized.');

// --- Configuration & Control ---
const args = process.argv.slice(2);
let targetShipmentId = args[0] || 'MOCK_ENROUTE_002'; // Default to ENROUTE for better testing
let updateIntervalSeconds = args[1] ? parseInt(args[1], 10) : 5;
if (isNaN(updateIntervalSeconds) || updateIntervalSeconds <= 0) {
    console.warn(`Invalid update interval, using default 5 seconds.`);
    updateIntervalSeconds = 5;
}
if (!targetShipmentId) {
  console.error('FATAL ERROR: Shipment ID cannot be empty.'); process.exit(1);
}
console.log(`Targeting Shipment ID: ${targetShipmentId}`);
console.log(`Update Interval: ${updateIntervalSeconds} seconds`);

// --- Mock Address Data (Adapted from services/geolocation/mockAddressData.ts) ---
const MOCK_MALAYSIAN_ADDRESSES = [
    {
        mockId: 'MOCK-PTP-01',
        keywords: ['ptp', 'pelabuhan tanjung pelepas', 'tanjung pelepas'],
        street1: 'Blok A, Wisma PTP', street2: 'Jalan Pelabuhan Tanjung Pelepas',
        city: 'Gelang Patah', state: 'Johor', postalCode: '81560', country: 'Malaysia',
        latitude: '1.3624', longitude: '103.5520',
    },
    {
        mockId: 'MOCK-KLIA-CARGO',
        keywords: ['klia', 'cargo village', 'klia cargo', 'sepang'],
        street1: 'KLIA Cargo Village', street2: 'Free Commercial Zone',
        city: 'Sepang', state: 'Selangor', postalCode: '64000', country: 'Malaysia',
        latitude: '2.7456', longitude: '101.7070',
    },
    {
        mockId: 'MOCK-PENANG-PORT',
        keywords: ['penang port', 'butterworth', 'nbct', 'perai'], // Added perai
        street1: 'North Butterworth Container Terminal', street2: '',
        city: 'Butterworth', state: 'Penang', postalCode: '12100', country: 'Malaysia',
        latitude: '5.4085', longitude: '100.3607',
    },
    {
        mockId: 'MOCK-POS-KL',
        keywords: ['pos malaysia', 'kuala lumpur', 'kl mail centre'],
        street1: 'Pusat Mel Nasional', street2: 'Kompleks Dayabumi',
        city: 'Kuala Lumpur', state: 'W.P. Kuala Lumpur', postalCode: '50670', country: 'Malaysia',
        latitude: '3.1445', longitude: '101.6931',
    },
    {
        mockId: 'MOCK-SHAH-ALAM-HUB', // Origin for many test cases
        keywords: [
            'shah alam', 'logistics hub', 'sek 23', 'xinhwa', 'xin hwa',
            'niro shah alam', 'pick up at niro', 'pick up at niro shah alam',
            'pick up at xin hwa', 'pick up at xinhwa',
            'loadup direct delivery pickup at niro shah alam',
            'loadup direct delivery pickup at xin hwa',
            'loadup direct delivery pick up at niro shah alam',
            'loadup direct delivery pick up at xin hwa',
        ],
        street1: 'Jalan Jubli Perak 22/1, Seksyen 22', street2: 'Lot 10, Persiaran Perusahaan',
        city: 'Shah Alam', state: 'Selangor', postalCode: '40300', country: 'Malaysia',
        latitude: '3.0520', longitude: '101.5270',
    },
    {
        mockId: 'MOCK-LOADUP-JB',
        keywords: ['loadup jb', 'load up jb', 'jb hub'],
        street1: '1 Jalan Kempas Utama 3/1', street2: 'Taman Kempas Utama',
        city: 'Johor Bahru', state: 'Johor', postalCode: '81300', country: 'Malaysia',
        latitude: '1.5540', longitude: '103.7180',
    },
    {
        mockId: 'MOCK-LOADUP-PN-PRAI', // Destination for ORD_001
        keywords: ['loadup pn', 'load up pn', 'penang hub', 'prai hub', 'prai industrial estate', '1 mock address'],
        street1: 'Lot 247, Lorong Perusahaan 10', street2: 'Prai Industrial Estate',
        city: 'Perai', state: 'Penang', postalCode: '13600', country: 'Malaysia',
        latitude: '5.3580', longitude: '100.4100',
    },
    {
        mockId: 'MOCK-LOADUP-PN-BM', // Destination for ORD_002
        keywords: ['bukit mertajam', 'taman mock', '2 mock avenue'],
        street1: '2 Mock Avenue', street2: 'Taman Mock',
        city: 'Bukit Mertajam', state: 'Penang', postalCode: '14000', country: 'Malaysia',
        latitude: '5.3638', longitude: '100.4609',
    },
    {
        mockId: 'MOCK-LOADUP-PN-GEO', // Destination for ORD_003
        keywords: ['georgetown', 'georgetown central', '3 mock street'],
        street1: '3 Mock Street', street2: 'Georgetown Central',
        city: 'Georgetown', state: 'Penang', postalCode: '10000', country: 'Malaysia',
        latitude: '5.4145', longitude: '100.3292',
    },
    {
        mockId: 'MOCK-LOADUP-PN-BL', // Destination for ORD_004
        keywords: ['bayan lepas', 'free industrial zone', '4 mock lane'],
        street1: '4 Mock Lane', street2: 'Free Industrial Zone',
        city: 'Bayan Lepas', state: 'Penang', postalCode: '11900', country: 'Malaysia',
        latitude: '5.2949', longitude: '100.2615',
    },
    {
        mockId: 'MOCK-LOADUP-PN-SA', // Destination for ORD_005
        keywords: ['simpang ampat', 'taman error', '5 mock close'],
        street1: '5 Mock Close', street2: 'Taman Error',
        city: 'Simpang Ampat', state: 'Penang', postalCode: '14100', country: 'Malaysia',
        latitude: '5.2756', longitude: '100.4767',
    },
    {
        mockId: 'MOCK-UNKNOWN-MY', // Default fallback
        keywords: [],
        street1: 'Unknown Location', street2: '',
        city: 'Unknown', state: 'N/A', postalCode: '00000', country: 'Malaysia',
        latitude: '3.1390', longitude: '101.6869', // Default to KL
    },
];

// Function adapted from services/geolocation/mockAddressData.ts
const findMockEntryByKeywords = (rawInput) => {
    if (!rawInput) {
        return MOCK_MALAYSIAN_ADDRESSES.find(addr => addr.mockId === 'MOCK-UNKNOWN-MY');
    }
    const lowerInput = String(rawInput).toLowerCase(); // Ensure string conversion
    for (const mockAddr of MOCK_MALAYSIAN_ADDRESSES) {
        if (mockAddr.keywords.some(keyword => lowerInput.includes(keyword))) {
            return mockAddr;
        }
    }
    return MOCK_MALAYSIAN_ADDRESSES.find(addr => addr.mockId === 'MOCK-UNKNOWN-MY');
};

// --- Function to get Origin/Destination Coords (Refactored) ---
function getShipmentRoutePoints(shipmentId) {
    try {
        const workbookPath = path.resolve(__dirname, '../../data/mocks/all_status_test_shipments.xlsx');
        console.log(`Reading Excel file from: ${workbookPath}`);
        const workbook = xlsx.readFile(workbookPath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);

        const shipmentRow = data.find(row => row['Load no'] === shipmentId);
        if (!shipmentRow) {
            console.error(`Shipment ID ${shipmentId} not found in Excel file.`);
            return null;
        }

        const originInput = shipmentRow['Pick up warehouse'];
        const destinationInput = shipmentRow['Address Line 1 and 2']; // Use full address for destination matching

        console.log(`Attempting to resolve Origin: "${originInput}"`);
        const originEntry = findMockEntryByKeywords(originInput);
        console.log(`Attempting to resolve Destination: "${destinationInput}"`);
        const destinationEntry = findMockEntryByKeywords(destinationInput);

        // Check if resolution failed (returned the default Unknown)
        if (!originEntry || originEntry.mockId === 'MOCK-UNKNOWN-MY') {
            console.error(`Failed to resolve mock coordinates for origin: "${originInput}"`);
            return null;
        }
        if (!destinationEntry || destinationEntry.mockId === 'MOCK-UNKNOWN-MY') {
            console.error(`Failed to resolve mock coordinates for destination: "${destinationInput}"`);
            return null;
        }

        // Parse coordinates (which are strings in MOCK_MALAYSIAN_ADDRESSES)
        const originLon = parseFloat(originEntry.longitude);
        const originLat = parseFloat(originEntry.latitude);
        const destLon = parseFloat(destinationEntry.longitude);
        const destLat = parseFloat(destinationEntry.latitude);

        // Validate parsed numbers
        if (isNaN(originLon) || isNaN(originLat) || isNaN(destLon) || isNaN(destLat)) {
            console.error("Failed to parse valid coordinates from resolved mock entries.");
            return null;
        }

        const originCoords = [originLon, originLat];
        const destinationCoords = [destLon, destLat];

        console.log(`Resolved route points: Origin ${originEntry.mockId} ${originCoords}, Destination ${destinationEntry.mockId} ${destinationCoords}`);
        return { origin: originCoords, destination: destinationCoords };

    } catch (error) {
        console.error("Error reading or processing Excel file:", error);
        return null;
    }
}

// --- Function to Fetch Route using Mapbox SDK ---
async function fetchRouteGeometry(origin, destination) {
    try {
        console.log(`Fetching route from Mapbox: ${origin} -> ${destination}`);
        const response = await directionsClient
            .getDirections({
                profile: 'driving-traffic', // Use traffic profile
                waypoints: [ { coordinates: origin }, { coordinates: destination } ],
                geometries: 'geojson',
                overview: 'full',
            })
            .send();

        if (response && response.body && response.body.routes && response.body.routes.length > 0) {
            const route = response.body.routes[0];
            console.log(`Route fetched successfully. Distance: ${(route.distance / 1000).toFixed(1)} km, Duration: ${(route.duration / 60).toFixed(0)} min.`);
            return {
                geometry: route.geometry, // GeoJSON LineString
                distance: route.distance, // Meters
                duration: route.duration  // Seconds
            };
        } else {
            console.warn('No routes found in Mapbox response.');
            return null;
        }
    } catch (error) {
        console.error('Error fetching route from Mapbox:', error);
        return null;
    }
}

// --- Firestore Publish Function (Unchanged) ---
async function publishLocationUpdate(update) {
  const docRef = db.collection('active_vehicles').doc(update.shipmentId);
  try {
    await docRef.set(update, { merge: false });
    console.log(` -> Published update for ${update.shipmentId} to Firestore at ${new Date(update.timestamp).toISOString()}`);
  } catch (error) {
    console.error(` *** Firestore Publish Error for ${update.shipmentId}:`, error);
  }
}

// --- Adapted Simulation Logic ---
let currentRoute = null; // Store fetched route details
let traveledDistanceMeters = 0;
const AVERAGE_SPEED_KPH = 70; // Adjusted speed for longer routes
const METERS_PER_SECOND_PER_KPH = 1000 / 3600;

async function initializeSimulation() {
    console.log(`Initializing simulation for ${targetShipmentId}...`);
    const routePoints = getShipmentRoutePoints(targetShipmentId);
    if (!routePoints) {
        console.error("Failed to get route points. Stopping simulation.");
        process.exit(1);
    }

    currentRoute = await fetchRouteGeometry(routePoints.origin, routePoints.destination);
    if (!currentRoute || !currentRoute.geometry || !currentRoute.distance) {
        console.error("Failed to fetch route geometry. Stopping simulation.");
        process.exit(1);
    }

    traveledDistanceMeters = 0; // Reset traveled distance
    console.log(`Simulation initialized. Route distance: ${(currentRoute.distance / 1000).toFixed(1)} km.`);
    startSimulationLoop(); // Start the loop only after initialization
}

function simulateNextStep() {
    if (!currentRoute || !currentRoute.geometry || typeof currentRoute.distance !== 'number') {
        console.error("Simulation cannot proceed: Route not available.");
        return null; // Cannot simulate
    }

    const routeLine = currentRoute.geometry;
    const totalRouteDistance = currentRoute.distance;

    // Calculate distance to travel in this interval
    const speedMPS = AVERAGE_SPEED_KPH * METERS_PER_SECOND_PER_KPH;
    const distanceThisInterval = speedMPS * updateIntervalSeconds;

    traveledDistanceMeters += distanceThisInterval;

    if (traveledDistanceMeters >= totalRouteDistance) {
        console.log("End of route reached.");
        traveledDistanceMeters = totalRouteDistance; // Cap at total distance
  }

    try {
        const currentPointFeature = turf.along(routeLine, traveledDistanceMeters, { units: 'meters' });
        const coords = currentPointFeature.geometry.coordinates;

        // Calculate bearing
        let bearing = 0;
        if (traveledDistanceMeters < totalRouteDistance) {
            const lookAheadPoint = turf.along(routeLine, Math.min(traveledDistanceMeters + 50, totalRouteDistance), { units: 'meters' }); // Look 50m ahead
            bearing = turf.bearing(currentPointFeature, lookAheadPoint);
        } else if (totalRouteDistance > 50) { // If at the end, look back
             const lookBehindPoint = turf.along(routeLine, totalRouteDistance - 50, { units: 'meters' });
             bearing = turf.bearing(lookBehindPoint, currentPointFeature);
        }
        bearing = (bearing + 360) % 360; // Normalize

  return {
            longitude: coords[0],
            latitude: coords[1],
            heading: bearing,
            isEndOfRoute: traveledDistanceMeters >= totalRouteDistance
        };
    } catch (error) {
        console.error("Error calculating position with Turf.js:", error);
        return null;
    }
}

// --- Main Simulation Loop ---
let simulationIntervalId = null;

function startSimulationLoop() {
    console.log(`Starting simulation loop with ${updateIntervalSeconds}s interval.`);
    simulationIntervalId = setInterval(async () => {
        console.log(`
Simulating step for ${targetShipmentId}... Traveled: ${(traveledDistanceMeters / 1000).toFixed(1)} km`);
        const nextPositionData = simulateNextStep();

        if (nextPositionData === null) {
             console.error("Simulation step failed. Stopping loop.");
             clearInterval(simulationIntervalId);
    return;
  }

  const updateData = {
    shipmentId: targetShipmentId,
            latitude: nextPositionData.latitude,
            longitude: nextPositionData.longitude,
            timestamp: Date.now(),
            heading: nextPositionData.heading,
            speed: AVERAGE_SPEED_KPH * METERS_PER_SECOND_PER_KPH, // Approximate speed
            accuracy: 10, // Mock accuracy
            batteryLevel: 0.8 // Mock battery
  };

        console.log('Generated Update:', JSON.stringify(updateData, null, 2));
        await publishLocationUpdate(updateData);

        if (nextPositionData.isEndOfRoute) {
            console.log('End of route published. Stopping simulation interval.');
            clearInterval(simulationIntervalId);
        }
}, updateIntervalSeconds * 1000);
}


// --- Start the process ---
initializeSimulation();

// Keep script running if needed (might not be necessary if interval is running)
// process.stdin.resume(); 