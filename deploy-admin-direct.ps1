# PowerShell script to deploy the admin dashboard to Vercel
# This script specifies the vercel.json file location explicitly

# Set working directory
Set-Location -Path $PSScriptRoot\apps\admin-dashboard

# Output information
Write-Host "Deploying admin dashboard to Vercel..."
Write-Host "This may take a few minutes..."

# Deploy to Vercel with production flag and specify vercel.json
npx vercel deploy --prod --local-config=./vercel.json

# Return to the project root
Set-Location -Path $PSScriptRoot

Write-Host "Deployment completed!" 