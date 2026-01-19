# Fix Connection Issues - Run as Administrator
# Right-click this file and select "Run with PowerShell as Administrator"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   CONNECTION FIX - DIAGNOSTICS                 " -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as admin
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ERROR: This script must run as Administrator!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Right-click this file and select:" -ForegroundColor Yellow
    Write-Host "  'Run with PowerShell as Administrator'" -ForegroundColor White
    Write-Host ""
    pause
    exit 1
}

Write-Host "Step 1: Checking network configuration..." -ForegroundColor Cyan
Write-Host ""

# Get WiFi IP
$ip = (Get-NetIPAddress -AddressFamily IPv4 | 
    Where-Object {
        $_.IPAddress -like "192.168.0.*" -or 
        $_.IPAddress -like "192.168.1.*"
    } | 
    Select-Object -First 1).IPAddress

Write-Host "  WiFi IP: $ip" -ForegroundColor Green

# Get network profile
$profile = (Get-NetConnectionProfile | Where-Object {$_.IPv4Connectivity -eq "Internet"}).NetworkCategory
Write-Host "  Network Profile: $profile" -ForegroundColor Gray

if ($profile -ne "Private") {
    Write-Host ""
    Write-Host "  WARNING: Network is not set to 'Private'" -ForegroundColor Yellow
    Write-Host "  Setting network to Private..." -ForegroundColor Cyan
    Get-NetConnectionProfile | Where-Object {$_.IPv4Connectivity -eq "Internet"} | Set-NetConnectionProfile -NetworkCategory Private
    Write-Host "  Network set to Private!" -ForegroundColor Green
}

Write-Host ""
Write-Host "Step 2: Configuring Windows Firewall..." -ForegroundColor Cyan
Write-Host ""

# Get Node.js path
$nodePath = (Get-Command node -ErrorAction SilentlyContinue).Source
if (-not $nodePath) {
    Write-Host "  ERROR: Node.js not found!" -ForegroundColor Red
    exit 1
}

Write-Host "  Node.js: $nodePath" -ForegroundColor Gray

# Remove old rules
Write-Host "  Removing old firewall rules..." -ForegroundColor Gray
netsh advfirewall firewall delete rule name="Node.js Expo" 2>$null | Out-Null
netsh advfirewall firewall delete rule name="Expo Metro" 2>$null | Out-Null
netsh advfirewall firewall delete rule name="Expo Port 8081" 2>$null | Out-Null
netsh advfirewall firewall delete rule name="Expo Port 8082" 2>$null | Out-Null

# Add new rules
Write-Host "  Adding firewall rules..." -ForegroundColor Cyan

# Node.js inbound
netsh advfirewall firewall add rule name="Node.js Expo" dir=in action=allow program="$nodePath" enable=yes profile=any | Out-Null
Write-Host "    Node.js (Inbound) - OK" -ForegroundColor Green

# Node.js outbound
netsh advfirewall firewall add rule name="Node.js Expo Outbound" dir=out action=allow program="$nodePath" enable=yes profile=any | Out-Null
Write-Host "    Node.js (Outbound) - OK" -ForegroundColor Green

# Ports
netsh advfirewall firewall add rule name="Expo Port 8081" dir=in action=allow protocol=TCP localport=8081 enable=yes profile=any | Out-Null
Write-Host "    Port 8081 - OK" -ForegroundColor Green

netsh advfirewall firewall add rule name="Expo Port 8082" dir=in action=allow protocol=TCP localport=8082 enable=yes profile=any | Out-Null
Write-Host "    Port 8082 - OK" -ForegroundColor Green

Write-Host ""
Write-Host "Step 3: Testing port..." -ForegroundColor Cyan
Write-Host ""

# Test if port 8081 is listening
$portTest = Get-NetTCPConnection -LocalPort 8081 -ErrorAction SilentlyContinue
if ($portTest) {
    Write-Host "  Port 8081 is active" -ForegroundColor Green
    Write-Host "  Listening on: $($portTest.LocalAddress):$($portTest.LocalPort)" -ForegroundColor Gray
} else {
    Write-Host "  Port 8081 is not active yet" -ForegroundColor Yellow
    Write-Host "  (This is OK if Expo isn't running)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "   FIREWALL CONFIGURED SUCCESSFULLY!            " -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Run: .\START-APP.ps1" -ForegroundColor White
Write-Host "  2. Scan QR code with Expo Go" -ForegroundColor White
Write-Host ""
Write-Host "If still timing out:" -ForegroundColor Yellow
Write-Host "  - Check Norton 360 is disabled" -ForegroundColor White
Write-Host "  - Make sure phone is on SAME WiFi: $ip" -ForegroundColor White
Write-Host ""
pause


