/**
 * Script to update imports in the admin-dashboard package to include .js extensions for ESM compatibility
 * 
 * Usage: node scripts/fix-imports.js
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const stat = promisify(fs.stat);

// Directories to process
const directories = [
  'apps/admin-dashboard/app',
  'apps/admin-dashboard/components',
  'apps/admin-dashboard/lib'
];

// File extensions to process
const extensions = ['.ts', '.tsx', '.js', '.jsx'];

// Regex to match relative imports without extensions
const importRegex = /import\s+(?:(?:{[^}]*}|\*\s+as\s+[^,]+|[^,{}\s*]+)(?:\s*,\s*(?:{[^}]*}|\*\s+as\s+[^,]+|[^,{}\s*]+))*\s*from\s+['"])(\.{1,2}\/[^'"]*?)(['"])/g;
const dynamicImportRegex = /import\s*\(\s*['"](\.[^'"]*)['"]\s*\)/g;

// Function to recursively get all files in a directory
async function getFiles(dir) {
  const subdirs = await readdir(dir);
  const files = await Promise.all(subdirs.map(async (subdir) => {
    const res = path.resolve(dir, subdir);
    return (await stat(res)).isDirectory() ? getFiles(res) : res;
  }));
  return files.flat();
}

// Function to update imports in a file
async function updateImports(filePath) {
  // Only process files with the specified extensions
  if (!extensions.some(ext => filePath.endsWith(ext))) {
    return;
  }

  console.log(`Processing ${filePath}`);
  
  try {
    const content = await readFile(filePath, 'utf8');
    
    // Update static imports
    let updatedContent = content.replace(importRegex, (match, importPath, quote) => {
      // Skip if the import already has an extension
      if (importPath.endsWith('.js') || importPath.endsWith('.jsx') || importPath.endsWith('.ts') || importPath.endsWith('.tsx')) {
        return match;
      }
      
      // Skip node_modules imports
      if (importPath.includes('node_modules')) {
        return match;
      }
      
      // Skip package imports (not relative)
      if (!importPath.startsWith('.')) {
        return match;
      }
      
      return `import${match.substring(6, match.indexOf(importPath))}${importPath}.js${quote}`;
    });
    
    // Update dynamic imports
    updatedContent = updatedContent.replace(dynamicImportRegex, (match, importPath) => {
      // Skip if the import already has an extension
      if (importPath.endsWith('.js') || importPath.endsWith('.jsx') || importPath.endsWith('.ts') || importPath.endsWith('.tsx')) {
        return match;
      }
      
      // Skip node_modules imports
      if (importPath.includes('node_modules')) {
        return match;
      }
      
      // Skip package imports (not relative)
      if (!importPath.startsWith('.')) {
        return match;
      }
      
      return `import('${importPath}.js')`;
    });
    
    if (content !== updatedContent) {
      await writeFile(filePath, updatedContent, 'utf8');
      console.log(`Updated imports in ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

// Main function
async function main() {
  try {
    // Process each directory
    for (const dir of directories) {
      const files = await getFiles(dir);
      
      // Update imports in each file
      for (const file of files) {
        await updateImports(file);
      }
    }
    
    console.log('Import update complete!');
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the script
main(); 