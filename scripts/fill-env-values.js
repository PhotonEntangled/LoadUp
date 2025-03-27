/**
 * fill-env-values.js
 * 
 * Script to help fill in environment variable values in the .env file.
 * This script will prompt for values for each placeholder in the .env file.
 * 
 * Usage:
 *   node scripts/fill-env-values.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

// Get current file directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Path to .env file
const envFilePath = path.join(projectRoot, '.env');

// Check if .env file exists
if (!fs.existsSync(envFilePath)) {
  console.error(`Error: .env file not found at ${envFilePath}`);
  process.exit(1);
}

console.log('Fill in environment variable values');
console.log('----------------------------------');
console.log('This script will help you fill in values for your environment variables.');
console.log('For each variable, enter the value or press Enter to keep the current value.');
console.log('----------------------------------');

// Read .env file
const envContent = fs.readFileSync(envFilePath, 'utf8');
const envLines = envContent.split('\n');

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Process each line
async function processLines() {
  let newEnvContent = '';
  
  for (const line of envLines) {
    // Skip comments and empty lines
    if (line.startsWith('#') || line.trim() === '') {
      newEnvContent += line + '\n';
      continue;
    }

    // Parse key-value pair
    const parts = line.split('=', 2);
    if (parts.length === 2) {
      const key = parts[0].trim();
      const value = parts[1].trim();

      // Skip if key is empty
      if (key === '') {
        newEnvContent += line + '\n';
        continue;
      }

      // Check if value is a placeholder
      const isPlaceholder = value === `your_${key.toLowerCase()}_here` || 
                           (value.includes('your_') && value.includes('_here'));

      if (isPlaceholder) {
        // Prompt for value
        const newValue = await new Promise(resolve => {
          rl.question(`Enter value for ${key} (current: ${value}): `, answer => {
            resolve(answer.trim() || value);
          });
        });
        
        newEnvContent += `${key}=${newValue}\n`;
      } else {
        // Keep existing value
        newEnvContent += line + '\n';
      }
    } else {
      // Keep line as is
      newEnvContent += line + '\n';
    }
  }

  // Write updated .env file
  fs.writeFileSync(envFilePath, newEnvContent);
  console.log('\nEnvironment variables updated successfully!');
  console.log(`Updated .env file at ${envFilePath}`);
  console.log('\nYou can now run the upload script to send these values to Vercel:');
  console.log('  node scripts/upload-env-to-vercel.js');
  
  rl.close();
}

// Start processing
processLines().catch(error => {
  console.error('Error:', error);
  rl.close();
  process.exit(1);
}); 