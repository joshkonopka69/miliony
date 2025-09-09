#!/bin/bash

echo "🗺️  SportMap - Interactive Maps Setup"
echo "======================================"
echo ""

echo "✅ Step 1: Packages already installed!"
echo "   - react-native-maps"
echo "   - react-native-geolocation-service"
echo "   - @react-native-async-storage/async-storage"
echo ""

echo "📋 Next Steps to Enable Real Maps:"
echo ""
echo "1. Get Google Maps API Key:"
echo "   • Go to https://console.cloud.google.com/"
echo "   • Create project or select existing"
echo "   • Enable Maps SDK for Android"
echo "   • Enable Places API (for search)"
echo "   • Create API Key"
echo ""

echo "2. Configure Android:"
echo "   • Edit android/app/src/main/AndroidManifest.xml"
echo "   • Add location permissions"
echo "   • Add Google Maps API key"
echo ""

echo "3. Replace placeholder with real map:"
echo "   • Uncomment imports in InteractiveMap.tsx"
echo "   • Replace placeholder component with MapView"
echo ""

echo "📖 Detailed instructions in MAPS_SETUP.md"
echo ""
echo "🚀 Current Status: Placeholder map with sports locations list"
echo "   Your app works now! Real map can be added later."
echo ""

# Check if API key is configured
if grep -q "YOUR_GOOGLE_MAPS_API_KEY" android/app/src/main/AndroidManifest.xml 2>/dev/null; then
    echo "⚠️  Google Maps API key not configured yet"
else
    echo "✅ Ready for interactive maps!"
fi




