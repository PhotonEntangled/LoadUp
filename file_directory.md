# LoadUp Project File Directory

## Project Structure

```
LoadUp/
├── apps/
│   ├── admin-dashboard/          # Next.js Admin Dashboard
│   │   ├── app/
│   │   │   ├── layout.tsx       # Root layout with auth
│   │   │   ├── sign-in/        # Sign-in route
│   │   │   │   └── [[...sign-in]]/
│   │   │   │       └── page.tsx
│   │   │   └── sign-up/        # Sign-up route
│   │   │       └── [[...sign-up]]/
│   │   │           └── page.tsx
│   │   ├── middleware.ts        # Auth middleware
│   │   └── .env.example        # Environment config
│   │
│   └── driver-app/             # React Native Driver App
│       ├── App.tsx            # Root component
│       ├── app.config.ts      # Expo configuration
│       ├── context/
│   │   └── auth.tsx       # Auth context
│   │
│   └── .env.example       # Environment config
│
├── packages/                   # Shared packages
│   └── database/              # Database package
│       └── schema/            # Database schema
│
└── docs/                      # Documentation
    ├── FILE_DIRECTORY.md      # This file
    ├── EXECUTION_PLAN.md      # Project execution plan
    └── IMPLEMENTATION_REPORT.md # Implementation reports
```

## Directory Details

### Admin Dashboard (`apps/admin-dashboard/`)
- Next.js application for logistics administration
- Protected routes with Clerk.js authentication
- Role-based access control
- Environment configuration for auth

### Driver App (`apps/driver-app/`)
- React Native (Expo) application for drivers
- Clerk.js authentication with secure storage
- Navigation setup with protected routes
- Environment configuration for auth

### Shared Packages (`packages/`)
- Common code shared between applications
- Database schemas and migrations
- Shared types and utilities

### Documentation (`docs/`)
- Project documentation and guides
- Implementation reports
- Directory structure
- Execution plans

## Recent Changes (Last Update)
```diff
+ ✅ Added apps/admin-dashboard/app/api/shipments/route.ts
+ ✅ Added apps/admin-dashboard/app/api/drivers/route.ts
+ ✅ Added packages/shared/src/components/DriverCard.tsx
+ ✅ Added packages/shared/src/components/AddressInput.tsx
+ ✅ Added apps/driver-app/src/components/Scanner.tsx
```

## Current Structure
```bash
loadup/
├── apps/
│   ├── driver-app/               # React Native Expo Driver App
│   │   ├── src/
│   │   │   ├── components/      # Driver app components
│   │   │   │   └── Scanner.tsx  # Barcode scanner component
│   │   │   ├── screens/        # App screens
│   │   │   │   └── ShipmentTrackingScreen.tsx
│   │   │   ├── store/         # State management
│   │   │   │   └── driverStore.ts
│   │   │   └── utils/         # Helper functions
│   │   ├── app.json           # Expo configuration
│   │   └── package.json       # Driver app dependencies
│   │
│   └── admin-dashboard/         # Next.js Admin Dashboard
│       ├── app/
│       │   ├── auth/           # Authentication routes
│       │   ├── api/            # API routes
│   │   │   ├── shipments/  # Shipment management API
│   │   │   │   └── route.ts
│   │   │   └── drivers/    # Driver management API
│   │   │       └── route.ts
│   │   └── dashboard/      # Dashboard pages
│   │   ├── components/         # Reusable components
│   │   └── public/            # Static assets
│   │
│   └── packages/
│       ├── shared/                # Shared Components & Utils
│       │   ├── src/
│       │   │   ├── components/    # Shared React components
│       │   │   │   ├── Map.tsx
│       │   │   │   ├── DriverCard.tsx
│       │   │   │   └── AddressInput.tsx
│       │   │   ├── types/        # TypeScript definitions
│       │   │   │   └── index.ts
│       │   │   └── utils/        # Shared utilities
│       │   │       └── map.ts
│       │   └── package.json
│       │
│       ├── database/              # Database Layer
│       │   ├── migrations/       # Drizzle migrations
│       │   ├── schema/          # Database schemas
│       │   │   ├── shipments.ts
│       │   │   └── drivers.ts
│       │   └── package.json
│       │
│       └── api/                  # Shared API Layer
│           ├── src/
│           │   ├── routes/      # API routes
│           │   └── controllers/ # Route controllers
│           └── package.json
│
├── config/                   # Configuration files
├── scripts/                 # Build & deployment scripts
└── docs/                   # Documentation
    └── integration/
        └── INTEGRATION_PLAN.md

## Dependencies Status
### @loadup/shared
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-native": "^0.72.0",
    "react-native-maps": "^1.7.1",
    "@types/react": "^18.2.0",
    "@types/react-native": "^0.72.0"
  }
}
```

### @loadup/driver-app
```json
{
  "dependencies": {
    "@loadup/shared": "workspace:*",
    "expo": "^49.0.0",
    "expo-location": "~16.1.0",
    "expo-barcode-scanner": "~12.3.0",
    "expo-camera": "~13.2.1",
    "zustand": "^4.4.0"
  }
}
```

### @loadup/admin-dashboard
```json
{
  "dependencies": {
    "@loadup/shared": "workspace:*",
    "next": "^14.0.0",
    "next-auth": "^4.24.5",
    "@auth/drizzle-adapter": "^0.3.5",
    "drizzle-orm": "^0.29.3",
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0"
  }
}
```
