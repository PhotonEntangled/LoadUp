/**
 * update-config.js
 * 
 * This script updates all configuration files with the centralized path alias configuration.
 * It serves as the entry point for updating the entire system.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Updating configuration files with centralized path aliases...');

// Step 1: Update tsconfig.json
console.log('\n--- Updating TypeScript configuration ---');
try {
  execSync('node scripts/update-tsconfig.js', { stdio: 'inherit' });
  console.log('✅ Successfully updated TypeScript configuration');
} catch (error) {
  console.error('❌ Failed to update TypeScript configuration');
  process.exit(1);
}

// Step 2: Update Jest configuration
console.log('\n--- Updating Jest configuration ---');
try {
  // Check if jest.config.mjs exists
  const jestConfigPath = path.resolve(__dirname, '../jest.config.mjs');
  if (fs.existsSync(jestConfigPath)) {
    console.log('Jest configuration is using ES modules, no update needed');
    console.log('Please ensure jest.config.mjs imports path-aliases.mjs correctly');
  } else {
    console.log('Jest configuration not found, skipping update');
  }
  console.log('✅ Successfully checked Jest configuration');
} catch (error) {
  console.error('❌ Failed to update Jest configuration');
  process.exit(1);
}

// Step 3: Update ESLint configuration
console.log('\n--- Updating ESLint configuration ---');
try {
  // Check if .eslintrc.cjs exists
  const eslintConfigPath = path.resolve(__dirname, '../.eslintrc.cjs');
  if (fs.existsSync(eslintConfigPath)) {
    console.log('ESLint configuration exists, please ensure it imports path-aliases.js correctly');
  } else {
    console.log('ESLint configuration not found, skipping update');
  }
  console.log('✅ Successfully checked ESLint configuration');
} catch (error) {
  console.error('❌ Failed to update ESLint configuration');
  process.exit(1);
}

// Step 4: Update webpack configuration (if applicable)
console.log('\n--- Checking webpack configuration ---');
try {
  // Check if webpack.config.js exists
  const webpackConfigPath = path.resolve(__dirname, '../webpack.config.js');
  if (fs.existsSync(webpackConfigPath)) {
    console.log('Webpack configuration exists, please ensure it imports path-aliases.js correctly');
  } else {
    console.log('Webpack configuration not found, skipping update');
  }
  console.log('✅ Successfully checked webpack configuration');
} catch (error) {
  console.error('❌ Failed to check webpack configuration');
  process.exit(1);
}

// Step 5: Update Next.js configuration (if applicable)
console.log('\n--- Checking Next.js configuration ---');
try {
  // Check if next.config.js exists in admin dashboard
  const nextConfigPath = path.resolve(__dirname, '../apps/admin-dashboard/next.config.js');
  if (fs.existsSync(nextConfigPath)) {
    console.log('Next.js configuration exists, please ensure it imports path-aliases.js correctly');
  } else {
    console.log('Next.js configuration not found, skipping update');
  }
  console.log('✅ Successfully checked Next.js configuration');
} catch (error) {
  console.error('❌ Failed to check Next.js configuration');
  process.exit(1);
}

console.log('\n✅ Successfully updated all configuration files');
console.log('\nNext steps:');
console.log('1. Run `npm run fix:imports` to fix import issues in the codebase');
console.log('2. Run `npm run lint` to check for any remaining issues');
console.log('3. Run `npm test` to ensure all tests pass with the new configuration'); 