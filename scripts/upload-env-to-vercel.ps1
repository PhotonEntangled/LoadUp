# PowerShell script to upload environment variables from .env file to Vercel
# This script follows the module system requirements of the LoadUp project

# Check if Vercel CLI is installed
$vercelInstalled = $null
try {
    $vercelInstalled = Get-Command vercel -ErrorAction Stop
    Write-Host "Vercel CLI is installed." -ForegroundColor Green
} catch {
    Write-Host "Vercel CLI is not installed. Installing now..." -ForegroundColor Yellow
    npm install -g vercel
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to install Vercel CLI. Please install it manually with 'npm install -g vercel'" -ForegroundColor Red
        exit 1
    }
    Write-Host "Vercel CLI installed successfully." -ForegroundColor Green
}

# Check if user is logged in to Vercel
$vercelLoggedIn = $false
try {
    $whoami = vercel whoami
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Logged in to Vercel as: $whoami" -ForegroundColor Green
        $vercelLoggedIn = $true
    }
} catch {
    $vercelLoggedIn = $false
}

if (-not $vercelLoggedIn) {
    Write-Host "Not logged in to Vercel. Please login:" -ForegroundColor Yellow
    vercel login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to login to Vercel. Please try again manually with 'vercel login'" -ForegroundColor Red
        exit 1
    }
}

# Path to .env file
$envFilePath = Join-Path -Path $PSScriptRoot -ChildPath "..\\.env"

# Check if .env file exists
if (-not (Test-Path $envFilePath)) {
    Write-Host "Error: .env file not found at $envFilePath" -ForegroundColor Red
    exit 1
}

Write-Host "Reading environment variables from $envFilePath" -ForegroundColor Cyan

# Read .env file
$envContent = Get-Content $envFilePath

# Process each line
foreach ($line in $envContent) {
    # Skip comments and empty lines
    if ($line.StartsWith("#") -or [string]::IsNullOrWhiteSpace($line)) {
        continue
    }

    # Parse key-value pair
    $parts = $line -split "=", 2
    if ($parts.Length -eq 2) {
        $key = $parts[0].Trim()
        $value = $parts[1].Trim()

        # Skip if key or value is empty
        if ([string]::IsNullOrWhiteSpace($key) -or [string]::IsNullOrWhiteSpace($value)) {
            continue
        }

        # Skip placeholder values
        if ($value -eq "your_database_url_here" -or $value -like "your_*_here") {
            Write-Host "Skipping placeholder value for $key" -ForegroundColor Yellow
            continue
        }

        Write-Host "Adding environment variable: $key" -ForegroundColor Cyan
        
        # Add environment variable to Vercel
        vercel env add $key production
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Failed to add $key to Vercel" -ForegroundColor Red
        } else {
            Write-Host "Successfully added $key to Vercel" -ForegroundColor Green
        }
    }
}

Write-Host "Environment variables upload completed!" -ForegroundColor Green
Write-Host "You may need to redeploy your project for the changes to take effect." -ForegroundColor Yellow
Write-Host "Run 'vercel --prod' to deploy to production." -ForegroundColor Yellow 