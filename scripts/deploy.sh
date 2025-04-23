#!/bin/bash

# LoadUp Admin Dashboard Deployment Script for Vercel
# This script helps deploy the admin dashboard to Vercel

# Ensure we're in the right directory
CURRENT_DIR=$(pwd)
echo "Current directory: $CURRENT_DIR"

# Check if we're in the admin-dashboard directory
if [ ! -f "next.config.js" ]; then
    echo "Error: This script must be run from the admin-dashboard directory."
    echo "Please navigate to apps/admin-dashboard and try again."
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v npx &> /dev/null; then
    echo "Error: npx is not installed or not in PATH."
    echo "Please install Node.js and npm, then try again."
    exit 1
fi

# Check if user is logged in to Vercel
echo "Checking Vercel login status..."
if ! npx vercel whoami &> /dev/null; then
    echo "You are not logged in to Vercel. Please log in:"
    npx vercel login
    if [ $? -ne 0 ]; then
        echo "Failed to log in to Vercel. Exiting."
        exit 1
    fi
fi

# Ask if this is a production deployment
read -p "Is this a production deployment? (y/n): " IS_PROD
PROD_FLAG=""
if [[ "$IS_PROD" == "y" || "$IS_PROD" == "Y" ]]; then
    PROD_FLAG="--prod"
    echo "Deploying to PRODUCTION environment..."
else
    echo "Deploying to PREVIEW environment..."
fi

# Deploy to Vercel
echo "Deploying to Vercel..."
npx vercel $PROD_FLAG

if [ $? -ne 0 ]; then
    echo "Deployment failed. Please check the error messages above."
    exit 1
fi

echo "Deployment completed successfully!"
echo "You can view your deployment on the Vercel dashboard." 