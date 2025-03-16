# Module System in LoadUp

This document explains the module system approach used in the LoadUp project to ensure consistent code organization and prevent import/export issues.

## Module System Overview

LoadUp uses **ES Modules** as the primary module system. This means:

- We use `import` and `export` statements instead of `require` and `module.exports`
- File extensions are required in relative imports
- The `"type": "module"` is set in package.json

## File Extensions

### JavaScript Files

| Extension | Purpose | Module System |
|-----------|---------|---------------|
| `.js` | Standard JavaScript files | ES Modules |
| `.mjs` | Explicitly ES Modules | ES Modules |
| `.cjs` | Explicitly CommonJS | CommonJS |

### TypeScript Files

| Extension | Purpose | Module System |
|-----------|---------|---------------|
| `.ts` | Standard TypeScript files | ES Modules |
| `.mts` | Explicitly ES Modules | ES Modules |
| `.cts` | Explicitly CommonJS | CommonJS |

## Import Rules

### Correct Import Syntax

```javascript
// Importing from node modules (no extension needed)
import React from 'react';
import { useState } from 'react';

// Importing from local files (extension required)
import { Button } from './Button.js';
import { formatDate } from '../utils/date.js';

// Importing using path aliases (no extension needed)
import { ShipmentService } from '@loadup/api/services/shipment';
import { DashboardLayout } from '@admin/components/layout';
```

### Incorrect Import Syntax

```javascript
// Missing extension in local import
import { Button } from './Button'; // ❌ Missing .js extension

// Using require in ES module
const { formatDate } = require('../utils/date.js'); // ❌ Don't mix module systems

// Using relative path when alias is available
import { ShipmentService } from '../../packages/api/src/services/shipment.js'; // ❌ Use path alias instead
```

## Export Rules

### Correct Export Syntax

```javascript
// Named exports
export const formatDate = (date) => { /* ... */ };
export function calculateTotal(items) { /* ... */ }

// Default export
export default function Button({ children }) { /* ... */ }

// Re-exporting
export * from './utils.js';
export { default as Button } from './Button.js';
```

### Incorrect Export Syntax

```javascript
// CommonJS exports in ES module
module.exports = { formatDate }; // ❌ Don't use CommonJS exports in ES modules

// Missing extension in re-export
export * from './utils'; // ❌ Missing .js extension
```

## Configuration Files

Some configuration files must use CommonJS format due to tool limitations:

- `.eslintrc.cjs` - ESLint configuration
- `jest.config.cjs` - Jest configuration (if not using .mjs)
- `babel.config.cjs` - Babel configuration

## Tools for Module System Consistency

We have several tools to help maintain module system consistency:

1. **Fix Imports**
   ```bash
   npm run fix:imports
   ```
   This automatically fixes import issues:
   - Adds missing file extensions to relative imports
   - Converts relative imports to use path aliases where appropriate
   - Standardizes import paths

2. **Validate Imports**
   ```bash
   npm run validate:imports
   ```
   This checks for import issues without modifying files.

3. **Update Configuration**
   ```bash
   npm run update:config
   ```
   This updates all configuration files with the centralized path alias configuration.

4. **Pre-commit Hooks**
   We use husky and lint-staged to validate imports before commits.

## Best Practices

1. **Be consistent** - Use ES Modules throughout the codebase
2. **Always include extensions** in relative imports
3. **Use path aliases** for cross-package imports
4. **Don't mix module systems** in the same file
5. **Use the correct file extension** for your module system
6. **Run the consistency tools** regularly to catch issues

## Troubleshooting

### Common Errors

1. **"Cannot use import statement outside a module"**
   - Make sure the file is being treated as an ES module
   - Check that `"type": "module"` is in package.json

2. **"require() of ES Module not supported"**
   - You're trying to use `require()` to import an ES module
   - Convert to `import` or rename the file to `.cjs`

3. **"Cannot find module"**
   - Check that the import path is correct
   - Make sure file extensions are included in relative imports
   - Verify that the module exists at the specified path

4. **"Unexpected token 'export'"**
   - The file is being treated as CommonJS but contains ES module syntax
   - Make sure the file extension is correct
   - Check the module context of the file 

## Standardizing Imports and Path Aliases

To ensure consistent imports across the codebase, we follow these rules:

### 1. File Extensions in Imports

Since we're using `"moduleResolution": "NodeNext"` in TypeScript, we must follow these rules:

- **Always include file extensions in relative imports**
  ```typescript
  // Correct
  import { Button } from './Button.js';
  import { formatDate } from '../utils/date.js';
  
  // Incorrect
  import { Button } from './Button';
  import { formatDate } from '../utils/date';
  ```

- **Never include file extensions in path alias imports**
  ```typescript
  // Correct
  import { ShipmentService } from '@services/parsers/ShipmentParser';
  
  // Incorrect
  import { ShipmentService } from '@services/parsers/ShipmentParser.js';
  ```

### 2. Path Alias Standardization

- **Use path aliases for imports that cross package boundaries**
  ```typescript
  // Correct
  import { ShipmentParser } from '@loadup/api/services/parsers/ShipmentParser';
  
  // Incorrect
  import { ShipmentParser } from '../../packages/api/src/services/parsers/ShipmentParser.js';
  ```

- **Use path aliases for imports that go up multiple directories**
  ```typescript
  // Correct
  import { Button } from '@components/ui/Button';
  
  // Incorrect
  import { Button } from '../../../components/ui/Button.js';
  ```

- **Use relative imports for files in the same directory or adjacent directories**
  ```typescript
  // Correct
  import { formatDate } from './utils.js';
  import { validateAddress } from '../utils/address.js';
  ```

### 3. Centralized Configuration

All path aliases are defined in a single source of truth:

- `scripts/path-aliases.js` - The central configuration file
- `scripts/path-aliases.mjs` - ES Module version for Jest

This ensures consistency across all tools and environments:

- TypeScript compilation
- Jest tests
- ESLint validation
- Webpack bundling
- Next.js configuration 