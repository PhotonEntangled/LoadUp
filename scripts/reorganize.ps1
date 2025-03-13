# Create necessary directories if they don't exist
$dirs = @(
    "apps/driver-app/src/components",
    "apps/driver-app/src/screens",
    "apps/driver-app/src/hooks",
    "apps/driver-app/src/store",
    "apps/driver-app/src/utils",
    "apps/admin-dashboard/app/auth",
    "apps/admin-dashboard/app/api",
    "apps/admin-dashboard/app/dashboard",
    "apps/admin-dashboard/components",
    "apps/admin-dashboard/lib",
    "apps/admin-dashboard/public",
    "packages/database/migrations",
    "packages/database/schema",
    "packages/database/seed",
    "packages/api/src/routes",
    "packages/api/src/controllers",
    "packages/api/src/middleware",
    "packages/api/src/utils",
    "packages/shared/src/types",
    "packages/shared/src/constants",
    "packages/shared/src/utils",
    "config",
    "scripts"
)

foreach ($dir in $dirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force
    }
}

# Move database files
Copy-Item "database/schema.ts" "packages/database/schema/index.ts" -Force
Copy-Item "database/drizzle.ts" "packages/database/drizzle.ts" -Force

# Move admin dashboard files
Copy-Item "app/admin/*" "apps/admin-dashboard/app/" -Recurse -Force
Copy-Item "app/api/*" "apps/admin-dashboard/app/api/" -Recurse -Force

# Move driver app files
Copy-Item "app/driver/*" "apps/driver-app/src/" -Recurse -Force

# Move shared files
Copy-Item "types/*" "packages/shared/src/types/" -Recurse -Force
Copy-Item "lib/*" "packages/shared/src/utils/" -Recurse -Force

# Move configuration files
Copy-Item "auth.ts" "packages/api/src/middleware/auth.ts" -Force
Copy-Item "tsconfig.json" "tsconfig.json" -Force

# Create package.json files
@"
{
  "name": "@loadup/database",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "migrate": "drizzle-kit push:pg",
    "generate": "drizzle-kit generate:pg"
  }
}
"@ | Out-File -FilePath "packages/database/package.json" -Encoding UTF8

@"
{
  "name": "@loadup/api",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "ts-node-dev src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
"@ | Out-File -FilePath "packages/api/package.json" -Encoding UTF8

@"
{
  "name": "@loadup/shared",
  "version": "0.1.0",
  "private": true,
  "main": "dist/index.js",
  "types": "dist/index.d.ts"
}
"@ | Out-File -FilePath "packages/shared/package.json" -Encoding UTF8

# Clean up old directories after successful moves
$oldDirs = @(
    "app",
    "database",
    "types",
    "lib",
    "components",
    "public",
    "styles",
    "hooks"
)

foreach ($dir in $oldDirs) {
    if (Test-Path $dir) {
        Remove-Item $dir -Recurse -Force
    }
}

Write-Host "Project restructuring complete!" 