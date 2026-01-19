# Easy Expo Start with QR Code
# Simple and reliable

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   Easy Expo Start with QR Code                " -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Kill existing processes
Write-Host "Cleaning up..." -ForegroundColor Yellow
taskkill /F /IM node.exe 2>$null | Out-Null
Start-Sleep -Seconds 2

# Change to project directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host ""
Write-Host "Starting Expo in localhost mode..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Instructions:" -ForegroundColor Yellow
Write-Host "  1. Wait for QR code to appear" -ForegroundColor Gray
Write-Host "  2. If no QR code, press 's' key" -ForegroundColor Gray
Write-Host "  3. Make sure phone and PC on SAME WiFi" -ForegroundColor Gray
Write-Host ""

# Set environment
$env:EXPO_NO_DOCTOR = "1"
$env:EXPO_NO_TELEMETRY = "1"

# Start Expo
npx expo start --localhost
