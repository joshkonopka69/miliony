#!/bin/bash

echo "🔧 Fixing SportMap app issues..."

# Navigate to project directory
cd /home/hubi/SportMap/miliony

echo "📦 Installing missing dependencies..."
npm install expo-haptics expo-router react-native-safe-area-context

echo "🧹 Clearing Metro cache..."
npx expo start --clear --no-dev --minify

echo "🔄 Restarting development server..."
npx expo start

echo "✅ All fixes applied! Your app should now run without errors."


