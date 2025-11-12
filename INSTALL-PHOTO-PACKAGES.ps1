# ============================================
# INSTALL PACKAGES FOR PROFILE PHOTO UPLOAD
# ============================================

Write-Host ""
Write-Host "===========================================
" -ForegroundColor Cyan
Write-Host "  Installing Profile Photo Upload Packages" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📦 Installing expo-image-picker..." -ForegroundColor Yellow
npx expo install expo-image-picker

Write-Host ""
Write-Host "📦 Installing expo-file-system..." -ForegroundColor Yellow
npx expo install expo-file-system

Write-Host ""
Write-Host "📦 Installing base64-arraybuffer..." -ForegroundColor Yellow
npm install base64-arraybuffer

Write-Host ""
Write-Host "✅ All packages installed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "🔧 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Set up Supabase Storage (see TASK_2_PROFILE_PHOTO_UPLOAD_SETUP.md)" -ForegroundColor White
Write-Host "   2. Create 'avatars' bucket (public)" -ForegroundColor White
Write-Host "   3. Add 4 RLS policies" -ForegroundColor White
Write-Host "   4. Restart Expo: cd miliony; npx expo start" -ForegroundColor White
Write-Host ""



