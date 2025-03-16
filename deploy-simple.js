// LoadUp Simple Deployment Script
// This script is used to deploy the LoadUp API server with only simple tests

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import dotenv from 'dotenv';


// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Configuration
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Ensure required environment variables are set
const requiredEnvVars = ['DATABASE_URL', 'NEXTAUTH_SECRET'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  console.error('Please set these variables before deploying.');
  process.exit(1);
}

// Run simple tests
console.log('Running simple tests...');
try {
  execSync('npm run test:simple', { stdio: 'inherit' });
  console.log('✅ All simple tests passed!');
} catch (error) {
  console.error('❌ Tests failed:', error);
  process.exit(1);
}

// Skip build for now
console.log('Skipping build step for now...');

// Start the server directly
console.log(`Starting server on port ${PORT} in ${NODE_ENV} mode...`);
try {
  // Run the server directly using cd and node
  execSync(`cd packages/api && npx tsx src/index.ts`, {
    stdio: 'inherit',
    env: {
      ...process.env,
      PORT,
      NODE_ENV
    }
  });
} catch (error) {
  console.error('Server failed to start:', error);
  process.exit(1);
}

// Log deployment success
console.log(`
=================================================
🚀 LoadUp API deployed successfully!
=================================================
- Environment: ${NODE_ENV}
- Port: ${PORT}
- Time: ${new Date().toISOString()}
=================================================
`);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  process.exit();
});

process.on('SIGTERM', () => {
  console.log('Shutting down server...');
  process.exit();
}); 