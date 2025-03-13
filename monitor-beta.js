// LoadUp Beta Monitoring Script
// This script monitors the health and performance of the LoadUp API beta server

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Configuration
const PORT = process.env.PORT || 3001;
const BASE_URL = `http://localhost:${PORT}`;
const CHECK_INTERVAL = 60000; // 1 minute
const LOG_DIR = path.join(__dirname, 'logs');
const PERFORMANCE_LOG = path.join(LOG_DIR, 'performance.log');
const ERROR_LOG = path.join(LOG_DIR, 'error.log');

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Initialize log files
if (!fs.existsSync(PERFORMANCE_LOG)) {
  fs.writeFileSync(PERFORMANCE_LOG, 'timestamp,endpoint,responseTime,statusCode\n');
}
if (!fs.existsSync(ERROR_LOG)) {
  fs.writeFileSync(ERROR_LOG, 'timestamp,endpoint,error\n');
}

console.log(`
=================================================
🔍 LoadUp Beta Monitoring Started
=================================================
- Server: ${BASE_URL}
- Check Interval: ${CHECK_INTERVAL}ms
- Logs: ${LOG_DIR}
- Time: ${new Date().toISOString()}
=================================================
`);

// Endpoints to monitor
const endpoints = [
  { path: '/health', name: 'Health Check' },
  { path: '/health/db', name: 'Database Health' },
  { path: '/api/shipments', name: 'Shipments API' },
  { path: '/api/drivers', name: 'Drivers API' }
];

// Function to log performance data
const logPerformance = (endpoint, responseTime, statusCode) => {
  const timestamp = new Date().toISOString();
  const logEntry = `${timestamp},${endpoint},${responseTime},${statusCode}\n`;
  fs.appendFileSync(PERFORMANCE_LOG, logEntry);
};

// Function to log errors
const logError = (endpoint, error) => {
  const timestamp = new Date().toISOString();
  const logEntry = `${timestamp},${endpoint},"${error.toString().replace(/"/g, '""')}"\n`;
  fs.appendFileSync(ERROR_LOG, logEntry);
  console.error(`[${timestamp}] Error monitoring ${endpoint}: ${error}`);
};

// Function to check an endpoint
const checkEndpoint = async (endpoint) => {
  const url = `${BASE_URL}${endpoint.path}`;
  const startTime = Date.now();
  
  try {
    const response = await fetch(url);
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    logPerformance(endpoint.name, responseTime, response.status);
    
    if (!response.ok) {
      logError(endpoint.name, `Status: ${response.status} ${response.statusText}`);
      return false;
    }
    
    const data = await response.json();
    console.log(`[${new Date().toISOString()}] ${endpoint.name}: OK (${responseTime}ms)`);
    return true;
  } catch (error) {
    logError(endpoint.name, error);
    return false;
  }
};

// Function to run all checks
const runChecks = async () => {
  console.log(`[${new Date().toISOString()}] Running health checks...`);
  
  let allChecksSuccessful = true;
  
  for (const endpoint of endpoints) {
    const success = await checkEndpoint(endpoint);
    if (!success) {
      allChecksSuccessful = false;
    }
  }
  
  if (allChecksSuccessful) {
    console.log(`[${new Date().toISOString()}] All checks passed`);
  } else {
    console.error(`[${new Date().toISOString()}] Some checks failed`);
  }
};

// Run checks immediately
runChecks();

// Schedule regular checks
const interval = setInterval(runChecks, CHECK_INTERVAL);

// Handle graceful shutdown
process.on('SIGINT', () => {
  clearInterval(interval);
  console.log('Monitoring stopped');
  process.exit();
});

process.on('SIGTERM', () => {
  clearInterval(interval);
  console.log('Monitoring stopped');
  process.exit();
}); 