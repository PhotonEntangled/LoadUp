#!/usr/bin/env node

/**
 * Script to find Clerk references in code files
 * This script ignores documentation files and other non-code references
 * to provide a more accurate count of Clerk usage in actual code.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Files and directories to exclude
const EXCLUDED_DIRS = [
  'node_modules',
  '.git',
  '.next',
  'dist',
  'build',
  'coverage',
  'scripts', // Exclude migration scripts
];

const EXCLUDED_FILES = [
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
];

// File extensions to include (code files only)
const CODE_EXTENSIONS = [
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
];

// Patterns to ignore (e.g., comments about migration, etc.)
const IGNORE_PATTERNS = [
  'migrate.*clerk.*to.*nextauth',
  'clerk.*reference',
  'clerk.*migration',
  'remove.*clerk',
  'replacing.*clerk',
];

function shouldProcessFile(filePath) {
  // Skip excluded directories
  if (EXCLUDED_DIRS.some(dir => filePath.includes(`/${dir}/`))) {
    return false;
  }
  
  // Skip excluded files
  if (EXCLUDED_FILES.some(file => filePath.endsWith(file))) {
    return false;
  }
  
  // Skip markdown files
  if (filePath.endsWith('.md')) {
    return false;
  }
  
  // Only include code files
  const ext = path.extname(filePath);
  return CODE_EXTENSIONS.includes(ext);
}

function containsIgnorePattern(line) {
  return IGNORE_PATTERNS.some(pattern => {
    const regex = new RegExp(pattern, 'i');
    return regex.test(line);
  });
}

function findClerkReferences() {
  try {
    // Find all files in the project (excluding node_modules and .git)
    const result = execSync('git ls-files', { encoding: 'utf-8' });
    const files = result.split('\n').filter(Boolean);
    
    let totalReferences = 0;
    const fileReferences = [];
    
    // Process each file
    for (const file of files) {
      if (!shouldProcessFile(file)) {
        continue;
      }
      
      try {
        const content = fs.readFileSync(file, 'utf-8');
        const lines = content.split('\n');
        
        let fileRefCount = 0;
        
        // Count Clerk references in each line
        for (const line of lines) {
          if (line.includes('clerk') || line.includes('Clerk')) {
            // Skip lines with ignore patterns
            if (!containsIgnorePattern(line)) {
              fileRefCount++;
            }
          }
        }
        
        if (fileRefCount > 0) {
          fileReferences.push({
            file,
            count: fileRefCount,
          });
          totalReferences += fileRefCount;
        }
      } catch (err) {
        console.error(`Error reading file ${file}:`, err.message);
      }
    }
    
    // Sort by reference count (descending)
    fileReferences.sort((a, b) => b.count - a.count);
    
    // Print results
    console.log(`\nTotal Clerk references in code files: ${totalReferences}\n`);
    console.log('Files with Clerk references:');
    console.log('-----------------------------');
    
    fileReferences.forEach(({ file, count }) => {
      console.log(`${file}: ${count} references`);
    });
    
    // Return the total count for programmatic use
    return {
      totalReferences,
      fileReferences,
    };
  } catch (err) {
    console.error('Error finding Clerk references:', err.message);
    return { totalReferences: 0, fileReferences: [] };
  }
}

// Run the function if this script is executed directly
findClerkReferences();

export default findClerkReferences; 