# Role-Based Access Control (RBAC) Implementation

## Overview

This document outlines the implementation of role-based access control (RBAC) in the LoadUp logistics platform. RBAC is a security approach that restricts system access to authorized users based on their roles within the organization.

## User Roles

The system defines three primary user roles:

1. **Admin** - Full system access with user management capabilities
2. **Driver** - Access to delivery management and route planning
3. **Customer** - Access to shipment creation and tracking

## Implementation Details

### Database Schema

We've added a `role` field to the users table using a PostgreSQL enum type:

```sql
-- Create role enum type
CREATE TYPE user_role AS ENUM ('admin', 'driver', 'customer');

-- Add role column to users table
ALTER TABLE users ADD COLUMN role user_role NOT NULL DEFAULT 'customer';

-- Create index on role column
CREATE INDEX idx_users_role ON users(role);
```

### Authentication Configuration

The NextAuth configuration has been updated to handle user roles:

1. **JWT Token** - User role is included in the JWT token
2. **Session** - Role is passed to the client session
3. **Authorization** - Routes are protected based on user roles

### Middleware

A custom middleware checks user roles against requested routes:

```typescript
// Define route access by role
const roleBasedAccess = {
  '/dashboard/admin': ['admin'],
  '/dashboard/driver': ['driver'],
  '/dashboard/shipments': ['admin', 'customer', 'driver'],
  // ... other routes
};

// Check if user has access to the requested route
const hasAccess = (user: User, path: string) => {
  // Check exact path matches
  if (roleBasedAccess[path] && !roleBasedAccess[path].includes(user.role)) {
    return false;
  }
  
  // Check parent paths
  for (const route in roleBasedAccess) {
    if (path.startsWith(route) && !roleBasedAccess[route].includes(user.role)) {
      return false;
    }
  }
  
  return true;
};
```

### User Interface

The UI adapts based on the user's role:

1. **Dashboard** - Shows role-specific cards and information
2. **Navigation** - Sidebar displays only accessible routes
3. **Forms** - Role selection is available during sign-up

## Testing

We've implemented comprehensive tests for the RBAC system:

1. **Middleware Tests** - Verify route protection based on roles
2. **Authentication Tests** - Ensure proper role assignment
3. **UI Tests** - Confirm that components adapt to user roles

## Security Considerations

1. **Role Validation** - Roles are validated on both client and server
2. **Principle of Least Privilege** - Users only have access to necessary functions
3. **Role Assignment** - Only admins can change user roles

## Future Enhancements

1. **Fine-grained Permissions** - Add more granular permissions within roles
2. **Role Hierarchies** - Implement role inheritance
3. **Audit Logging** - Track role-based access and changes

## Conclusion

The RBAC implementation provides a secure and flexible way to control access to the LoadUp platform. By restricting access based on user roles, we ensure that users can only access the features and data relevant to their responsibilities. 