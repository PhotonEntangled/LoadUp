#!/usr/bin/env node
/**
 * fix-imports.js
 * 
 * This script fixes import statements in the codebase:
 * 1. Adds missing file extensions to relative imports
 * 2. Converts relative imports to use path aliases where appropriate
 * 3. Standardizes import order
 */
const fs = require('fs');
const path = require('path');
const { glob } = require('glob');
const { allAliases } = require('./path-aliases');

// Find all TypeScript and JavaScript files
const files = glob.sync('**/*.{ts,tsx,js,jsx}', {
  ignore: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.next/**', '**/.turbo/**'],
});

// Convert path aliases to regex patterns for matching
const aliasPatterns = Object.entries(allAliases).map(([alias, aliasPath]) => {
  const pattern = alias.replace('/*', '/(.*)');
  const replacement = aliasPath.replace('/*', '/$1');
  return { pattern, replacement, alias };
});

// Function to get the relative path between two absolute paths
function getRelativePath(from, to) {
  const relativePath = path.relative(path.dirname(from), to);
  return relativePath.startsWith('.') ? relativePath : `./${relativePath}`;
}

// Function to check if a path should use a path alias
function shouldUsePathAlias(filePath, importPath) {
  // If it's already using a path alias, keep it
  if (importPath.startsWith('@')) {
    return true;
  }
  
  // If it's a relative import going up more than one directory, convert to path alias
  const upDirCount = (importPath.match(/\.\.\//g) || []).length;
  return upDirCount > 1;
}

// Function to convert a relative import to use a path alias
function convertToPathAlias(filePath, importPath) {
  // Get the absolute path of the imported file
  const absoluteImportPath = path.resolve(path.dirname(filePath), importPath);
  
  // Find the most specific path alias that matches the absolute import path
  let bestMatch = null;
  let bestMatchLength = 0;
  
  for (const { pattern, replacement, alias } of aliasPatterns) {
    const regex = new RegExp(`^${replacement.replace(/\*/g, '.*')}$`);
    if (regex.test(absoluteImportPath)) {
      const matchLength = replacement.length;
      if (matchLength > bestMatchLength) {
        bestMatch = { pattern, replacement, alias };
        bestMatchLength = matchLength;
      }
    }
  }
  
  if (bestMatch) {
    // Convert the absolute import path to use the path alias
    const { pattern, replacement, alias } = bestMatch;
    const aliasImportPath = absoluteImportPath.replace(
      new RegExp(`^${replacement.replace(/\*/g, '.*')}`),
      alias.replace('/*', '/')
    );
    return aliasImportPath;
  }
  
  // If no path alias matches, return the original import path
  return importPath;
}

// Function to add file extension to a relative import
function addFileExtension(filePath, importPath) {
  // If it's not a relative import, return as is
  if (!importPath.startsWith('.')) {
    return importPath;
  }
  
  // If it already has a file extension, return as is
  if (/\.(js|jsx|ts|tsx)$/.test(importPath)) {
    return importPath;
  }
  
  // Get the absolute path of the imported file
  const absoluteImportPath = path.resolve(path.dirname(filePath), importPath);
  
  // Check if the file exists with different extensions
  const extensions = ['.ts', '.tsx', '.js', '.jsx'];
  for (const ext of extensions) {
    if (fs.existsSync(`${absoluteImportPath}${ext}`)) {
      return `${importPath}${ext}`;
    }
    
    // Check for index files
    if (fs.existsSync(path.join(absoluteImportPath, `index${ext}`))) {
      return `${importPath}/index${ext}`;
    }
  }
  
  // If no file is found, return the original import path
  return importPath;
}

// Process each file
let fixedFiles = 0;
let totalImportsFixes = 0;

files.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Find all import statements
  const importRegex = /import\s+(?:{[^}]*}|\*\s+as\s+[^,]*|[^,{]*)\s+from\s+['"]([^'"]*)['"]/g;
  let match;
  let importsFixes = 0;
  
  // Create a new content with fixed imports
  let newContent = content;
  
  while ((match = importRegex.exec(content)) !== null) {
    const fullImport = match[0];
    const importPath = match[1];
    
    // Determine if we should use a path alias
    const shouldUseAlias = shouldUsePathAlias(filePath, importPath);
    
    // Fix the import path
    let fixedImportPath = importPath;
    
    if (shouldUseAlias) {
      fixedImportPath = convertToPathAlias(filePath, importPath);
    } else if (importPath.startsWith('.')) {
      fixedImportPath = addFileExtension(filePath, importPath);
    }
    
    // If the import path has changed, update the content
    if (fixedImportPath !== importPath) {
      const fixedImport = fullImport.replace(
        `from '${importPath}'`,
        `from '${fixedImportPath}'`
      );
      newContent = newContent.replace(fullImport, fixedImport);
      modified = true;
      importsFixes++;
    }
  }
  
  // Save the modified file
  if (modified) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    fixedFiles++;
    totalImportsFixes += importsFixes;
    console.log(`Fixed ${importsFixes} imports in ${filePath}`);
  }
});

console.log(`\nSummary:`);
console.log(`- Fixed ${totalImportsFixes} imports in ${fixedFiles} files`);
console.log(`- Processed ${files.length} files total`); 