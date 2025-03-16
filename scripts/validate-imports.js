/**
 * validate-imports.js
 * 
 * This script validates imports across the codebase to ensure they follow the established rules.
 * It checks for:
 * 1. Unresolved path aliases
 * 2. Missing file extensions
 * 3. Incorrect import order
 * 4. Multiple exports
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { allAliases } = require('./path-aliases');

// Configuration
const config = {
  extensions: ['.js', '.jsx', '.ts', '.tsx'],
  ignoreDirs: ['node_modules', 'dist', 'build', '.next', '.expo'],
  importOrder: [
    '^react',
    '^@loadup/(.*)$',
    '^@(admin|driver)(.*)$',
    '^@/(.*)$',
    '^@components/(.*)$',
    '^@services/(.*)$',
    '^@tests/(.*)$',
    '^[./]',
  ],
};

// Get all TypeScript and JavaScript files
const getFiles = () => {
  const patterns = config.extensions.map(ext => `**/*${ext}`);
  const ignorePatterns = config.ignoreDirs.map(dir => `**/${dir}/**`);
  
  return glob.sync(patterns, {
    ignore: ignorePatterns,
    cwd: path.resolve(__dirname, '..'),
    absolute: true,
  });
};

// Check for unresolved path aliases
const checkUnresolvedPathAliases = (content, filePath) => {
  const issues = [];
  const importRegex = /import\s+(?:[\w\s{},*]+\s+from\s+)?['"]([^'"]+)['"]/g;
  let match;
  
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    
    // Skip node modules and relative imports
    if (importPath.startsWith('.') || !importPath.startsWith('@')) {
      continue;
    }
    
    // Check if the import path matches any of our aliases
    const isValidAlias = Object.keys(allAliases).some(alias => {
      const aliasWithoutWildcard = alias.replace('/*', '');
      return importPath === aliasWithoutWildcard || importPath.startsWith(`${aliasWithoutWildcard}/`);
    });
    
    if (!isValidAlias) {
      issues.push(`Unresolved path alias: ${importPath}`);
    }
  }
  
  return issues;
};

// Check for missing file extensions
const checkMissingFileExtensions = (content, filePath) => {
  const issues = [];
  const importRegex = /import\s+(?:[\w\s{},*]+\s+from\s+)?['"]([^'"]+)['"]/g;
  let match;
  
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    
    // Skip node modules and non-relative imports
    if (!importPath.startsWith('.')) {
      continue;
    }
    
    // Check if the import has a file extension
    const hasExtension = config.extensions.some(ext => importPath.endsWith(ext));
    
    if (!hasExtension) {
      issues.push(`Missing file extension: ${importPath}`);
    }
  }
  
  return issues;
};

// Check for incorrect import order
const checkImportOrder = (content, filePath) => {
  const issues = [];
  const importLines = [];
  
  // Extract all import lines
  const lines = content.split('\n');
  let currentImport = '';
  let inMultilineImport = false;
  
  for (const line of lines) {
    if (line.trim().startsWith('import ')) {
      if (line.includes(';')) {
        // Single-line import
        importLines.push(line.trim());
      } else {
        // Start of multi-line import
        currentImport = line.trim();
        inMultilineImport = true;
      }
    } else if (inMultilineImport) {
      currentImport += ' ' + line.trim();
      
      if (line.includes(';')) {
        // End of multi-line import
        importLines.push(currentImport);
        inMultilineImport = false;
        currentImport = '';
      }
    }
  }
  
  // Check import order
  for (let i = 1; i < importLines.length; i++) {
    const prevImport = importLines[i - 1];
    const currentImport = importLines[i];
    
    const prevImportPath = prevImport.match(/from\s+['"]([^'"]+)['"]/)?.[1];
    const currentImportPath = currentImport.match(/from\s+['"]([^'"]+)['"]/)?.[1];
    
    if (!prevImportPath || !currentImportPath) {
      continue;
    }
    
    // Get the group index for each import
    const getPriority = (importPath) => {
      for (let j = 0; j < config.importOrder.length; j++) {
        const pattern = new RegExp(config.importOrder[j]);
        if (pattern.test(importPath)) {
          return j;
        }
      }
      return config.importOrder.length;
    };
    
    const prevPriority = getPriority(prevImportPath);
    const currentPriority = getPriority(currentImportPath);
    
    if (currentPriority < prevPriority) {
      issues.push(`Incorrect import order: ${currentImportPath} should come before ${prevImportPath}`);
    }
  }
  
  return issues;
};

// Check for multiple exports
const checkMultipleExports = (content, filePath) => {
  const issues = [];
  const exportDefaultCount = (content.match(/export\s+default/g) || []).length;
  
  if (exportDefaultCount > 1) {
    issues.push(`Multiple default exports found (${exportDefaultCount})`);
  }
  
  return issues;
};

// Main validation function
const validateFile = (filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativeFilePath = path.relative(path.resolve(__dirname, '..'), filePath);
    
    const issues = [
      ...checkUnresolvedPathAliases(content, filePath),
      ...checkMissingFileExtensions(content, filePath),
      ...checkImportOrder(content, filePath),
      ...checkMultipleExports(content, filePath),
    ];
    
    if (issues.length > 0) {
      console.log(`\n${relativeFilePath}:`);
      issues.forEach(issue => console.log(`  - ${issue}`));
      return issues.length;
    }
    
    return 0;
  } catch (error) {
    console.error(`Error validating ${filePath}:`, error);
    return 1;
  }
};

// Run validation on all files
const runValidation = () => {
  const files = getFiles();
  let totalIssues = 0;
  
  console.log(`Validating imports in ${files.length} files...`);
  
  files.forEach(file => {
    totalIssues += validateFile(file);
  });
  
  if (totalIssues === 0) {
    console.log('\n✅ No import issues found!');
    return 0;
  } else {
    console.log(`\n❌ Found ${totalIssues} import issues.`);
    return 1;
  }
};

// Run the validation if this script is executed directly
if (require.main === module) {
  process.exit(runValidation());
}

module.exports = {
  validateFile,
  runValidation,
};
