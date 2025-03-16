#!/usr/bin/env node

/**
 * Module Import Fixer
 * 
 * This script automatically adds file extensions to ES module imports
 * where they are missing. This is necessary for ES modules to work correctly.
 */

const fs = require('fs');
const path = require('path');

const glob = require('glob');

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
  '**/*.cjs',
  '**/*.cts',
];

// Regular expression for detecting ES module imports
const ESM_IMPORT_REGEX = /import\s+(?:{[^}]*}|\*\s+as\s+[^;]+|[^;{]*)\s+from\s+['"]([^'"]+)['"]/g;

// Track statistics
let totalFiles = 0;
let modifiedFiles = 0;
let fixedImports = 0;

// Helper function to check if a path is relative
function isRelativePath(importPath) {
  return importPath.startsWith('./') || importPath.startsWith('../') || importPath.startsWith('/');
}

// Helper function to find the actual file that an import refers to
function findActualFile(basePath, importPath) {
  const dir = path.dirname(basePath);
  const resolvedPath = path.resolve(dir, importPath);
  
  // List of possible extensions to try
  const extensions = ['.js', '.ts', '.tsx', '.jsx', '.mjs'];
  
  // First, check if the exact path exists
  if (fs.existsSync(resolvedPath)) {
    return resolvedPath;
  }
  
  // Then try adding each extension
  for (const ext of extensions) {
    const pathWithExt = `${resolvedPath}${ext}`;
    if (fs.existsSync(pathWithExt)) {
      return pathWithExt;
    }
  }
  
  // Check if it's a directory with an index file
  for (const ext of extensions) {
    const indexPath = path.join(resolvedPath, `index${ext}`);
    if (fs.existsSync(indexPath)) {
      return indexPath;
    }
  }
  
  // If we can't find the file, return null
  return null;
}

// Process a single file
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const relativeFilePath = path.relative(ROOT_DIR, filePath);
    let fileModified = false;
    const importMatches = [];
    
    // Find all import statements
    let match;
    while ((match = ESM_IMPORT_REGEX.exec(content)) !== null) {
      importMatches.push({
        fullMatch: match[0],
        importPath: match[1],
        index: match.index,
        length: match[0].length
      });
    }
    
    // Process imports in reverse order to avoid messing up indices
    importMatches.reverse().forEach(importMatch => {
      const { fullMatch, importPath, index } = importMatch;
      
      // Skip non-relative imports (node modules, etc.)
      if (!isRelativePath(importPath)) {
        return;
      }
      
      // Skip imports that already have an extension
      if (path.extname(importPath)) {
        return;
      }
      
      // Find the actual file
      const actualFile = findActualFile(filePath, importPath);
      if (!actualFile) {
        console.log(`  - Could not find file for import: ${importPath} in ${relativeFilePath}`);
        return;
      }
      
      // Get the extension of the actual file
      const extension = path.extname(actualFile);
      
      // Create the new import path with extension
      const newImportPath = `${importPath}${extension}`;
      
      // Replace the import in the content
      const newImport = fullMatch.replace(importPath, newImportPath);
      content = content.substring(0, index) + newImport + content.substring(index + fullMatch.length);
      
      fileModified = true;
      fixedImports++;
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
  console.log('Fixing ES module imports by adding missing file extensions...\n');
  
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
    console.log('\nSuccess! Added file extensions to ES module imports.');
    console.log('This should help resolve module resolution issues.');
  } else {
    console.log('\nNo imports needed fixing. All imports already have file extensions.');
  }
}

// Run the script
main(); 