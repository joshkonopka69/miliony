# Fix Windows Firewall for Expo
# Allows Node.js to accept connections

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   Fix Windows Firewall for Expo               " -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "This will add Node.js to Windows Firewall exceptions" -ForegroundColor Yellow
Write-Host ""

# Check if running as admin
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ERROR: Not running as Administrator!" -ForegroundColor Red
    Write-Host ""
    Write-Host "To run as admin:" -ForegroundColor Yellow
    Write-Host "  1. Right-click PowerShell" -ForegroundColor Gray
    Write-Host "  2. Select 'Run as Administrator'" -ForegroundColor Gray
    Write-Host "  3. Run this script again" -ForegroundColor Gray
    Write-Host ""
    pause
    exit 1
}

Write-Host "Step 1: Finding Node.js executable..." -ForegroundColor Cyan
$nodePath = (Get-Command node -ErrorAction SilentlyContinue).Source

if (-not $nodePath) {
    Write-Host "ERROR: Node.js not found in PATH!" -ForegroundColor Red
    Write-Host "Please install Node.js first" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "Found Node.js at: $nodePath" -ForegroundColor Green

Write-Host ""
Write-Host "Step 2: Adding Node.js to Windows Firewall..." -ForegroundColor Cyan

try {
    # Add Node.js to Windows Firewall exceptions
    New-NetFirewallRule -DisplayName "Node.js Expo Development" -Direction Inbound -Protocol TCP -LocalPort 8081,8080,19000,19001,19002 -Action Allow -Program $nodePath -ErrorAction Stop
    Write-Host "✅ Added Node.js to Windows Firewall" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to add firewall rule: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Manual steps:" -ForegroundColor Yellow
    Write-Host "  1. Open Windows Defender Firewall" -ForegroundColor Gray
    Write-Host "  2. Click 'Allow an app through firewall'" -ForegroundColor Gray
    Write-Host "  3. Add Node.js: $nodePath" -ForegroundColor Gray
    Write-Host "  4. Allow on both Private and Public networks" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Step 3: Testing ports..." -ForegroundColor Cyan

# Test if ports are accessible
$ports = @(8081, 8080, 19000)
foreach ($port in $ports) {
    try {
        $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any, $port)
        $listener.Start()
        $listener.Stop()
        Write-Host "  Port ${port}: Available" -ForegroundColor Green
    } catch {
        Write-Host "  Port ${port}: Blocked or in use" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Firewall configured!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Now try: .\start-expo-easy.ps1" -ForegroundColor Cyan
Write-Host ""

pause
