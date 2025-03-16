#!/usr/bin/env node

/**
 * fix-pg-imports.js
 * 
 * This script fixes pg module imports across the codebase by converting
 * direct named imports to the recommended approach for ES Modules.
 * 
 * Example:
 * - Before: import { Pool } from 'pg';
 * - After:  import pg from 'pg';
 *           const { Pool } = pg;
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import glob from 'glob';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Find all TypeScript and JavaScript files
const files = glob.sync('**/*.{ts,tsx,js,jsx,mjs}', {
  cwd: ROOT_DIR,
  ignore: [
    '**/node_modules/**', 
    '**/dist/**', 
    '**/build/**', 
    '**/.next/**',
    '**/coverage/**',
    '**/*.cjs', // Skip CommonJS files
    '**/fix-pg-imports.js' // Skip this script
  ],
  absolute: true,
});

console.log(`Found ${files.length} files to check for pg imports.`);

// Regular expression to match direct pg imports
const PG_IMPORT_REGEX = /import\s+{\s*([^}]+)\s*}\s+from\s+['"]pg['"];?/g;

// Process each file
let modifiedFiles = 0;
let totalImportsFixed = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Check if the file imports from pg
  if (content.includes('from \'pg\'') || content.includes('from "pg"')) {
    let modified = false;
    let importsFixed = 0;
    
    // Replace direct imports with the recommended approach
    content = content.replace(PG_IMPORT_REGEX, (match, importNames) => {
      modified = true;
      importsFixed++;
      
      // Clean up import names (remove whitespace, handle multiple imports)
      const names = importNames.split(',').map(name => name.trim());
      
      // Create the new import statement
      return `import pg from 'pg';\nconst { ${names.join(', ')} } = pg;`;
    });
    
    // Write the file if changes were made
    if (modified) {
      fs.writeFileSync(file, content, 'utf8');
      console.log(`Updated ${importsFixed} pg import(s) in: ${path.relative(ROOT_DIR, file)}`);
      modifiedFiles++;
      totalImportsFixed += importsFixed;
    }
  }
}

console.log('\nSummary:');
console.log(`- Checked ${files.length} files`);
console.log(`- Modified ${modifiedFiles} files`);
console.log(`- Fixed ${totalImportsFixed} pg imports`);

if (totalImportsFixed > 0) {
  console.log('\nSuccess! Fixed pg imports to use the recommended approach for ES Modules.');
  console.log('This should help resolve module resolution issues with the pg package.');
} else {
  console.log('\nNo pg imports needed fixing. All imports already use the recommended approach.');
} 