# Move auth.ts to packages/api/src/middleware
Move-Item -Path "auth.ts" -Destination "packages/api/src/middleware/" -Force

# Move data pipeline to packages/database
if (Test-Path "data_pipeline") {
    Move-Item -Path "data_pipeline/*" -Destination "packages/database/etl/" -Force
    Remove-Item "data_pipeline" -Recurse -Force
}

# Move data directory contents to appropriate locations
if (Test-Path "data") {
    Move-Item -Path "data/*" -Destination "packages/database/seed/" -Force
    Remove-Item "data" -Recurse -Force
}

# Clean up old backend directory
if (Test-Path "backend") {
    # Move any remaining useful files
    if (Test-Path "backend/scripts") {
        Move-Item -Path "backend/scripts/*" -Destination "scripts/" -Force
    }
    Remove-Item "backend" -Recurse -Force
}

# Move documentation files
Move-Item -Path "code_extraction_plan.md" -Destination "docs/planning/" -Force
Move-Item -Path "etl_plan.md" -Destination "docs/planning/" -Force

# Create root package.json for monorepo
@"
{
  "name": "loadup",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "clean": "turbo run clean",
    "format": "prettier --write \"**/*.{ts,tsx,md}\""
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0",
    "turbo": "^1.10.0",
    "typescript": "^5.0.0"
  },
  "packageManager": "pnpm@8.0.0"
}
"@ | Out-File -FilePath "package.json" -Encoding UTF8 -Force

# Create turbo.json for monorepo configuration
@"
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "build/**"]
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "lint": {
      "outputs": []
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "clean": {
      "cache": false
    }
  }
}
"@ | Out-File -FilePath "turbo.json" -Encoding UTF8

# Create root tsconfig.json
@"
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "jsx": "preserve",
    "strict": true,
    "noEmit": true,
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@loadup/*": ["packages/*/src"]
    }
  },
  "exclude": ["node_modules"]
}
"@ | Out-File -FilePath "tsconfig.json" -Encoding UTF8 -Force

# Create .env.example in config directory
@"
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/loadup
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-jwt-secret
SESSION_SECRET=your-session-secret

# External Services
GOOGLE_CLOUD_VISION_API_KEY=your-gcv-api-key
MAPBOX_ACCESS_TOKEN=your-mapbox-token
STRIPE_SECRET_KEY=your-stripe-secret
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

# App Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api
EXPO_PUBLIC_API_URL=http://localhost:3000/api
"@ | Out-File -FilePath "config/.env.example" -Encoding UTF8

Write-Host "Project cleanup complete!" 