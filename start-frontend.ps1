# Start Frontend Server
# This script sets up Node.js PATH and starts the frontend

# Set Node.js path
$env:Path = "C:\Users\H68618\nodejs\node-v24.15.0-win-x64;$env:Path"

# Navigate to frontend
cd $PSScriptRoot\frontend

Write-Host "Starting Frontend Dev Server..." -ForegroundColor Cyan
Write-Host "App will be available at: http://localhost:5173" -ForegroundColor Green
Write-Host ""

# Start the dev server
npm.cmd run dev
