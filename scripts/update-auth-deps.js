#!/usr/bin/env node

/**
 * This script updates package.json to replace Clerk.js dependencies with NextAuth.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Dependencies to remove (Clerk.js related)
const depsToRemove = [
  '@clerk/clerk-expo',
  '@clerk/clerk-react',
  '@clerk/clerk-sdk-node',
  '@clerk/nextjs',
  '@clerk/types',
  '@clerk/backend',
  '@clerk/shared'
];

// Dependencies to add (NextAuth.js related)
const depsToAdd = {
  'next-auth': '^4.24.5',
  'bcryptjs': '^2.4.3',
  '@auth/drizzle-adapter': '^0.3.17'
};

// Dev dependencies to add
const devDepsToAdd = {
  '@types/bcryptjs': '^2.4.6'
};

// Update the root package.json
async function updatePackageJson(packageJsonPath) {
  console.log(`Processing ${packageJsonPath}...`);
  
  // Read the package.json file
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Keep track of removed dependencies
  const removedDeps = [];
  
  // Remove Clerk.js dependencies
  for (const dep of depsToRemove) {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      delete packageJson.dependencies[dep];
      removedDeps.push(dep);
      console.log(`Removed dependency: ${dep}`);
    }
  }
  
  // Add NextAuth.js dependencies
  for (const [dep, version] of Object.entries(depsToAdd)) {
    if (!packageJson.dependencies) {
      packageJson.dependencies = {};
    }
    
    if (!packageJson.dependencies[dep]) {
      packageJson.dependencies[dep] = version;
      console.log(`Added dependency: ${dep}@${version}`);
    } else {
      console.log(`Dependency already exists: ${dep}@${packageJson.dependencies[dep]}`);
    }
  }
  
  // Add dev dependencies
  for (const [dep, version] of Object.entries(devDepsToAdd)) {
    if (!packageJson.devDependencies) {
      packageJson.devDependencies = {};
    }
    
    if (!packageJson.devDependencies[dep]) {
      packageJson.devDependencies[dep] = version;
      console.log(`Added dev dependency: ${dep}@${version}`);
    } else {
      console.log(`Dev dependency already exists: ${dep}@${packageJson.devDependencies[dep]}`);
    }
  }
  
  // Write updated package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');
  
  return removedDeps;
}

// Update environment variables in .env.example
function updateEnvExample() {
  const envPath = path.join(rootDir, '.env.example');
  if (!fs.existsSync(envPath)) {
    console.log('No .env.example file found. Skipping environment variable updates.');
    return;
  }
  
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Replace Clerk.js environment variables with NextAuth ones
  envContent = envContent
    .replace(/NEXTAUTH_SECRET=.*/g, 'NEXTAUTH_SECRET=your-secret-here')
    .replace(/NEXTAUTH_URL=.*/g, 'NEXTAUTH_URL=http://localhost:3000')
    .replace(/EXPO_PUBLIC_NEXTAUTH_URL=.*/g, 'EXPO_PUBLIC_NEXTAUTH_URL=http://localhost:3000')
    .replace(/NEXT_PUBLIC_CLERK_SIGN_IN_URL=.*/g, '')
    .replace(/NEXT_PUBLIC_CLERK_SIGN_UP_URL=.*/g, '')
    .replace(/NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=.*/g, '')
    .replace(/NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=.*/g, '');
  
  // Add descriptions
  envContent = envContent
    .replace('NEXTAUTH_SECRET=your-secret-here', '# Required for JWT encryption\nNEXTAUTH_SECRET=your-secret-here')
    .replace('NEXTAUTH_URL=http://localhost:3000', '# Required for production\nNEXTAUTH_URL=http://localhost:3000');
  
  fs.writeFileSync(envPath, envContent, 'utf8');
  console.log('Updated .env.example with NextAuth environment variables');
}

// Main function
async function main() {
  console.log('Updating package.json files to replace Clerk.js with NextAuth.js...');
  
  // Update root package.json
  const rootRemovedDeps = await updatePackageJson(path.join(rootDir, 'package.json'));
  
  // Update apps package.json files
  const appsDir = path.join(rootDir, 'apps');
  
  if (fs.existsSync(appsDir)) {
    const appDirs = fs.readdirSync(appsDir).filter(dir => 
      fs.statSync(path.join(appsDir, dir)).isDirectory()
    );
    
    for (const appDir of appDirs) {
      const appPackageJsonPath = path.join(appsDir, appDir, 'package.json');
      
      if (fs.existsSync(appPackageJsonPath)) {
        await updatePackageJson(appPackageJsonPath);
      }
    }
  }
  
  // Update environment variables
  updateEnvExample();
  
  console.log('\nReplaced Clerk.js dependencies with NextAuth.js');
  console.log('\nDon\'t forget to run: npm install');
}

main().catch(console.error); 