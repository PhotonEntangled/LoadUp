# LoadUp - Modern Logistics Platform

## Status
![CI/CD](https://github.com/zeropointmonkey/LoadUp/workflows/LoadUp%20CI/CD%20Pipeline/badge.svg)

## Overview
LoadUp is a full-stack logistics platform built with modern technologies, designed to streamline shipment management and delivery operations.

## 🚀 Features

- **Admin Dashboard**
  - Shipment Management
  - Driver Management
  - Real-time Tracking
  - Analytics & Reporting

- **Driver Mobile App**
  - Live Navigation
  - Shipment Updates
  - Status Management
  - Customer Communication

- **API Server**
  - RESTful Endpoints
  - Authentication
  - Shipment Management
  - Driver Tracking

## 🛠️ Tech Stack

### Frontend
- Admin Dashboard: Next.js 14, TailwindCSS
- Driver App: React Native (Expo)
- State Management: Zustand
- Maps: Mapbox

### Backend
- Node.js with TypeScript
- PostgreSQL with Drizzle ORM
- Authentication: Clerk.js
- API Server: Express.js

### Infrastructure
- Monorepo with Turborepo
- CI/CD with GitHub Actions
- Deployment: Vercel (Admin), Expo (Mobile)

## 📦 Project Structure

```
loadup/
├── apps/
│   ├── admin-dashboard/    # Next.js admin panel
│   └── driver-app/         # React Native driver app
├── packages/
│   ├── api/               # Express.js API server
│   │   └── src/          # API implementation
│   ├── database/          # Drizzle ORM schemas
│   │   ├── src/          # Database schema
│   │   │   ├── schema/   # Schema files
│   │   │   │   ├── shipments.ts
│   │   │   │   ├── drivers.ts
│   │   │   │   ├── vehicles.ts
│   │   │   │   ├── tracking-updates.ts
│   │   │   │   └── validation.ts
│   │   │   └── etl/     # ETL pipeline
│   │   │       └── transform.ts
│   │   └── __tests__/   # Database tests
│   └── shared/           # Shared utilities and types
└── package.json
```

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/loadup.git
   cd loadup
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Admin Dashboard (.env)
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
   CLERK_SECRET_KEY=
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
   NEXT_PUBLIC_API_URL=http://localhost:3004

   # Driver App (.env)
   EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=
   EXPO_PUBLIC_API_URL=http://localhost:3004
   ```

4. **Start development servers**
   ```bash
   # Start all apps
   npm run dev

   # Start specific app
   npm run dev --filter=admin-dashboard
   npm run dev --filter=driver-app
   
   # Start API server
   cd packages/api
   npm run dev
   ```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific app tests
npm test --filter=admin-dashboard
npm test --filter=driver-app
```

## 📱 Mobile App Development

1. Install Expo Go on your device
2. Start the driver app:
   ```bash
   cd apps/driver-app
   npm start
   ```
3. Scan the QR code with Expo Go

## 📚 Documentation

For more detailed information, see:

- [Development Guide](DEVELOPMENT.md) - Best practices and development workflow
- [Deployment Guide](DEPLOYMENT.md) - Deployment instructions and operations

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request 

## Development
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run development server: `npm run dev`

## Testing
- Run tests: `npm test`
- Run linting: `npm run lint`

## Deployment
Deployments are automated through GitHub Actions and Vercel:
- Push to `develop` for preview deployment
- Push to `main` for production deployment

## Environment Variables
Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: JWT secret for authentication
- `NEXTAUTH_URL`: Application URL 