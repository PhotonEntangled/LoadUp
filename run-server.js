
// Simple script to run the server
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Use the full path to npm
const npmPath = process.platform === 'win32' 
  ? 'C:\\Program Files\\nodejs\\npm.cmd' 
  : '/usr/bin/npm';

// Run the server using npm
const server = spawn(npmPath, ['run', 'dev'], {
  cwd: path.join(__dirname, 'packages/api'),
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT,
    NODE_ENV
  },
  shell: true
});

// Handle server exit
server.on('exit', (code) => {
  console.log(`Server exited with code ${code}`);
  process.exit(code);
});

// Handle process signals
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('Shutting down server...');
  server.kill('SIGTERM');
});
