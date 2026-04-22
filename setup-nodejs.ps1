# Setup Node.js without admin rights
# Run this script in PowerShell

Write-Host "📦 Setting up Node.js (no admin required)..." -ForegroundColor Cyan

# Create nodejs directory in user folder
$nodePath = "$env:USERPROFILE\nodejs"
if (!(Test-Path $nodePath)) {
    New-Item -ItemType Directory -Path $nodePath | Out-Null
    Write-Host "✅ Created: $nodePath" -ForegroundColor Green
}

# Download Node.js (portable version)
Write-Host "📥 Downloading Node.js..." -ForegroundColor Yellow
$nodeUrl = "https://nodejs.org/dist/v20.11.0/node-v20.11.0-win-x64.zip"
$zipPath = "$env:TEMP\nodejs.zip"

try {
    Invoke-WebRequest -Uri $nodeUrl -OutFile $zipPath
    Write-Host "✅ Download complete" -ForegroundColor Green
} catch {
    Write-Host "❌ Download failed. Please download manually from:" -ForegroundColor Red
    Write-Host "   https://nodejs.org/dist/v20.11.0/node-v20.11.0-win-x64.zip" -ForegroundColor Red
    exit 1
}

# Extract ZIP
Write-Host "📂 Extracting..." -ForegroundColor Yellow
Expand-Archive -Path $zipPath -DestinationPath $env:TEMP -Force

# Copy files to nodejs directory
$extractedPath = "$env:TEMP\node-v20.11.0-win-x64"
Copy-Item -Path "$extractedPath\*" -Destination $nodePath -Recurse -Force
Write-Host "✅ Extracted to: $nodePath" -ForegroundColor Green

# Add to user PATH
Write-Host "🔧 Adding to PATH..." -ForegroundColor Yellow
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($currentPath -notlike "*$nodePath*") {
    [Environment]::SetEnvironmentVariable(
        "Path",
        "$nodePath;$currentPath",
        "User"
    )
    Write-Host "✅ Added to user PATH" -ForegroundColor Green
} else {
    Write-Host "✅ Already in PATH" -ForegroundColor Green
}

# Clean up
Remove-Item $zipPath -Force -ErrorAction SilentlyContinue
Remove-Item $extractedPath -Recurse -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ Node.js setup complete!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  IMPORTANT: Close this PowerShell and open a NEW one" -ForegroundColor Yellow
Write-Host ""
Write-Host "Then verify with:" -ForegroundColor White
Write-Host "  node --version" -ForegroundColor Gray
Write-Host "  npm --version" -ForegroundColor Gray
Write-Host ""
