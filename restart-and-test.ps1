# Restart Backend Server
Write-Host "🔄 Restarting backend server..." -ForegroundColor Cyan

# Find and kill process on port 3000
$processId = (Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue).OwningProcess
if ($processId) {
    Write-Host "⏹️  Stopping process $processId on port 3000..." -ForegroundColor Yellow
    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

# Start backend
Write-Host "🚀 Starting backend server..." -ForegroundColor Green
Set-Location "$PSScriptRoot\backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; node 'C:\Users\H68618\nodejs\node-v24.15.0-win-x64\node_modules\npm\bin\npm-cli.js' run dev"

Write-Host "✅ Backend starting in new window..." -ForegroundColor Green
Write-Host "⏳ Waiting 5 seconds for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Run test
Write-Host "`n🧪 Running hotspot tests..." -ForegroundColor Cyan
Set-Location "$PSScriptRoot\backend"
node test-hotspots.js
