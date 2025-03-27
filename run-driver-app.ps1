# PowerShell script to run the React Native driver app
# This script avoids the use of && which is not supported in some PowerShell versions

# Set working directory
Set-Location -Path $PSScriptRoot\apps\driver-app

# Output information
Write-Host "Starting Expo development server..."
Write-Host "Press Ctrl+C to stop the server"

# Run the Expo development server
npx expo start 