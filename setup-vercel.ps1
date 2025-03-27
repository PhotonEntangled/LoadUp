# PowerShell script to set up Vercel deployment
# This script loads environment variables from .env file and runs the Vercel setup script

# Output information
Write-Host "Loading environment variables from .env file..."

# Install dotenv if not already installed
npm install dotenv --no-save

# Run the Vercel setup script with dotenv
node -r dotenv/config scripts/vercel-setup.js 