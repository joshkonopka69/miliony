# Start Expo with QR Code (No Tunnel Needed)
# Works on same WiFi network - Norton won't block this!

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   Starting Expo with QR Code                  " -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "This mode:" -ForegroundColor Yellow
Write-Host "  - No tunnel (no ngrok/Norton issues)" -ForegroundColor Gray
Write-Host "  - Shows QR code automatically" -ForegroundColor Gray
Write-Host "  - Phone & PC must be on SAME WiFi" -ForegroundColor Gray
Write-Host ""

# Kill existing processes
Write-Host "Stopping existing processes..." -ForegroundColor Yellow
taskkill /F /IM node.exe 2>$null | Out-Null
taskkill /F /IM ngrok.exe 2>$null | Out-Null
Start-Sleep -Seconds 2

# Change to project directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host ""
Write-Host "Starting Expo..." -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANT: Make sure your phone and PC are on the SAME WiFi!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Wait 10-15 seconds for QR code to appear..." -ForegroundColor Gray
Write-Host ""

# Set environment
$env:EXPO_NO_DOCTOR = "1"
$env:EXPO_NO_TELEMETRY = "1"

# Start Expo
npx expo start --localhost

