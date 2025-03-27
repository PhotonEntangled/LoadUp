#!/bin/bash

# Script to download and set up the Uber clone repository for analysis
echo "Setting up Uber clone repository for analysis..."

# Create analysis directory if it doesn't exist
mkdir -p analysis

# Change to analysis directory
cd analysis

# Clone the repository
echo "Cloning Uber clone repository..."
git clone https://github.com/adrianhajdin/uber.git

# Enter the repository
cd uber

# Install dependencies (optional)
echo "Would you like to install dependencies? (y/n)"
read -r install_deps

if [ "$install_deps" = "y" ]; then
  echo "Installing dependencies (this may take a while)..."
  npm install
fi

echo "Uber clone repository has been set up in analysis/uber"
echo "You can now analyze its code for map integration patterns"
echo ""
echo "Key files to examine:"
echo "- Map Components: analysis/uber/components/Map.js"
echo "- Location Services: analysis/uber/hooks/useLocation.js"
echo "- Routing Logic: analysis/uber/pages/confirm.js"
echo ""
echo "Setup complete!" 