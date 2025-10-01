#!/bin/bash

# Development build script for SportMap
echo "🚀 Creating development build for SportMap..."

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo "❌ EAS CLI not found. Installing..."
    npm install -g @expo/eas-cli
fi

# Login to Expo (if not already logged in)
echo "🔐 Checking Expo authentication..."
eas whoami || eas login

# Create development build
echo "📱 Creating development build..."
eas build --profile development --platform all

echo "✅ Development build created successfully!"
echo "📲 Install the development build on your device to test push notifications."


