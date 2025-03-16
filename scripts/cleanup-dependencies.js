#!/usr/bin/env node

/**
 * Script to clean up unused dependencies and identify potential unused packages
 * Focuses on removing Clerk-related dependencies and finding other unused packages
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Dependencies to specifically remove (Clerk-related)
const depsToRemove = [
  '@clerk/clerk-expo',
  '@clerk/clerk-react',
  '@clerk/clerk-sdk-node',
  '@clerk/nextjs',
  '@clerk/types',
  '@clerk/backend',
  '@clerk/shared'
];

// Function to find all package.json files in the project
function findPackageJsonFiles() {
  try {
    const result = execSync('git ls-files "**/package.json"', { encoding: 'utf-8' });
    return result.split('\n')
      .filter(Boolean)
      .filter(file => !file.includes('node_modules'));
  } catch (err) {
    console.error('Error finding package.json files:', err.message);
    return [];
  }
}

// Function to remove specific dependencies from package.json
function removeSpecificDependencies(packageJsonPath) {
  console.log(`\nProcessing ${packageJsonPath}...`);
  
  try {
    // Read the package.json file
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    let modified = false;
    const removedDeps = [];

    // Check dependencies
    if (packageJson.dependencies) {
      for (const dep of depsToRemove) {
        if (packageJson.dependencies[dep]) {
          delete packageJson.dependencies[dep];
          removedDeps.push(dep);
          modified = true;
        }
      }
    }

    // Check devDependencies
    if (packageJson.devDependencies) {
      for (const dep of depsToRemove) {
        if (packageJson.devDependencies[dep]) {
          delete packageJson.devDependencies[dep];
          removedDeps.push(`${dep} (dev)`);
          modified = true;
        }
      }
    }

    // Write back if modified
    if (modified) {
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');
      console.log(`✅ Removed dependencies from ${packageJsonPath}: ${removedDeps.join(', ')}`);
    } else {
      console.log(`ℹ️ No specific dependencies to remove in ${packageJsonPath}`);
    }

    return { packageJson, modified };
  } catch (err) {
    console.error(`Error processing ${packageJsonPath}:`, err.message);
    return { packageJson: null, modified: false };
  }
}

// Function to physically remove Clerk directories from node_modules
function removeClerkDirectories() {
  console.log('\nRemoving Clerk directories from node_modules...');
  
  try {
    // Find all @clerk directories in node_modules
    const command = 'find . -type d -path "*/node_modules/@clerk" -not -path "*/node_modules/*/node_modules/*"';
    const result = execSync(command, { encoding: 'utf-8' });
    
    const directories = result.split('\n').filter(Boolean);
    
    if (directories.length === 0) {
      console.log('ℹ️ No Clerk directories found in node_modules');
      return;
    }
    
    // Remove each directory
    for (const dir of directories) {
      console.log(`Removing ${dir}...`);
      execSync(`rm -rf "${dir}"`);
    }
    
    console.log(`✅ Removed ${directories.length} Clerk directories from node_modules`);
  } catch (err) {
    // If the command fails (e.g., on Windows), provide alternative instructions
    console.error('Error removing Clerk directories:', err.message);
    console.log('\nPlease manually remove @clerk directories from node_modules folders.');
    console.log('On Windows, you can use:');
    console.log('Get-ChildItem -Path . -Include "@clerk" -Directory -Recurse | Remove-Item -Recurse -Force');
  }
}

// Function to suggest running npm-check to find unused dependencies
function suggestNpmCheck() {
  console.log('\nTo find more unused dependencies, you can run:');
  console.log('npm install -g npm-check');
  console.log('npm-check -u');
  console.log('\nThis will interactively show you unused dependencies and let you choose which ones to remove.');
}

// Function to suggest running depcheck to find unused dependencies
function suggestDepcheck() {
  console.log('\nAlternatively, you can run:');
  console.log('npm install -g depcheck');
  console.log('depcheck');
  console.log('\nThis will show you unused dependencies in your project.');
}

// Main function
async function main() {
  console.log('Starting dependency cleanup...');
  
  // Find all package.json files
  const packageJsonFiles = findPackageJsonFiles();
  console.log(`Found ${packageJsonFiles.length} package.json files`);
  
  // Process each package.json file
  for (const file of packageJsonFiles) {
    removeSpecificDependencies(file);
  }
  
  // Try to remove Clerk directories from node_modules
  try {
    removeClerkDirectories();
  } catch (err) {
    console.error('Error removing Clerk directories:', err.message);
  }
  
  // Suggest running npm-check or depcheck
  suggestNpmCheck();
  suggestDepcheck();
  
  console.log('\nDependency cleanup complete!');
  console.log('\nNext steps:');
  console.log('1. Run npm install to update your node_modules');
  console.log('2. Run tests to ensure everything still works');
  console.log('3. Consider running the suggested tools to find more unused dependencies');
}

// Run the script
main().catch(console.error); 