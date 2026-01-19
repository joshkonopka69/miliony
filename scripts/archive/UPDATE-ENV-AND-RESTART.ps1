# Quick Script to Update .env and Restart Expo
# Run this from PowerShell

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  MapScreen API Keys Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (Test-Path ".env") {
    Write-Host "✅ Found .env file" -ForegroundColor Green
    
    # Read current content
    $currentContent = Get-Content ".env" -Raw
    
    # Check if API keys already exist
    if ($currentContent -match "EXPO_PUBLIC_GOOGLE_MAPS_API_KEY") {
        Write-Host "⚠️  Google Maps API key already exists in .env" -ForegroundColor Yellow
        Write-Host "   Skipping to avoid duplication." -ForegroundColor Yellow
    } else {
        Write-Host "📝 Adding Google API keys to .env..." -ForegroundColor Cyan
        
        # Add API keys
        $apiKeys = @"

# Google Maps & Places API Configuration
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyD6nUmyKQ_9EqPpv4axk8J5YhZlI9J0fak
EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=AIzaSyDBJ65DOu4WMoTRjvz1J6i6VbYbjOoEW2E
"@
        
        Add-Content -Path ".env" -Value $apiKeys
        Write-Host "✅ API keys added to .env!" -ForegroundColor Green
    }
} else {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    Write-Host "   Make sure you're in the miliony directory" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Restarting Expo with Clear Cache" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "🔄 Clearing Expo cache and restarting..." -ForegroundColor Cyan
Write-Host ""

# Stop any running Expo processes (optional)
# Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {$_.CommandLine -like "*expo*"} | Stop-Process -Force

# Start Expo with clear cache
Write-Host "Running: npx expo start --clear" -ForegroundColor Yellow
Write-Host ""

npx expo start --clear

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Next Steps" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. ✅ Scan QR code with Expo Go" -ForegroundColor Green
Write-Host "2. ✅ Navigate to MapScreen" -ForegroundColor Green
Write-Host "3. ✅ Check console for success messages" -ForegroundColor Green
Write-Host ""
Write-Host "Expected console output:" -ForegroundColor Cyan
Write-Host "  🔑 Google Maps API Key: ✅ Loaded"
Write-Host "  🔑 Google Places API Key: ✅ Loaded"
Write-Host "  ✅ Fetched X events successfully"
Write-Host ""


