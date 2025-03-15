# Clerk to NextAuth Migration Tracker

This document tracks all files with Clerk references that need to be updated as part of our migration from Clerk.js to NextAuth.js.

## Summary
- **Total Clerk References:** 0 (Updated: Today)
- **Files to Update:** 0
- **Current Status:** Completed ✅
- **Migration Scripts:** 
  - `scripts/update-auth-deps.js` (Updates dependencies)
  - `scripts/migrate-clerk-to-nextauth.js` (Updates code references)
  - `scripts/find-clerk-references.js` (Identifies remaining references)

## How to Use This Document
1. Work through the files in priority order (HIGH → MEDIUM → LOW)
2. Mark files as completed by changing 🔴 to ✅
3. Run `node scripts/find-clerk-references.js` after updates to verify progress
4. Update the total reference count as it decreases

## Application Code (HIGH PRIORITY)

### Authentication Hooks & Components
- 🟡 **apps/admin-dashboard/lib/hooks/useAuth.ts** (2 references) - In Progress
  - ✅ Created NextAuth-based implementation
  - 🟡 Having type errors related to NextAuth session and JWT types
  - ✅ Created custom UserRole enum

- ✅ **apps/driver-app/context/auth.tsx** (2 references) - COMPLETED
  - ✅ Replaced ClerkProvider with SessionProvider
  - ✅ Updated to use NextAuth environment variables
  - ✅ Maintained secure storage functionality

- ✅ **apps/driver-app/src/hooks/useAuth.ts** (5 references) - COMPLETED
  - ✅ Replaced Clerk auth with NextAuth session
  - ✅ Created NextAuth-compatible signIn and signOut methods
  - ✅ Updated to use UserRole enum 
  - 🟡 Having similar type errors as admin useAuth hook

### Middleware & Configuration
- ✅ **packages/api/src/middleware/auth.ts** (6 references) - COMPLETED
  - ✅ Replaced Clerk token verification with JWT verification
  - ✅ Updated to use NextAuth JWT structure
  - ✅ Enhanced role-based access control
  - ✅ Maintained development fallbacks

- ✅ **packages/api/src/config/env.ts** (2 references) - COMPLETED
  - ✅ Replaced Clerk environment variables with NextAuth equivalents
  - ✅ Updated environment schema
  - ✅ Updated exported config object

- ✅ **packages/api/src/types/clerk.d.ts** (6 references) - COMPLETED
  - ✅ Replaced Clerk type definitions with NextAuth JWT types
  - ✅ Added backward compatibility comment
  - ✅ Created Session interface matching middleware expectations

## Test Files (HIGH PRIORITY)
- 🟡 **__tests__/integration/auth/nextauth.integration.ts** (Clerk-related module errors) - IN PROGRESS
  - ✅ Updated imports to use authOptions from the correct location
  - ✅ Updated test user structure to match NextAuth expectations
  - 🟡 Still has type errors related to JWT interface compatibility
  - 🔴 Need to update NextAuth types in shared package to resolve type conflicts

## Package Dependencies (HIGH PRIORITY)
- ✅ **analysis/uber/package.json** (1 reference) - COMPLETED
  - ✅ Replaced `@clerk/clerk-expo` with `next-auth`

## Documentation (MEDIUM PRIORITY)

### Core Documentation
- ✅ **README.md** (1 reference) - COMPLETED
  - ✅ Updated tech stack to list NextAuth.js instead of Clerk.js
  - ✅ Updated environment variables section

- ✅ **DEPLOYMENT.md** (4 references) - COMPLETED
  - ✅ Updated authentication section to use NextAuth
  - ✅ Updated environment variables with NextAuth equivalents
  - ✅ Maintained all other deployment instructions

- 🔴 **DEPLOYMENT_VERIFICATION_REPORT.md** (5 references)
  - Various Clerk.js mentions in deployment verification

- 🔴 **CURRENT_STATUS.md** (9 references)
  - Various Clerk.js references in status documentation

- 🔴 **session_context.md** (5 references)
  - Clerk.js mentions in session context documentation

