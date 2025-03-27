# LoadUp Admin Dashboard Deployment Script for Vercel
# This script helps deploy the admin dashboard to Vercel

# Ensure we're in the right directory
$currentDir = Get-Location
Write-Host "Current directory: $currentDir" -ForegroundColor Cyan

# Check if we're in the admin-dashboard directory
if (-not (Test-Path "next.config.js")) {
    Write-Host "Error: This script must be run from the admin-dashboard directory." -ForegroundColor Red
    Write-Host "Please navigate to apps/admin-dashboard and try again." -ForegroundColor Red
    exit 1
}

# Check if Vercel CLI is installed
$vercelInstalled = $null
try {
    $vercelInstalled = Get-Command npx -ErrorAction SilentlyContinue
} catch {
    $vercelInstalled = $null
}

if ($null -eq $vercelInstalled) {
    Write-Host "Error: npx is not installed or not in PATH." -ForegroundColor Red
    Write-Host "Please install Node.js and npm, then try again." -ForegroundColor Red
    exit 1
}

# Check if user is logged in to Vercel
Write-Host "Checking Vercel login status..." -ForegroundColor Cyan
$vercelLoginOutput = npx vercel whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "You are not logged in to Vercel. Please log in:" -ForegroundColor Yellow
    npx vercel login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to log in to Vercel. Exiting." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "Logged in as: $vercelLoginOutput" -ForegroundColor Green
}

# Ask if this is a production deployment
$isProd = Read-Host "Is this a production deployment? (y/n)"
$prodFlag = ""
if ($isProd -eq "y" -or $isProd -eq "Y") {
    $prodFlag = "--prod"
    Write-Host "Deploying to PRODUCTION environment..." -ForegroundColor Yellow
} else {
    Write-Host "Deploying to PREVIEW environment..." -ForegroundColor Cyan
}

# Deploy to Vercel
Write-Host "Deploying to Vercel..." -ForegroundColor Green
npx vercel $prodFlag

if ($LASTEXITCODE -ne 0) {
    Write-Host "Deployment failed. Please check the error messages above." -ForegroundColor Red
    exit 1
}

Write-Host "Deployment completed successfully!" -ForegroundColor Green
Write-Host "You can view your deployment on the Vercel dashboard." -ForegroundColor Green 