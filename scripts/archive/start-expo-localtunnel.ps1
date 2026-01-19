# Start Expo with LocalTunnel (Alternative to ngrok)
# LocalTunnel is NOT blocked by Norton!

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   Starting Expo with LocalTunnel              " -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "LocalTunnel: Alternative to ngrok that Norton allows" -ForegroundColor Green
Write-Host ""

# Kill any existing processes
Write-Host "Stopping existing Node processes..." -ForegroundColor Yellow
taskkill /F /IM node.exe 2>$null | Out-Null
Start-Sleep -Seconds 2

# Change to project directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host ""
Write-Host "Step 1: Starting Expo on localhost..." -ForegroundColor Cyan
Write-Host ""

# Start Expo in background
$env:EXPO_NO_DOCTOR = "1"
$env:EXPO_NO_TELEMETRY = "1"

$expoJob = Start-Job -ScriptBlock {
    Set-Location "C:\Users\Adrian\Nowy folder\miliony"
    $env:EXPO_NO_DOCTOR = "1"
    npx expo start --localhost 2>&1
}

Write-Host "Waiting for Metro Bundler to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

Write-Host ""
Write-Host "Step 2: Starting LocalTunnel on port 8081..." -ForegroundColor Cyan
Write-Host ""

# Start LocalTunnel
Write-Host "Creating tunnel..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "lt --port 8081" -WindowStyle Normal

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "SUCCESS! Tunnel created!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Check the NEW PowerShell window that just opened" -ForegroundColor Yellow
Write-Host "It will show your tunnel URL like:" -ForegroundColor White
Write-Host "  https://some-random-name.loca.lt" -ForegroundColor Cyan
Write-Host ""
Write-Host "Use that URL in Expo Go app!" -ForegroundColor Green
Write-Host ""
Write-Host "To stop: Close both PowerShell windows" -ForegroundColor Gray
Write-Host ""

pause

