#!/usr/bin/env node

/**
 * Import Path Validator
 * 
 * This script scans the codebase for import statements and validates them
 * against the defined path aliases. It suggests corrections for imports
 * that could be improved using path aliases.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Load path mappings
const pathMappings = require('./path-mapping.cjs');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '..');
const FILE_PATTERNS = [
  '**/*.js',
  '**/*.ts',
  '**/*.tsx',
  '**/*.jsx',
  '**/*.mjs',
];
const EXCLUDE_PATTERNS = [
  '**/node_modules/**',
  '**/dist/**',
  '**/build/**',
  '**/coverage/**',
];

// Regular expression for detecting imports
const IMPORT_REGEX = /import\s+(?:{[^}]*}|\*\s+as\s+[^;]+|[^;{]*)\s+from\s+['"]([^'"]+)['"]/g;
const REQUIRE_REGEX = /(?:const|let|var)\s+(?:{[^}]*}|[^=]*)\s*=\s*require\(['"]([^'"]+)['"]\)/g;

// Track statistics
let totalFiles = 0;
let filesWithIssues = 0;
let totalIssues = 0;

// Helper function to check if a path is relative
function isRelativePath(importPath) {
  return importPath.startsWith('./') || importPath.startsWith('../');
}

// Helper function to check if a path could use an alias
function couldUseAlias(filePath, importPath) {
  if (!isRelativePath(importPath)) {
    return null; // Not a relative path, can't suggest an alias
  }
  
  const dir = path.dirname(filePath);
  const absoluteImportPath = path.resolve(dir, importPath);
  const relativeToRoot = path.relative(ROOT_DIR, absoluteImportPath);
  
  // Check each path mapping to see if it could be used
  for (const [alias, aliasPath] of Object.entries(pathMappings)) {
    const aliasFullPath = path.resolve(ROOT_DIR, aliasPath.replace(/\/\*$/, ''));
    const relativeToAlias = path.relative(aliasFullPath, absoluteImportPath);
    
    // If the import is within this alias's directory and not going up directories
    if (!relativeToAlias.startsWith('..') && !path.isAbsolute(relativeToAlias)) {
      return {
        alias,
        suggestion: `${alias}/${relativeToAlias}`.replace(/\\/g, '/')
      };
    }
  }
  
  return null;
}

// Process a single file
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativeFilePath = path.relative(ROOT_DIR, filePath);
    let fileHasIssues = false;
    let issues = [];
    
    // Find all import statements
    let match;
    while ((match = IMPORT_REGEX.exec(content)) !== null) {
      const importPath = match[1];
      const suggestion = couldUseAlias(filePath, importPath);
      
      if (suggestion) {
        issues.push({
          type: 'import',
          line: content.substring(0, match.index).split('\n').length,
          original: importPath,
          suggested: suggestion.suggestion
        });
      }
    }
    
    // Find all require statements
    while ((match = REQUIRE_REGEX.exec(content)) !== null) {
      const importPath = match[1];
      const suggestion = couldUseAlias(filePath, importPath);
      
      if (suggestion) {
        issues.push({
          type: 'require',
          line: content.substring(0, match.index).split('\n').length,
          original: importPath,
          suggested: suggestion.suggestion
        });
      }
    }
    
    // Report issues for this file
    if (issues.length > 0) {
      console.log(`\nIssues in ${relativeFilePath}:`);
      issues.forEach(issue => {
        console.log(`  Line ${issue.line}: ${issue.type} "${issue.original}" could use alias "${issue.suggested}"`);
        totalIssues++;
      });
      fileHasIssues = true;
      filesWithIssues++;
    }
    
    return fileHasIssues;
  } catch (error) {
    console.error(`Error processing ${filePath}: ${error.message}`);
    return false;
  }
}

// Main function
function main() {
  console.log('Validating import paths against defined aliases...\n');
  
  // Find all files matching the patterns
  const files = glob.sync(FILE_PATTERNS, {
    cwd: ROOT_DIR,
    ignore: EXCLUDE_PATTERNS,
    absolute: true
  });
  
  totalFiles = files.length;
  console.log(`Found ${totalFiles} files to process.`);
  
  // Process each file
  files.forEach(file => {
    processFile(file);
  });
  
  // Print summary
  console.log('\nSummary:');
  console.log(`- Total files processed: ${totalFiles}`);
  console.log(`- Files with issues: ${filesWithIssues}`);
  console.log(`- Total issues found: ${totalIssues}`);
  
  if (totalIssues > 0) {
    console.log('\nRecommendation: Run "npm run fix:imports" to automatically fix these issues.');
    process.exit(1); // Exit with error code if issues found
  } else {
    console.log('\nSuccess! All imports are using appropriate path aliases.');
  }
}

// Run the script
main(); 