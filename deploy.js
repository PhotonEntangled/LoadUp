// LoadUp Deployment Script
// This script is used to deploy the LoadUp API server

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

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

// Build the application
console.log('Building the application...');
try {
  execSync('npm run build', { stdio: 'inherit' });
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}

// Start the server
console.log(`Starting server on port ${PORT} in ${NODE_ENV} mode...`);
try {
  // In a real deployment, we would use a process manager like PM2
  // For development, we'll start the server directly
  execSync(`cd packages/api && node dist/server.js`, {
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