// LoadUp Beta Deployment Script
// This script is used to deploy the LoadUp API server for beta testing

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Configuration
const PORT = process.env.PORT || 3002; // Use a different port for beta
const NODE_ENV = process.env.NODE_ENV || 'development';

console.log(`
=================================================
🚀 Starting LoadUp Beta Deployment
=================================================
- Environment: ${NODE_ENV}
- Port: ${PORT}
- Time: ${new Date().toISOString()}
=================================================
`);

// Ensure required environment variables are set
const requiredEnvVars = ['DATABASE_URL', 'CLERK_SECRET_KEY'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  console.error('Please set these variables before deploying.');
  process.exit(1);
}

// Ensure the server-beta-cjs.cjs file exists
const serverPath = path.join(__dirname, 'packages', 'api', 'src', 'server-beta-cjs.cjs');
if (!fs.existsSync(serverPath)) {
  console.error('Error: server-beta-cjs.cjs not found at:', serverPath);
  process.exit(1);
}

console.log('Beta server file found. Starting server...');

// Start the server as a detached process
const server = spawn('node', [serverPath], {
  detached: true,
  stdio: ['ignore', 
    fs.openSync('./beta-server-out.log', 'a'),
    fs.openSync('./beta-server-err.log', 'a')
  ]
});

// Unref the child process so parent can exit independently
server.unref();

console.log(`
=================================================
🚀 LoadUp Beta Server started in background!
=================================================
- Process ID: ${server.pid}
- Standard output: beta-server-out.log
- Error output: beta-server-err.log
- Server should be available at: http://localhost:3002
=================================================

To check if the server is running:
- curl http://localhost:3002/health
- Check the log files for details

To stop the server:
- Find the process: tasklist | findstr node
- Kill the process: taskkill /F /PID <PID>
=================================================
`);

// Exit the deployment script
process.exit(0); 