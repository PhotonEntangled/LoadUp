// Script to transfer GitHub secrets to Vercel
// Usage: node transfer-secrets-to-vercel.js

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const PROJECT_NAME = 'loadup';
const GITHUB_SECRETS_FILE = path.join(__dirname, 'github-secrets.json');

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

// Function to read GitHub secrets from file
function readGitHubSecrets() {
  try {
    if (!fs.existsSync(GITHUB_SECRETS_FILE)) {
      console.error(`❌ GitHub secrets file not found: ${GITHUB_SECRETS_FILE}`);
      console.error('Please create this file with your GitHub secrets in JSON format.');
      process.exit(1);
    }
    
    const secretsData = fs.readFileSync(GITHUB_SECRETS_FILE, 'utf8');
    return JSON.parse(secretsData);
  } catch (error) {
    console.error('❌ Error reading GitHub secrets file:');
    console.error(error.message);
    process.exit(1);
  }
}

// Function to transfer secrets to Vercel
function transferSecretsToVercel(secrets) {
  console.log('🔄 Transferring secrets to Vercel...');
  
  Object.entries(secrets).forEach(([key, value]) => {
    try {
      console.log(`Transferring secret: ${key}`);
      runCommand(`vercel env add ${key} ${PROJECT_NAME} --value="${value}"`);
      console.log(`✅ Successfully transferred secret: ${key}`);
    } catch (error) {
      console.error(`❌ Error transferring secret: ${key}`);
      console.error(error.message);
    }
  });
}

// Main function
function main() {
  console.log('🚀 Starting GitHub secrets transfer to Vercel');
  
  // Check prerequisites
  checkVercelCLI();
  checkVercelLogin();
  
  // Read GitHub secrets
  const secrets = readGitHubSecrets();
  console.log(`📋 Found ${Object.keys(secrets).length} secrets to transfer`);
  
  // Transfer secrets to Vercel
  transferSecretsToVercel(secrets);
  
  console.log('✅ GitHub secrets transfer completed');
}

// Run the script
main(); 