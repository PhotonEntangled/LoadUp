#!/usr/bin/env node

/**
 * fix-drizzle-imports.js
 * 
 * This script fixes drizzle-orm type compatibility issues in TypeScript files by:
 * 1. Updating import statements to use a consistent import pattern
 * 2. Adding type assertions where needed for compatibility between package versions
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import glob from 'glob';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Find all TypeScript files
const files = glob.sync('packages/**/*.ts', {
  cwd: ROOT_DIR,
  ignore: [
    '**/node_modules/**', 
    '**/dist/**', 
    '**/build/**'
  ],
  absolute: true,
});

console.log(`Found ${files.length} TypeScript files to check.`);

// Patterns to search for and fix
const EQ_IMPORT_PATTERN = /import\s+{\s*eq\s*}.*from\s+['"]drizzle-orm['"]/g;
const DRIZZLE_IMPORT_PATTERN = /import\s+{\s*drizzle\s*}.*from\s+['"]drizzle-orm\/node-postgres['"]/g;
const EQ_USAGE_PATTERN = /eq\s*\(([^,]+),\s*([^)]+)\)/g;
const TABLE_CAST_PATTERN = /(shipments|users|drivers)\s+as\s+unknown\s+as\s+PgTable<any>/g;

// Create a db-utils.ts file if it doesn't exist
const dbUtilsPath = path.join(ROOT_DIR, 'packages', 'database', 'src', 'db-utils.ts');
if (!fs.existsSync(dbUtilsPath)) {
  const dbUtilsContent = `
import { eq as drizzleEq } from 'drizzle-orm';

// Re-export drizzle functions to ensure consistent imports
export const eq = drizzleEq;
`;
  fs.writeFileSync(dbUtilsPath, dbUtilsContent, 'utf8');
  console.log(`Created packages/database/src/db-utils.ts`);
}

// Process each file
let modifiedFiles = 0;
let fixedImports = 0;
let fixedCasts = 0;
let fixedEqCalls = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  let modified = false;

  // Determine the right relative path to import from
  const relativePath = path.relative(path.dirname(file), path.join(ROOT_DIR, 'packages', 'database', 'src')).replace(/\\/g, '/');
  const dbUtilsImport = `${relativePath}/db-utils.js`;
  const drizzleImport = `${relativePath}/drizzle.js`;

  // Only fix API and database package files that are not the db-utils.ts file itself
  if (
    !file.includes('packages/database/src/db-utils.ts') && 
    (file.includes('packages/api/') || file.includes('packages/database/'))
  ) {
    // Fix eq imports
    if (content.match(EQ_IMPORT_PATTERN)) {
      content = content.replace(
        EQ_IMPORT_PATTERN,
        `import { eq } from 'drizzle-orm'`
      );
      fixedImports++;
      modified = true;
    }

    // Fix drizzle imports
    if (content.match(DRIZZLE_IMPORT_PATTERN)) {
      content = content.replace(
        DRIZZLE_IMPORT_PATTERN,
        `import { drizzle } from 'drizzle-orm/node-postgres'`
      );
      fixedImports++;
      modified = true;
    }

    // Fix eq usage by adding a type assertion
    let eqMatch;
    while ((eqMatch = EQ_USAGE_PATTERN.exec(content)) !== null) {
      const fullMatch = eqMatch[0];
      const col = eqMatch[1].trim();
      const val = eqMatch[2].trim();
      
      // Only fix if it's a database column reference (like shipments.id, users.id, etc.)
      if (col.includes('.')) {
        const newEqCall = `eq(${col} as any, ${val})`;
        content = content.replace(fullMatch, newEqCall);
        fixedEqCalls++;
        modified = true;
      }
    }

    // Fix table casts
    if (content.match(TABLE_CAST_PATTERN)) {
      content = content.replace(
        TABLE_CAST_PATTERN,
        (match) => `${match.split(' as ')[0]} as any`
      );
      fixedCasts++;
      modified = true;
    }

    // Write the file if modified
    if (modified) {
      fs.writeFileSync(file, content, 'utf8');
      console.log(`Updated ${path.relative(ROOT_DIR, file)}`);
      modifiedFiles++;
    }
  }
}

console.log('\nSummary:');
console.log(`- Checked ${files.length} files`);
console.log(`- Modified ${modifiedFiles} files`);
console.log(`- Fixed ${fixedImports} imports`);
console.log(`- Fixed ${fixedCasts} table casts`);
console.log(`- Fixed ${fixedEqCalls} eq() calls`);

if (modifiedFiles > 0) {
  console.log('\nSuccess! Fixed drizzle-orm type compatibility issues.');
  console.log('Remember to build the database package before running the API build.');
} else {
  console.log('\nNo issues found that needed fixing.');
} 