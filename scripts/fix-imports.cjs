#!/usr/bin/env node

/**
 * Import Path Fixer
 * 
 * This script automatically fixes imports by replacing relative paths
 * with path aliases where appropriate.
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
let modifiedFiles = 0;
let fixedImports = 0;

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
    let content = fs.readFileSync(filePath, 'utf8');
    const relativeFilePath = path.relative(ROOT_DIR, filePath);
    let fileModified = false;
    
    // Fix import statements
    let importMatches = [];
    let match;
    
    // Reset regex state
    IMPORT_REGEX.lastIndex = 0;
    
    // Find all import statements
    while ((match = IMPORT_REGEX.exec(content)) !== null) {
      importMatches.push({
        fullMatch: match[0],
        importPath: match[1],
        index: match.index,
        length: match[0].length
      });
    }
    
    // Fix require statements
    let requireMatches = [];
    
    // Reset regex state
    REQUIRE_REGEX.lastIndex = 0;
    
    // Find all require statements
    while ((match = REQUIRE_REGEX.exec(content)) !== null) {
      requireMatches.push({
        fullMatch: match[0],
        importPath: match[1],
        index: match.index,
        length: match[0].length
      });
    }
    
    // Combine all matches and sort by index in reverse order
    // (to avoid messing up indices when replacing)
    const allMatches = [...importMatches, ...requireMatches]
      .sort((a, b) => b.index - a.index);
    
    // Process each match
    allMatches.forEach(match => {
      const { fullMatch, importPath, index } = match;
      const suggestion = couldUseAlias(filePath, importPath);
      
      if (suggestion) {
        // Replace the import path with the alias
        const newImport = fullMatch.replace(importPath, suggestion.suggestion);
        content = content.substring(0, index) + newImport + content.substring(index + fullMatch.length);
        
        fileModified = true;
        fixedImports++;
      }
    });
    
    // Write the modified content back to the file
    if (fileModified) {
      fs.writeFileSync(filePath, content, 'utf8');
      modifiedFiles++;
      console.log(`Fixed imports in: ${relativeFilePath}`);
    }
    
    return fileModified;
  } catch (error) {
    console.error(`Error processing ${filePath}: ${error.message}`);
    return false;
  }
}

// Main function
function main() {
  console.log('Fixing import paths by replacing relative paths with aliases...\n');
  
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
  console.log(`- Files modified: ${modifiedFiles}`);
  console.log(`- Imports fixed: ${fixedImports}`);
  
  if (fixedImports > 0) {
    console.log('\nSuccess! Replaced relative paths with path aliases.');
    console.log('This should make imports more consistent and maintainable.');
  } else {
    console.log('\nNo imports needed fixing. All imports are already using appropriate path aliases.');
  }
}

// Run the script
main(); 