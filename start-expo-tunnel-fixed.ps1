# Fixed Expo Tunnel with QR Code
# Ensures Expo and tunnel are properly connected

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   Fixed Expo Tunnel with QR Code              " -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Kill existing processes
Write-Host "Cleaning up..." -ForegroundColor Yellow
taskkill /F /IM node.exe 2>$null | Out-Null
taskkill /F /IM ngrok.exe 2>$null | Out-Null
Start-Sleep -Seconds 3

# Change to project directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host ""
Write-Host "Step 1: Starting Expo..." -ForegroundColor Cyan

# Start Expo and wait for it to be ready
$env:EXPO_NO_DOCTOR = "1"
$env:EXPO_NO_TELEMETRY = "1"

Write-Host "Starting Metro Bundler..." -ForegroundColor Gray
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptPath'; `$env:EXPO_NO_DOCTOR='1'; npx expo start --localhost" -PassThru | Out-Null

Write-Host ""
Write-Host "Waiting for Metro Bundler..." -ForegroundColor Yellow
Start-Sleep -Seconds 20

# Check if Metro is running
Write-Host ""
Write-Host "Step 2: Checking Metro Bundler..." -ForegroundColor Cyan

$metroReady = $false
for ($i = 1; $i -le 10; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8081/status" -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            $metroReady = $true
            Write-Host "Metro Bundler is ready!" -ForegroundColor Green
            break
        }
    } catch {
        Write-Host "Attempt $i/10: Metro not ready yet..." -ForegroundColor Yellow
        Start-Sleep -Seconds 3
    }
}

if (-not $metroReady) {
    Write-Host ""
    Write-Host "ERROR: Metro Bundler failed to start properly!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Try running manually:" -ForegroundColor Yellow
    Write-Host "  npx expo start --localhost" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Then check http://localhost:8081/status in your browser" -ForegroundColor Gray
    pause
    exit 1
}

Write-Host ""
Write-Host "Step 3: Creating tunnel..." -ForegroundColor Cyan

# Create a simple tunnel script
$tunnelScript = @'
const localtunnel = require('localtunnel');
const qrcode = require('qrcode-terminal');

(async () => {
  try {
    console.log('\nCreating tunnel...\n');
    
    const tunnel = await localtunnel({ 
      port: 8081,
      subdomain: 'expo-miliony-' + Math.random().toString(36).substring(7)
    });

    const tunnelUrl = tunnel.url;
    const expoUrl = tunnelUrl.replace('https://', 'exp://').replace('http://', 'exp://');
    
    console.log('✅ Tunnel created!');
    console.log('URL: ' + tunnelUrl);
    console.log('Expo URL: ' + expoUrl);
    console.log('\n================================================');
    console.log('   SCAN THIS QR CODE:');
    console.log('================================================\n');

    qrcode.generate(expoUrl, { small: true }, (qr) => {
      console.log(qr);
    });

    console.log('\n================================================');
    console.log('📱 Scan with Expo Go app!');
    console.log('⚠️  Keep this window open!');
    console.log('Press Ctrl+C to stop\n');

    tunnel.on('close', () => {
      console.log('\nTunnel closed');
      process.exit();
    });

    tunnel.on('error', (err) => {
      console.error('Tunnel error:', err.message);
      process.exit(1);
    });

  } catch (err) {
    console.error('Failed to start tunnel:', err.message);
    process.exit(1);
  }
})();
'@

# Write tunnel script
$tunnelScript | Out-File -FilePath "temp-tunnel.js" -Encoding UTF8

Write-Host "Starting LocalTunnel..." -ForegroundColor Gray
node temp-tunnel.js

# Cleanup
Remove-Item "temp-tunnel.js" -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "Tunnel stopped." -ForegroundColor Gray
