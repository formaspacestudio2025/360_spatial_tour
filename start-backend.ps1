# Start Backend Server
# This script sets up Node.js PATH and starts the backend

# Set Node.js path
$env:Path = "C:\Users\H68618\nodejs\node-v24.15.0-win-x64;$env:Path"

# Navigate to backend
cd $PSScriptRoot\backend

Write-Host "Starting Backend Server..." -ForegroundColor Cyan
Write-Host "Server will run on: http://localhost:3001" -ForegroundColor Green
Write-Host ""

# Start the server
npm.cmd run dev
