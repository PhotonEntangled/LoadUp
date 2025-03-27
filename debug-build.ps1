# PowerShell script to debug the build process
# This script runs the build locally to identify any issues

# Set working directory
Set-Location -Path $PSScriptRoot\apps\admin-dashboard

# Output information
Write-Host "Running Next.js build locally to debug issues..."

# Clean any existing build artifacts
if (Test-Path .\.next) {
    Write-Host "Cleaning previous build..."
    Remove-Item -Recurse -Force .\.next
}

# Ensure dependencies are installed
Write-Host "Installing dependencies..."
npm install

# Run the build
Write-Host "Running build..."
npm run build

# Check exit code
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed with exit code $LASTEXITCODE."
} else {
    Write-Host "Build completed successfully!"
}

# Return to the project root
Set-Location -Path $PSScriptRoot 