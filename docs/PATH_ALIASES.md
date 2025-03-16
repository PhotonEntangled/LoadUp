# Path Aliases in LoadUp

This document explains the path alias system used throughout the LoadUp project to ensure consistent imports across the codebase.

## Centralized Configuration

LoadUp uses a centralized path alias configuration to ensure consistency across all tools and environments. The single source of truth for path aliases is the `scripts/path-aliases.js` file.

This centralized approach ensures that:
- TypeScript compilation uses the correct path aliases
- Jest tests resolve imports correctly
- ESLint enforces consistent import patterns
- All tools and scripts use the same path alias definitions

## Available Path Aliases

### Package Aliases

| Alias | Path | Description |
|-------|------|-------------|
| `@loadup/api` | `packages/api/src` | API package root |
| `@loadup/api/*` | `packages/api/src/*` | API package files |
| `@loadup/database` | `packages/database/src` | Database package root |
| `@loadup/database/*` | `packages/database/src/*` | Database package files |
| `@loadup/db` | `packages/db/src` | DB package root |
| `@loadup/db/*` | `packages/db/src/*` | DB package files |
| `@loadup/shared` | `packages/shared/src` | Shared package root |
| `@loadup/shared/*` | `packages/shared/src/*` | Shared package files |

### App Aliases

| Alias | Path | Description |
|-------|------|-------------|
| `@admin/*` | `apps/admin-dashboard/*` | Admin dashboard files |
| `@admin-app` | `apps/admin-dashboard` | Admin dashboard root |
| `@driver/*` | `apps/driver-app/*` | Driver app files |
| `@driver-app` | `apps/driver-app` | Driver app root |

### Root Level Aliases

| Alias | Path | Description |
|-------|------|-------------|
| `@/*` | `/*` | Project root files |
| `@components/*` | `components/*` | Shared components |
| `@services/*` | `services/*` | Shared services |
| `@tests/*` | `__tests__/*` | Test files |

## Import Rules

### When to Use Path Aliases

1. **Always use path aliases** for imports that cross package boundaries
2. **Always use path aliases** for imports that go up multiple directories
3. **Use relative imports** for files in the same directory or adjacent directories

### File Extensions

1. **Always include file extensions** in relative imports
2. **Never include file extensions** in path alias imports

### Examples

```typescript
// Good: Path alias for cross-package import
import { ShipmentService } from '@loadup/api/services/shipment';

// Good: Path alias for import going up multiple directories
import { Button } from '@components/ui/Button';

// Good: Relative import with file extension
import { formatDate } from './utils.js';
import { validateAddress } from '../utils/address.js';

// Bad: Relative import without file extension
import { formatDate } from './utils';

// Bad: Relative import going up multiple directories
import { Button } from '../../../components/ui/Button.js';

// Bad: Path alias with file extension
import { ShipmentService } from '@loadup/api/services/shipment.js';
```

## Tools and Scripts

We provide several tools to help maintain consistent imports:

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

## Configuration Files

The path aliases are defined in the following files:

1. `scripts/path-aliases.js` - The single source of truth
2. `tsconfig.json` - For TypeScript compilation
3. `jest.config.mjs` - For Jest tests
4. `.eslintrc.cjs` - For ESLint validation

## Adding New Path Aliases

To add a new path alias:

1. Update `scripts/path-aliases.js` with the new alias
2. Run `npm run update:config` to update all configuration files
3. Run `npm run fix:imports` to update imports in the codebase 