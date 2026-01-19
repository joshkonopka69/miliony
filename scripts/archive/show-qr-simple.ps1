# Simple QR Code Generator
# Run this AFTER Metro is already running

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   Create Tunnel + Show QR Code                " -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Metro is running
Write-Host "Checking if Metro is running..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8081/status" -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
    Write-Host "✅ Metro is running!" -ForegroundColor Green
} catch {
    Write-Host "❌ Metro is NOT running!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please start Metro first:" -ForegroundColor Yellow
    Write-Host "  npx expo start --localhost" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Then run this script again." -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host ""
Write-Host "Creating LocalTunnel..." -ForegroundColor Cyan
Write-Host ""

# Create simple tunnel
node -e "const lt = require('localtunnel'); const qr = require('qrcode-terminal'); (async () => { const tunnel = await lt({ port: 8081 }); const url = tunnel.url.replace('https://', 'exp://'); console.log('\n✅ Tunnel URL: ' + tunnel.url); console.log('📱 Expo URL: ' + url); console.log('\n================================================'); console.log('   SCAN THIS QR CODE:'); console.log('================================================\n'); qr.generate(url, { small: true }); console.log('\n================================================'); console.log('✅ Ready! Scan with Expo Go'); console.log('⚠️  Keep this window open!'); console.log('\nPress Ctrl+C to stop\n'); await new Promise(() => {}); })();"

Write-Host ""
Write-Host "Tunnel stopped." -ForegroundColor Gray


