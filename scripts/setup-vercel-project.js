// Script to set up Vercel project and connect it to GitHub
// Usage: node setup-vercel-project.js

const { execSync } = require('child_process');

// Configuration
const PROJECT_NAME = 'loadup';
const GITHUB_REPO = 'your-github-username/LoadUp'; // Replace with your GitHub username

// Function to run shell commands
function runCommand(command) {
  try {
    return execSync(command, { encoding: 'utf8' });
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    console.error(error.message);
    process.exit(1);
  }
}

// Function to check if Vercel CLI is installed
function checkVercelCLI() {
  try {
    runCommand('vercel --version');
    console.log('✅ Vercel CLI is installed');
  } catch (error) {
    console.error('❌ Vercel CLI is not installed. Please install it using: npm install -g vercel');
    process.exit(1);
  }
}

// Function to check if user is logged in to Vercel
function checkVercelLogin() {
  try {
    const whoami = runCommand('vercel whoami');
    console.log(`✅ Logged in to Vercel as: ${whoami.trim()}`);
  } catch (error) {
    console.error('❌ Not logged in to Vercel. Please login using: vercel login');
    process.exit(1);
  }
}

// Function to create Vercel project
function createVercelProject() {
  console.log(`🔄 Creating Vercel project: ${PROJECT_NAME}`);
  
  try {
    runCommand(`vercel projects add ${PROJECT_NAME} --confirm`);
    console.log(`✅ Successfully created Vercel project: ${PROJECT_NAME}`);
  } catch (error) {
    console.log(`ℹ️ Project may already exist: ${PROJECT_NAME}`);
  }
}

// Function to connect Vercel project to GitHub
function connectToGitHub() {
  console.log(`🔄 Connecting Vercel project to GitHub repository: ${GITHUB_REPO}`);
  
  try {
    runCommand(`vercel git connect ${GITHUB_REPO}`);
    console.log(`✅ Successfully connected to GitHub repository: ${GITHUB_REPO}`);
  } catch (error) {
    console.error(`❌ Error connecting to GitHub repository: ${GITHUB_REPO}`);
    console.error(error.message);
  }
}

// Function to set up automatic deployments
function setupAutomaticDeployments() {
  console.log('🔄 Setting up automatic deployments');
  
  try {
    runCommand(`vercel project update ${PROJECT_NAME} --build-command "npm run build" --output-directory "out"`);
    console.log('✅ Successfully set up automatic deployments');
  } catch (error) {
    console.error('❌ Error setting up automatic deployments');
    console.error(error.message);
  }
}

// Main function
function main() {
  console.log('🚀 Starting Vercel project setup');
  
  // Check prerequisites
  checkVercelCLI();
  checkVercelLogin();
  
  // Set up Vercel project
  createVercelProject();
  connectToGitHub();
  setupAutomaticDeployments();
  
  console.log('✅ Vercel project setup completed');
  console.log('');
  console.log('Next steps:');
  console.log('1. Run the transfer-secrets-to-vercel.js script to transfer GitHub secrets to Vercel');
  console.log('2. Deploy your application using: vercel --prod');
}

// Run the script
main(); 