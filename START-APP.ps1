# Start Expo App - Direct WiFi Connection
# Phone and PC must be on the same WiFi network

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   STARTING EXPO APP                            " -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Get the real WiFi IP (your actual WiFi network, not virtual adapters)
$ip = (Get-NetIPAddress -AddressFamily IPv4 | 
    Where-Object {
        $_.IPAddress -like "192.168.0.*" -or 
        $_.IPAddress -like "192.168.1.*" -or
        ($_.IPAddress -like "10.*" -and $_.InterfaceAlias -notlike "*VirtualBox*" -and $_.InterfaceAlias -notlike "*VMware*")
    } | 
    Select-Object -First 1).IPAddress

if (-not $ip) {
    Write-Host "ERROR: Could not find WiFi IP address!" -ForegroundColor Red
    Write-Host "Make sure you're connected to WiFi." -ForegroundColor Yellow
    exit 1
}

Write-Host "Your WiFi IP: $ip" -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANT:" -ForegroundColor Yellow
Write-Host "  - Make sure your phone is on the SAME WiFi network" -ForegroundColor White
Write-Host "  - Scan the QR code with Expo Go app" -ForegroundColor White
Write-Host ""

# Set environment variables and start Expo
Write-Host "Starting Expo on $ip..." -ForegroundColor Cyan
Write-Host ""
$env:EXPO_NO_DOCTOR = "1"
$env:REACT_NATIVE_PACKAGER_HOSTNAME = $ip
npx expo start --lan