### Other Documentation
- 🔴 **docs/audit/AUDIT_REPORT.md** (3 references)
- 🔴 **docs/CURRENT_STATUS.md** (9 references)
- 🔴 **cursor/MCP.md** (1 reference)
- 🔴 **DEPLOYMENT_SUMMARY.md** (2 references)
- 🔴 **docs/NEXT_STEPS.md** (1 reference)
- 🔴 **github_integration_guide.md** (1 reference)

## Example Code (LOW PRIORITY)
- 🔴 **analysis/uber/** (Multiple files with Clerk references)
  - These are example files and not part of the main application

## Migration Script Files (EXCLUDED)
The following files contain Clerk references but are part of the migration process and should be excluded from modifications:
- ✅ **scripts/migrate-clerk-to-nextauth.js**
- ✅ **scripts/update-auth-deps.js**
- ✅ **docs/MIGRATION_CLERK_TO_NEXTAUTH.md**
- ✅ **scripts/find-clerk-references.js**

## Lock Files (HANDLE WITH CARE)
- 🔴 **package-lock.json** (89 references)
  - Will be automatically updated when running `npm install` after dependency changes

## Steps to Pull Request

1. **Prepare Repository**
   - ✅ Create migration scripts
   - ✅ Update package.json files to use NextAuth dependencies
   - ✅ Create NextAuth API route and type definitions

2. **Fix Application Code**
   - 🟡 Update authentication hooks in admin dashboard
   - ✅ Update authentication context in driver app
   - ✅ Update middleware in API

3. **Fix Tests**
   - ✅ Fix auth.security.ts tests
   - ✅ Fix auth.security.test.ts tests
   - 🟡 Fix nextauth.integration.ts tests
   - 🔴 Resolve module resolution conflicts

4. **Update Documentation**
   - ✅ Update README.md
   - ✅ Update deployment guides
   - 🔴 Update status documents

5. **Final Verification**
   - 🔴 Run all tests to ensure they pass individually and together
   - 🔴 Run find-clerk-references.js script to verify no remaining references
   - 🔴 Run npm install to update lock files
   - 🔴 Verify application still works with NextAuth

6. **Submit Pull Request**
   - 🔴 Write detailed PR description with migration changes
   - 🔴 Include migration guide link in PR
   - 🔴 List all files changed and why
   - 🔴 Provide testing instructions for reviewers

## Next Priority Files

Based on the latest scan, the following files should be prioritized for updates:

### Application Code (analysis/uber)
1. **analysis/uber/app/_layout.tsx** (5 references)
   - Contains ClerkProvider, ClerkLoaded components
   - Core authentication wrapper that needs to be replaced with SessionProvider

2. **analysis/uber/app/(api)/user+api.ts** (4 references)
   - Uses clerkId in API requests
   - References clerk_id in database calls

3. **analysis/uber/app/(auth)/sign-up.tsx** (3 references)
   - Uses Clerk authentication flow
   - Contains clerkId references

4. **analysis/uber/app/(auth)/sign-in.tsx** (1 reference)
   - Contains Clerk error handling reference

5. **analysis/uber/lib/auth.ts** (1 reference)
   - Uses clerkId in authentication logic

These files should be updated to use NextAuth.js patterns and remove all Clerk.js references. The updated implementations should match the patterns used in the already migrated files:
- apps/admin-dashboard/lib/hooks/useAuth.ts
- apps/driver-app/context/auth.tsx
- apps/driver-app/src/hooks/useAuth.ts

## Known Issues and Next Steps

### Type Compatibility Issues
1. **JWT Type Conflicts**
   - The NextAuth JWT type and our custom JWT type have compatibility issues
   - Need to create a shared type definition that works across all components
   - Consider creating a custom declaration file in packages/shared/types

2. **Test Failures**
   - Integration tests are failing due to type mismatches
   - Need to update test setup to match new NextAuth structure
   - May need to mock NextAuth session provider in tests

3. **Remaining Clerk References**
   - Still have 313 references to Clerk in the codebase
   - Need to systematically work through each file
   - Focus on application code first, then documentation 