# PowerShell script to deploy the admin dashboard to Vercel
# This script provides a more robust deployment process with error handling

# Output styling function
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    else {
        $input | Write-Output
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

# Set working directory
Set-Location -Path $PSScriptRoot\apps\admin-dashboard

# Output information
Write-ColorOutput Green "==== Starting Vercel Deployment ===="
Write-Host "Deploying admin dashboard to Vercel..."
Write-Host "This may take a few minutes..."

# Check if .vercel folder exists
if (-not (Test-Path .\.vercel)) {
    Write-ColorOutput Yellow "Project not linked to Vercel. Linking now..."
    npx vercel link --confirm
}

# Verify vercel.json existence
if (-not (Test-Path .\vercel.json)) {
    Write-ColorOutput Red "Error: vercel.json not found in admin-dashboard directory!"
    exit 1
}

# Verify package.json exists and has build script
if (-not (Test-Path .\package.json)) {
    Write-ColorOutput Red "Error: package.json not found in admin-dashboard directory!"
    exit 1
}

# Deploy to Vercel with production flag
Write-ColorOutput Cyan "Starting deployment to Vercel production environment..."
$deployment = npx vercel --prod

if ($LASTEXITCODE -ne 0) {
    Write-ColorOutput Red "Deployment failed with exit code $LASTEXITCODE."
    Write-Host "Try checking the logs with: npx vercel logs [deployment-url]"
    
    # Return to the project root
    Set-Location -Path $PSScriptRoot
    exit $LASTEXITCODE
}

# Return to the project root
Set-Location -Path $PSScriptRoot

Write-ColorOutput Green "==== Deployment Completed Successfully! ===="
Write-Host "Your application has been deployed to Vercel." 