# PowerShell script to start the LoadUp application
# Note: This script uses PowerShell syntax (;) instead of bash syntax (&&)

# Start the API server
Write-Host "Starting API server..." -ForegroundColor Green
Start-Process -NoNewWindow powershell -ArgumentList "-Command", "cd packages/api; node server.js"

# Wait for the API server to start
Start-Sleep -Seconds 3

# Start the admin dashboard
Write-Host "Starting admin dashboard..." -ForegroundColor Green
Start-Process -NoNewWindow powershell -ArgumentList "-Command", "cd apps/admin-dashboard; npm run dev"

# Wait for the admin dashboard to start
Start-Sleep -Seconds 3

# Print URLs
Write-Host "`nLoadUp application is now running!" -ForegroundColor Cyan
Write-Host "API Server: http://localhost:3001" -ForegroundColor Yellow
Write-Host "Admin Dashboard: http://localhost:3000" -ForegroundColor Yellow
Write-Host "`nPress Ctrl+C to stop all services" -ForegroundColor Red

# Keep the script running
try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
} finally {
    # This block will execute when Ctrl+C is pressed
    Write-Host "`nStopping all services..." -ForegroundColor Red
    # Add commands to stop services if needed
} 