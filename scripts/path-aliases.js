/**
 * path-aliases.js
 * 
 * CommonJS version of path aliases configuration.
 * This is the single source of truth for path aliases in the project.
 */

const path = require('path');

// Base directory for the monorepo
const baseDir = path.resolve(__dirname, '..');

// Package aliases
const packageAliases = {
  '@loadup/api': `${baseDir}/packages/api/src`,
  '@loadup/api/*': `${baseDir}/packages/api/src/*`,
  '@loadup/database': `${baseDir}/packages/database/src`,
  '@loadup/database/*': `${baseDir}/packages/database/src/*`,
  '@loadup/db': `${baseDir}/packages/db/src`,
  '@loadup/db/*': `${baseDir}/packages/db/src/*`,
  '@loadup/shared': `${baseDir}/packages/shared/src`,
  '@loadup/shared/*': `${baseDir}/packages/shared/src/*`,
};

// App aliases
const appAliases = {
  '@admin/*': `${baseDir}/apps/admin-dashboard/*`,
  '@admin-app': `${baseDir}/apps/admin-dashboard`,
  '@driver/*': `${baseDir}/apps/driver-app/*`,
  '@driver-app': `${baseDir}/apps/driver-app`,
};

// Root level aliases
const rootAliases = {
  '@/*': `${baseDir}/*`,
  '@components/*': `${baseDir}/components/*`,
  '@services/*': `${baseDir}/services/*`,
  '@tests/*': `${baseDir}/__tests__/*`,
};

// Combine all aliases
const allAliases = {
  ...packageAliases,
  ...appAliases,
  ...rootAliases,
};

/**
 * Get path mappings for tsconfig.json
 * Format: { "@alias/*": ["path/*"] }
 */
function getTsConfigPathMappings() {
  const pathMappings = {};
  
  Object.entries(allAliases).forEach(([alias, path]) => {
    // Convert string path to array as required by tsconfig
    pathMappings[alias] = [path];
  });
  
  return pathMappings;
}

/**
 * Get module name mappings for Jest
 * Format: { "^@alias/(.*)$": "<rootDir>/path/$1" }
 */
function getJestModuleNameMapper() {
  const moduleNameMapper = {};
  
  Object.entries(allAliases).forEach(([alias, path]) => {
    // Convert path format to Jest's format
    const jestPath = path
      .replace(`${baseDir}/`, '<rootDir>/')
      .replace('/*', '/$1');
    
    // Convert alias format to Jest's regex format
    const jestAlias = `^${alias.replace('/*', '/(.*)$')}`;
    
    moduleNameMapper[jestAlias] = jestPath;
  });
  
  // Add special mapping for file extensions in relative imports
  moduleNameMapper['^(\\.{1,2}/.*)\\.js$'] = '$1.js';
  
  return moduleNameMapper;
}

/**
 * Get ESLint import resolver settings
 */
function getESLintImportResolverSettings() {
  return {
    'import/resolver': {
      typescript: {
        project: './tsconfig.json',
      },
    },
  };
}

/**
 * Get path mappings for webpack
 */
function getWebpackPathMappings() {
  const pathMappings = {};
  
  Object.entries(allAliases).forEach(([alias, path]) => {
    // Convert to webpack format
    const webpackAlias = alias.replace('/*', '');
    const webpackPath = path.replace('/*', '');
    
    pathMappings[webpackAlias] = webpackPath;
  });
  
  return pathMappings;
}

module.exports = {
  allAliases,
  getTsConfigPathMappings,
  getJestModuleNameMapper,
  getESLintImportResolverSettings,
  getWebpackPathMappings,
}; 