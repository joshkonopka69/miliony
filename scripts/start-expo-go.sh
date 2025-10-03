#!/bin/bash

# Script to start the app in Expo Go
echo "🚀 Starting SportMap in Expo Go..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the miliony directory"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Clear Expo cache
echo "🧹 Clearing Expo cache..."
npx expo start --clear

echo ""
echo "✅ App should now be running in Expo Go!"
echo "📱 Open the Expo Go app on your phone and scan the QR code"
echo "🌐 Or press 'w' to open in web browser"


