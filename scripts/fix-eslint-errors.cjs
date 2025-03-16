#!/usr/bin/env node

/**
 * ESLint Error Fixer
 * 
 * This script runs multiple fix operations in sequence to address the most common ESLint errors:
 * 1. Fix import extensions by running the fix-module-imports.cjs script
 * 2. Fix path aliases by running the fix-imports.cjs script
 * 3. Fix code style issues that can be automatically fixed using ESLint's --fix option
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '..');
const LOG_FILE = path.join(ROOT_DIR, 'eslint-fix-report.log');

// Directories to process
const DIRECTORIES_TO_PROCESS = [
  'packages/api',
  'packages/database',
  'packages/shared',
  'services',
  'components',
  '__tests__',
  'scripts',
];

// Helper function to run a command and log the output
function runCommand(command, description) {
  console.log(`\n${description}...`);
  
  try {
    const output = execSync(command, { cwd: ROOT_DIR, encoding: 'utf8' });
    console.log(output);
    fs.appendFileSync(LOG_FILE, `\n\n=== ${description} ===\n${output}`);
    return { success: true, output };
  } catch (error) {
    console.error(`Error running ${description}:`);
    console.error(error.message);
    fs.appendFileSync(LOG_FILE, `\n\n=== ERROR: ${description} ===\n${error.message}`);
    return { success: false, error: error.message };
  }
}

// Helper function to count ESLint errors and warnings
function countEslintIssues(directory) {
  try {
    const command = `npx eslint ${directory} --ext .js,.jsx,.ts,.tsx --format=json`;
    const output = execSync(command, { cwd: ROOT_DIR, encoding: 'utf8' });
    
    try {
      const results = JSON.parse(output);
      const errorCount = results.reduce((sum, file) => sum + file.errorCount, 0);
      const warningCount = results.reduce((sum, file) => sum + file.warningCount, 0);
      
      return { errorCount, warningCount, success: true };
    } catch (parseError) {
      console.error(`Error parsing ESLint results for ${directory}:`, parseError.message);
      return { errorCount: 0, warningCount: 0, success: false };
    }
  } catch (error) {
    console.error(`Error running ESLint on ${directory}:`, error.message);
    return { errorCount: 0, warningCount: 0, success: false };
  }
}

// Main function
async function main() {
  console.log('Starting ESLint error fixing process...');
  
  // Initialize log file
  fs.writeFileSync(LOG_FILE, `ESLint Fix Report - ${new Date().toISOString()}\n`);
  
  // Step 1: Count initial errors and warnings
  console.log('\nCounting initial ESLint issues...');
  const initialCounts = {};
  let totalInitialErrors = 0;
  let totalInitialWarnings = 0;
  
  for (const dir of DIRECTORIES_TO_PROCESS) {
    const { errorCount, warningCount } = countEslintIssues(dir);
    initialCounts[dir] = { errorCount, warningCount };
    totalInitialErrors += errorCount;
    totalInitialWarnings += warningCount;
    
    console.log(`- ${dir}: ${errorCount} errors, ${warningCount} warnings`);
  }
  
  fs.appendFileSync(LOG_FILE, `\n\nInitial ESLint Issues:\n- Total Errors: ${totalInitialErrors}\n- Total Warnings: ${totalInitialWarnings}\n`);
  
  // Step 2: Fix import extensions
  runCommand('node scripts/fix-module-imports.cjs', 'Fixing import extensions');
  
  // Step 3: Fix path aliases
  runCommand('node scripts/fix-imports.cjs', 'Fixing path aliases');
  
  // Step 4: Run ESLint with --fix option on each directory
  for (const dir of DIRECTORIES_TO_PROCESS) {
    runCommand(`npx eslint ${dir} --ext .js,.jsx,.ts,.tsx --fix`, `Running ESLint auto-fix on ${dir}`);
  }
  
  // Step 5: Count remaining errors and warnings
  console.log('\nCounting remaining ESLint issues...');
  const finalCounts = {};
  let totalFinalErrors = 0;
  let totalFinalWarnings = 0;
  
  for (const dir of DIRECTORIES_TO_PROCESS) {
    const { errorCount, warningCount } = countEslintIssues(dir);
    finalCounts[dir] = { errorCount, warningCount };
    totalFinalErrors += errorCount;
    totalFinalWarnings += warningCount;
    
    console.log(`- ${dir}: ${errorCount} errors, ${warningCount} warnings`);
  }
  
  // Step 6: Generate a summary report
  console.log('\nESLint Fix Summary:');
  console.log(`- Initial Errors: ${totalInitialErrors}`);
  console.log(`- Initial Warnings: ${totalInitialWarnings}`);
  console.log(`- Remaining Errors: ${totalFinalErrors}`);
  console.log(`- Remaining Warnings: ${totalFinalWarnings}`);
  console.log(`- Errors Fixed: ${totalInitialErrors - totalFinalErrors}`);
  console.log(`- Warnings Fixed: ${totalInitialWarnings - totalFinalWarnings}`);
  
  fs.appendFileSync(LOG_FILE, `\n\nESLint Fix Summary:\n- Initial Errors: ${totalInitialErrors}\n- Initial Warnings: ${totalInitialWarnings}\n- Remaining Errors: ${totalFinalErrors}\n- Remaining Warnings: ${totalFinalWarnings}\n- Errors Fixed: ${totalInitialErrors - totalFinalErrors}\n- Warnings Fixed: ${totalInitialWarnings - totalFinalWarnings}`);
  
  // Step 7: Generate a report of remaining issues by category
  try {
    console.log('\nAnalyzing remaining issues by rule...');
    const command = `npx eslint ${DIRECTORIES_TO_PROCESS.join(' ')} --ext .js,.jsx,.ts,.tsx --format=json`;
    const output = execSync(command, { cwd: ROOT_DIR, encoding: 'utf8' });
    
    const eslintResults = JSON.parse(output);
    const issuesByRule = {};
    
    eslintResults.forEach(file => {
      file.messages.forEach(message => {
        const ruleId = message.ruleId || 'unknown';
        if (!issuesByRule[ruleId]) {
          issuesByRule[ruleId] = { errors: 0, warnings: 0 };
        }
        
        if (message.severity === 2) { // Error
          issuesByRule[ruleId].errors++;
        } else if (message.severity === 1) { // Warning
          issuesByRule[ruleId].warnings++;
        }
      });
    });
    
    console.log('\nRemaining Issues by Rule:');
    Object.entries(issuesByRule).sort((a, b) => {
      const totalA = a[1].errors + a[1].warnings;
      const totalB = b[1].errors + b[1].warnings;
      return totalB - totalA;
    }).forEach(([rule, counts]) => {
      console.log(`- ${rule}: ${counts.errors} errors, ${counts.warnings} warnings`);
      fs.appendFileSync(LOG_FILE, `\n- ${rule}: ${counts.errors} errors, ${counts.warnings} warnings`);
    });
  } catch (error) {
    console.error('Error analyzing remaining issues:', error.message);
    fs.appendFileSync(LOG_FILE, `\n\nError analyzing remaining issues: ${error.message}`);
  }
  
  console.log('\nESLint fix process completed. See eslint-fix-report.log for details.');
}

// Run the script
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 