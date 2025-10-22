# Start Expo with LocalTunnel and QR Code
# Norton-friendly tunnel that displays QR code!

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   Expo + LocalTunnel + QR Code                " -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "This will:" -ForegroundColor Yellow
Write-Host "  1. Start Expo on localhost" -ForegroundColor Gray
Write-Host "  2. Create LocalTunnel (Norton won't block it)" -ForegroundColor Gray
Write-Host "  3. Show QR code to scan with Expo Go" -ForegroundColor Gray
Write-Host ""

# Kill existing processes
Write-Host "Cleaning up old processes..." -ForegroundColor Yellow
taskkill /F /IM node.exe 2>$null | Out-Null
taskkill /F /IM ngrok.exe 2>$null | Out-Null
Start-Sleep -Seconds 3

# Change to project directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host ""
Write-Host "Step 1: Starting Expo Metro Bundler..." -ForegroundColor Cyan
Write-Host ""

# Start Expo in background
$env:EXPO_NO_DOCTOR = "1"
$env:EXPO_NO_TELEMETRY = "1"

$expoProcess = Start-Process powershell -ArgumentList `
    "-NoExit", `
    "-Command", `
    "cd '$scriptPath'; `$env:EXPO_NO_DOCTOR='1'; npx expo start --localhost --port 8081" `
    -PassThru -WindowStyle Minimized

Write-Host "Waiting for Metro Bundler to initialize..." -ForegroundColor Yellow
Write-Host "(This takes 15-20 seconds...)" -ForegroundColor Gray
Start-Sleep -Seconds 18

Write-Host ""
Write-Host "Step 2: Creating LocalTunnel with QR Code..." -ForegroundColor Cyan
Write-Host ""

# Check if Metro is ready
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8081/status" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    Write-Host "Metro Bundler is ready!" -ForegroundColor Green
} catch {
    Write-Host "Warning: Metro might still be starting..." -ForegroundColor Yellow
    Write-Host "Continuing anyway..." -ForegroundColor Gray
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Start LocalTunnel with QR code
node start-localtunnel-qr.js

# Cleanup when script ends
Write-Host ""
Write-Host "Cleaning up..." -ForegroundColor Yellow
if ($expoProcess -and !$expoProcess.HasExited) {
    Stop-Process -Id $expoProcess.Id -Force -ErrorAction SilentlyContinue
}

Write-Host "Stopped." -ForegroundColor Gray

