#!/usr/bin/env node

/**
 * Master script to run all cleanup scripts in sequence:
 * 1. cleanup-dependencies.js - Remove unused dependencies
 * 2. cleanup-tests.js - Fix or skip failing tests
 * 3. standardize-codebase.js - Standardize code and remove deprecated files
 * 
 * This script will provide a summary of all changes made.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Scripts to run in sequence
const scripts = [
  'cleanup-dependencies.js',
  'cleanup-tests.js',
  'standardize-codebase.js'
];

// Function to make scripts executable
function makeScriptsExecutable() {
  console.log('Making cleanup scripts executable...');
  
  for (const script of scripts) {
    const scriptPath = path.join(__dirname, script);
    
    if (fs.existsSync(scriptPath)) {
      try {
        // Make script executable (Unix only)
        if (process.platform !== 'win32') {
          execSync(`chmod +x ${scriptPath}`);
          console.log(`✅ Made executable: ${script}`);
        }
      } catch (err) {
        console.error(`Error making ${script} executable:`, err.message);
      }
    } else {
      console.error(`❌ Script not found: ${script}`);
    }
  }
}

// Function to run a script and capture its output
function runScript(script) {
  console.log(`\n========== Running ${script} ==========\n`);
  
  const scriptPath = path.join(__dirname, script);
  
  try {
    // Run the script and capture output
    const output = execSync(`node ${scriptPath}`, { 
      encoding: 'utf-8',
      stdio: ['inherit', 'pipe', 'pipe']
    });
    
    console.log(output);
    return { success: true, output };
  } catch (err) {
    console.error(`Error running ${script}:`, err.message);
    if (err.stdout) console.log(err.stdout.toString());
    if (err.stderr) console.error(err.stderr.toString());
    return { success: false, error: err.message };
  }
}

// Function to create a summary report
function createSummaryReport(results) {
  const reportPath = path.join(rootDir, 'cleanup-summary.md');
  
  const content = `# Codebase Cleanup Summary

Generated on: ${new Date().toISOString().split('T')[0]}

## Scripts Run

${scripts.map((script, index) => {
  const result = results[index];
  return `### ${script}
- Status: ${result.success ? '✅ Success' : '❌ Failed'}
${result.success ? '' : `- Error: ${result.error}`}
`;
}).join('\n')}

## Next Steps

1. Run \`npm install\` to update dependencies
2. Run \`npm run test:simple\` to verify basic functionality
3. Run \`npm run test:coverage\` to check test coverage
4. Review the standardization-report.md file for details on code changes
5. Commit the changes

## Manual Tasks

- Review and fix remaining failing tests
- Set up GitHub secrets for CI/CD pipeline
- Continue improving test coverage
`;
  
  fs.writeFileSync(reportPath, content, 'utf8');
  console.log(`\n✅ Created summary report at ${reportPath}`);
}

// Main function
async function main() {
  console.log('Starting comprehensive codebase cleanup...');
  
  // Make scripts executable
  makeScriptsExecutable();
  
  // Run each script in sequence and collect results
  const results = [];
  for (const script of scripts) {
    const result = runScript(script);
    results.push(result);
    
    // If a script fails, continue with the next one
    if (!result.success) {
      console.warn(`Warning: ${script} failed, continuing with next script`);
    }
  }
  
  // Create summary report
  createSummaryReport(results);
  
  console.log('\n========== Cleanup Complete ==========');
  console.log('\nNext steps:');
  console.log('1. Review the cleanup-summary.md file');
  console.log('2. Run npm install to update dependencies');
  console.log('3. Run tests to verify everything still works');
  console.log('4. Commit the changes');
}

// Run the script
main().catch(console.error); 