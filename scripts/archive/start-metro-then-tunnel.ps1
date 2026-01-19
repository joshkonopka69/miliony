# Start Metro First, Then Tunnel
# Ensures Metro is serving bundles before creating tunnel

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   Metro + LocalTunnel (Proper Sequence)       " -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Kill existing processes
Write-Host "Step 1: Cleaning up..." -ForegroundColor Yellow
taskkill /F /IM node.exe 2>$null | Out-Null
Start-Sleep -Seconds 3

# Change to project directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host ""
Write-Host "Step 2: Starting Metro Bundler..." -ForegroundColor Cyan

# Set environment
$env:EXPO_NO_DOCTOR = "1"
$env:EXPO_NO_TELEMETRY = "1"

# Start Metro in background
Write-Host "  Starting Metro in background..." -ForegroundColor Gray
$metroJob = Start-Job -ScriptBlock {
    Set-Location "C:\Users\Adrian\Nowy folder\miliony"
    $env:EXPO_NO_DOCTOR = "1"
    $env:EXPO_NO_TELEMETRY = "1"
    npx expo start --localhost --port 8081 2>&1
}

Write-Host ""
Write-Host "Step 3: Waiting for Metro to be ready..." -ForegroundColor Cyan
Write-Host "(This takes 20-30 seconds...)" -ForegroundColor Gray
Write-Host ""

# Wait for Metro to be ready
$metroReady = $false
$attempts = 0
$maxAttempts = 30

while (-not $metroReady -and $attempts -lt $maxAttempts) {
    Start-Sleep -Seconds 2
    $attempts++
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8081/status" -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            $metroReady = $true
            Write-Host ""
            Write-Host "✅ Metro is running!" -ForegroundColor Green
            break
        }
    } catch {
        Write-Host "." -NoNewline -ForegroundColor Gray
    }
}

if (-not $metroReady) {
    Write-Host ""
    Write-Host "❌ Metro failed to start!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Checking Metro job output..." -ForegroundColor Yellow
    $jobOutput = Receive-Job -Job $metroJob
    Write-Host $jobOutput
    
    Stop-Job -Job $metroJob -ErrorAction SilentlyContinue
    Remove-Job -Job $metroJob -ErrorAction SilentlyContinue
    pause
    exit 1
}

Write-Host ""
Write-Host "Step 4: Testing bundle endpoint..." -ForegroundColor Cyan

# Test if bundle is accessible
try {
    $bundleResponse = Invoke-WebRequest -Uri "http://localhost:8081/index.bundle?platform=ios&dev=true" -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
    if ($bundleResponse.StatusCode -eq 200) {
        Write-Host "✅ Bundle endpoint working! (Got $($bundleResponse.Content.Length) bytes)" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Bundle endpoint issue: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "Continuing anyway..." -ForegroundColor Gray
}

Write-Host ""
Write-Host "Step 5: Creating LocalTunnel with QR Code..." -ForegroundColor Cyan
Write-Host ""

# Create tunnel script
$tunnelScript = @'
const localtunnel = require('localtunnel');
const qrcode = require('qrcode-terminal');

console.log('Creating LocalTunnel...\n');

(async () => {
  try {
    const tunnel = await localtunnel({ 
      port: 8081,
      subdomain: 'expo-miliony-' + Math.random().toString(36).substring(7)
    });

    const tunnelUrl = tunnel.url;
    const expoUrl = tunnelUrl.replace('https://', 'exp://').replace('http://', 'exp://');
    
    console.log('✅ Tunnel created!');
    console.log('🌐 URL: ' + tunnelUrl);
    console.log('📱 Expo URL: ' + expoUrl);
    
    // Test tunnel
    console.log('\nTesting tunnel connection...');
    const http = require('http');
    const https = require('https');
    const protocol = tunnelUrl.startsWith('https') ? https : http;
    
    protocol.get(tunnelUrl + '/status', (res) => {
      if (res.statusCode === 200) {
        console.log('✅ Tunnel is forwarding correctly!\n');
      } else {
        console.log('⚠️  Tunnel returned status: ' + res.statusCode + '\n');
      }
    }).on('error', (err) => {
      console.log('⚠️  Tunnel test failed: ' + err.message + '\n');
    });

    console.log('================================================');
    console.log('   SCAN THIS QR CODE:');
    console.log('================================================\n');

    qrcode.generate(expoUrl, { small: true }, (qr) => {
      console.log(qr);
    });

    console.log('\n================================================');
    console.log('📱 Scan with Expo Go app!');
    console.log('⚠️  Keep BOTH windows open:');
    console.log('   - Metro Bundler (running in background)');
    console.log('   - This tunnel window');
    console.log('\nPress Ctrl+C to stop\n');

    tunnel.on('close', () => {
      console.log('\nTunnel closed');
      process.exit();
    });

    tunnel.on('error', (err) => {
      console.error('Tunnel error:', err.message);
    });

  } catch (err) {
    console.error('Failed to create tunnel:', err.message);
    console.log('\nTroubleshooting:');
    console.log('  1. Check if Norton is blocking localtunnel.me');
    console.log('  2. Try disabling Norton temporarily');
    console.log('  3. Or use localhost mode instead\n');
    process.exit(1);
  }
})();

process.on('SIGINT', () => {
  console.log('\n\n👋 Stopping...\n');
  process.exit();
});
'@

# Write and run tunnel script
$tunnelScript | Out-File -FilePath "metro-tunnel.js" -Encoding UTF8

Write-Host "Starting LocalTunnel..." -ForegroundColor Gray
node metro-tunnel.js

# Cleanup
Write-Host ""
Write-Host "Stopping Metro..." -ForegroundColor Yellow
Stop-Job -Job $metroJob -ErrorAction SilentlyContinue
Remove-Job -Job $metroJob -ErrorAction SilentlyContinue
Remove-Item "metro-tunnel.js" -ErrorAction SilentlyContinue

Write-Host "Stopped." -ForegroundColor Gray


