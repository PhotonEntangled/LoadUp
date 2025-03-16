#!/usr/bin/env node

/**
 * Script to standardize the codebase by:
 * 1. Identifying and removing deprecated files
 * 2. Ensuring consistent use of ES modules
 * 3. Standardizing import/export syntax
 * 4. Enforcing coding style
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Files and directories to be removed (deprecated)
const deprecatedPaths = [
  'docs/CLERK_REFERENCES.md',
  'docs/MIGRATION_CLERK_TO_NEXTAUTH.md',
  'scripts/find-clerk-references.js',
  'scripts/migrate-clerk-to-nextauth.js',
  'scripts/update-auth-deps.js',
];

// Extensions to process for standardization
const codeExtensions = ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs'];

// Function to find all code files in the project
function findCodeFiles() {
  try {
    const extensions = codeExtensions.map(ext => `"**/*${ext}"`).join(' ');
    const command = `git ls-files ${extensions}`;
    const result = execSync(command, { encoding: 'utf-8' });
    return result.split('\n')
      .filter(Boolean)
      .filter(file => !file.includes('node_modules') && !file.includes('dist'));
  } catch (err) {
    console.error('Error finding code files:', err.message);
    return [];
  }
}

// Function to remove deprecated files
function removeDeprecatedFiles() {
  console.log('\nRemoving deprecated files...');
  
  let removedCount = 0;
  
  for (const filePath of deprecatedPaths) {
    const fullPath = path.join(rootDir, filePath);
    
    if (fs.existsSync(fullPath)) {
      try {
        const stats = fs.statSync(fullPath);
        
        if (stats.isDirectory()) {
          fs.rmSync(fullPath, { recursive: true, force: true });
        } else {
          fs.unlinkSync(fullPath);
        }
        
        console.log(`✅ Removed: ${filePath}`);
        removedCount++;
      } catch (err) {
        console.error(`Error removing ${filePath}:`, err.message);
      }
    } else {
      console.log(`ℹ️ Not found: ${filePath}`);
    }
  }
  
  console.log(`Removed ${removedCount} deprecated files/directories`);
  return removedCount;
}

// Function to standardize imports in a file
function standardizeImports(filePath, content) {
  // Convert CommonJS requires to ES imports
  content = content.replace(/const\s+(\w+)\s*=\s*require\(['"]([^'"]+)['"]\);?/g, 'import $1 from "$2";');
  
  // Convert CommonJS destructured requires to ES imports
  content = content.replace(/const\s+{\s*([^}]+)\s*}\s*=\s*require\(['"]([^'"]+)['"]\);?/g, 'import { $1 } from "$2";');
  
  // Add .js extension to local imports if missing (for ESM compatibility)
  content = content.replace(/from\s+['"](\.[^'"]+)['"];?/g, (match, importPath) => {
    // Skip if already has an extension
    if (path.extname(importPath)) {
      return match;
    }
    return `from "${importPath}.js";`;
  });
  
  return content;
}

// Function to standardize exports in a file
function standardizeExports(filePath, content) {
  // Convert CommonJS module.exports to ES export default
  content = content.replace(/module\.exports\s*=\s*([^;]+);?/g, 'export default $1;');
  
  // Convert CommonJS exports.x = y to ES named exports
  content = content.replace(/exports\.(\w+)\s*=\s*([^;]+);?/g, 'export const $1 = $2;');
  
  return content;
}

// Function to ensure consistent use of ES modules
function ensureESModules(filePath, content) {
  // Check if file already has "type": "module" in package.json
  if (filePath.endsWith('package.json')) {
    try {
      const packageJson = JSON.parse(content);
      if (!packageJson.type) {
        packageJson.type = 'module';
        return JSON.stringify(packageJson, null, 2);
      }
    } catch (err) {
      console.error(`Error parsing ${filePath}:`, err.message);
    }
    return content;
  }
  
  // For TypeScript config files, ensure ESM settings
  if (filePath.endsWith('tsconfig.json')) {
    try {
      const tsConfig = JSON.parse(content);
      if (tsConfig.compilerOptions) {
        // Set module to NodeNext for ESM compatibility
        tsConfig.compilerOptions.module = 'NodeNext';
        // Set moduleResolution to NodeNext for ESM compatibility
        tsConfig.compilerOptions.moduleResolution = 'NodeNext';
      }
      return JSON.stringify(tsConfig, null, 2);
    } catch (err) {
      console.error(`Error parsing ${filePath}:`, err.message);
    }
    return content;
  }
  
  return content;
}

// Function to standardize a single file
function standardizeFile(filePath) {
  try {
    // Skip node_modules and dist directories
    if (filePath.includes('node_modules') || filePath.includes('dist')) {
      return false;
    }
    
    // Read file content
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Skip empty files
    if (!content.trim()) {
      return false;
    }
    
    // Process based on file extension
    const ext = path.extname(filePath);
    let newContent = content;
    
    if (codeExtensions.includes(ext)) {
      newContent = standardizeImports(filePath, newContent);
      newContent = standardizeExports(filePath, newContent);
    }
    
    // Ensure consistent use of ES modules
    newContent = ensureESModules(filePath, newContent);
    
    // Write back if changed
    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`✅ Standardized: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (err) {
    console.error(`Error standardizing ${filePath}:`, err.message);
    return false;
  }
}

// Function to run ESLint to fix coding style issues
function runESLint() {
  console.log('\nRunning ESLint to fix coding style issues...');
  
  try {
    execSync('npm run lint:fix', { stdio: 'inherit' });
    console.log('✅ ESLint fixes applied');
    return true;
  } catch (err) {
    console.error('Error running ESLint:', err.message);
    return false;
  }
}

// Function to create a report of standardization changes
function createStandardizationReport(removedFiles, standardizedFiles) {
  const reportPath = path.join(rootDir, 'standardization-report.md');
  
  const content = `# Codebase Standardization Report

Generated on: ${new Date().toISOString().split('T')[0]}

## Summary

- Removed deprecated files: ${removedFiles}
- Standardized files: ${standardizedFiles.length}

## Removed Deprecated Files

${deprecatedPaths.map(file => `- ${file}`).join('\n')}

## Standardized Files

${standardizedFiles.map(file => `- ${file}`).join('\n')}

## Next Steps

1. Review the changes to ensure they don't break functionality
2. Run tests to verify everything still works
3. Consider adding more standardization rules as needed
`;
  
  fs.writeFileSync(reportPath, content, 'utf8');
  console.log(`✅ Created standardization report at ${reportPath}`);
}

// Main function
async function main() {
  console.log('Starting codebase standardization...');
  
  // Remove deprecated files
  const removedFiles = removeDeprecatedFiles();
  
  // Find all code files
  const codeFiles = findCodeFiles();
  console.log(`\nFound ${codeFiles.length} code files to process`);
  
  // Standardize each file
  const standardizedFiles = [];
  for (const file of codeFiles) {
    const standardized = standardizeFile(file);
    if (standardized) {
      standardizedFiles.push(file);
    }
  }
  
  console.log(`\nStandardized ${standardizedFiles.length} files`);
  
  // Run ESLint to fix coding style issues
  runESLint();
  
  // Create standardization report
  createStandardizationReport(removedFiles, standardizedFiles);
  
  console.log('\nCodebase standardization complete!');
  console.log('\nNext steps:');
  console.log('1. Review the standardization-report.md file');
  console.log('2. Run tests to verify everything still works');
  console.log('3. Commit the changes');
}

// Run the script
main().catch(console.error); 