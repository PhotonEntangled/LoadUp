# PowerShell script to run the Next.js admin dashboard
# This script avoids the use of && which is not supported in some PowerShell versions

# Set working directory
Set-Location -Path $PSScriptRoot\apps\admin-dashboard

# Output information
Write-Host "Starting Next.js development server..."
Write-Host "Press Ctrl+C to stop the server"

# Run the Next.js development server
npx next dev 