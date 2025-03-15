# Migration from Clerk.js to NextAuth.js

This document outlines the migration process from Clerk.js to NextAuth.js in the LoadUp project.

## Overview

We've migrated our authentication system from Clerk.js to NextAuth.js for the following reasons:

1. Better integration with our database schema using Drizzle ORM
2. More control over the authentication flow
3. Simpler server-side authentication with less overhead
4. Improved type safety with custom user roles
5. Simplified deployment without external service dependencies

## Migration Steps Completed

### 1. NextAuth API Route Setup

Created a NextAuth API route in `apps/admin-dashboard/app/api/auth/[...nextauth]/route.ts` with:

- JWT authentication strategy
- Credentials provider for email/password login
- Custom type definitions for our user schema
- Database integration with Drizzle

### 2. Type Definitions

Created extended type definitions in `packages/shared/src/types/next-auth.d.ts` to support our custom user fields:

```typescript
import { DefaultSession, DefaultUser } from "next-auth";
import { USER_ROLE_ENUM } from "@loadup/database/schema";

// Define the type for our custom user roles
type UserRole = typeof USER_ROLE_ENUM.enumValues[number];

// Extend the Session interface with our custom properties
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"];
  }

  // Extend the User interface with our custom fields
  interface User extends DefaultUser {
    role: UserRole;
  }
}

// Extend JWT to include our custom fields
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
  }
}
```

### 3. Middleware for Route Protection

Added middleware in `apps/admin-dashboard/middleware.ts` to:

- Protect routes based on authentication status
- Implement role-based access control
- Define public routes that don't require authentication

### 4. Server Actions for Authentication

Created authentication actions in `apps/admin-dashboard/lib/actions/auth.ts`:

- `signInWithCredentials`: For email/password login
- `registerUser`: For new user registration
- `changePassword`: For password updates

### 5. Utility Scripts

Created scripts to automate the migration process:

- `scripts/migrate-clerk-to-nextauth.js`: Finds and replaces Clerk.js references in the codebase
- `scripts/update-auth-deps.js`: Updates package.json dependencies

### 6. Environment Variables

Updated environment variables to use NextAuth naming conventions:

- Replaced `NEXTAUTH_SECRET` with `NEXTAUTH_SECRET`
- Replaced `NEXTAUTH_URL` with `NEXTAUTH_URL`
- Removed unnecessary Clerk.js-specific variables

## Testing

- Updated `__tests__/integration/auth/nextauth.integration.ts` to test NextAuth functionality
- Verified existing security tests in `__tests__/security/auth.security.ts` still pass
- Ensured proper JWT token handling and session management

## Next Steps

1. **Update UI Components**:
   - Replace Clerk.js UI components with custom NextAuth-compatible components
   - Update sign-in/sign-up forms to use the new authentication actions

2. **Complete Environment Updates**:
   - Update all `.env` files with the new NextAuth variables
   - Generate a strong secret for `NEXTAUTH_SECRET` in production

3. **Additional Testing**:
   - Test authentication in the mobile app
   - Verify route protection works correctly
   - Test role-based access control

4. **Documentation Updates**:
   - Update API documentation to reflect authentication changes
   - Create guides for developers on using the new authentication system

## Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Drizzle ORM with NextAuth](https://authjs.dev/reference/adapter/drizzle)
- University Library project as a reference for professional NextAuth implementation 