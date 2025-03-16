#!/usr/bin/env node

/**
 * Script to fix module imports by adding file extensions to relative imports
 * and standardizing path aliases.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// File extensions to process
const extensions = ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs'];

// Path aliases from tsconfig.json
const pathAliases = {
  '@loadup/api': 'packages/api/src',
  '@loadup/database': 'packages/database/src',
  '@loadup/db': 'packages/db/src',
  '@loadup/shared': 'packages/shared/src',
  '@admin': 'apps/admin-dashboard',
  '@driver': 'apps/driver-app',
  '@': '',
  '@components': 'components',
  '@services': 'services',
  '@tests': '__tests__'
};

// Find all TypeScript and JavaScript files
const files = glob.sync('**/*.{js,jsx,ts,tsx,mjs,cjs}', {
  ignore: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/coverage/**', '**/scripts/**']
});

console.log(`Found ${files.length} files to process`);

let fixedImports = 0;
let fixedFiles = 0;

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  let newContent = content;
  let fileFixed = false;

  // Fix relative imports by adding file extensions
  const relativeImportRegex = /from\s+['"](\.[^'"]*)['"]/g;
  newContent = newContent.replace(relativeImportRegex, (match, importPath) => {
    // Skip if already has an extension
    if (extensions.some(ext => importPath.endsWith(ext))) {
      return match;
    }

    // Find the actual file
    const dir = path.dirname(file);
    const resolvedPath = path.resolve(dir, importPath);

    // Try each extension
    for (const ext of extensions) {
      const fullPath = `${resolvedPath}${ext}`;
      if (fs.existsSync(fullPath)) {
        fixedImports++;
        fileFixed = true;
        return `from '${importPath}${ext}'`;
      }
    }

    // If no file found, return original
    return match;
  });

  // Fix wildcard path aliases
  const wildcardAliasRegex = /from\s+['"](@[^/'"]*\/\*\/[^'"]*)['"]/g;
  newContent = newContent.replace(wildcardAliasRegex, (match, importPath) => {
    // Extract the alias and the rest of the path
    const parts = importPath.split('/*/');
    if (parts.length !== 2) return match;

    const alias = parts[0];
    const restPath = parts[1];

    // Find the matching alias
    for (const [aliasKey, aliasPath] of Object.entries(pathAliases)) {
      if (alias === aliasKey) {
        fixedImports++;
        fileFixed = true;
        return `from '${alias}/${restPath}'`;
      }
    }

    // If no matching alias found, return original
    return match;
  });

  // Write changes if needed
  if (fileFixed) {
    fs.writeFileSync(file, newContent, 'utf8');
    fixedFiles++;
    console.log(`Fixed imports in ${file}`);
  }
});

console.log(`Fixed ${fixedImports} imports in ${fixedFiles} files`); 