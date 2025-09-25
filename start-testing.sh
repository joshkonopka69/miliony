#!/bin/bash

# SportMap Expo Testing Starter
echo "🏆 Starting SportMap Testing..."
echo ""

# Check if Expo is already running
if pgrep -f "expo start" > /dev/null; then
    echo "✅ Expo is already running!"
    echo ""
    echo "📱 To test your app:"
    echo "1. Install Expo Go on your phone"
    echo "2. Scan the QR code in your terminal"
    echo "3. Or run: npm run ios (for iOS Simulator)"
    echo "4. Or run: npm run android (for Android Emulator)"
    echo ""
    echo "🧪 To test event features:"
    echo "1. Open the app on your device"
    echo "2. Tap '🧪 Test Events & Chat' on welcome screen"
    echo "3. Test event creation and messaging"
    echo ""
    echo "👥 To test with friends:"
    echo "1. Share the QR code with your friend"
    echo "2. Both scan the same QR code"
    echo "3. Test real-time events and messaging"
    echo ""
else
    echo "🚀 Starting Expo development server..."
    echo ""
    echo "📱 After Expo starts:"
    echo "1. Install Expo Go on your phone"
    echo "2. Scan the QR code that appears"
    echo "3. Your SportMap app will load"
    echo ""
    echo "🧪 To test event features:"
    echo "1. Tap '🧪 Test Events & Chat' on welcome screen"
    echo "2. Test event creation and messaging"
    echo ""
    echo "👥 To test with friends:"
    echo "1. Share the QR code with your friend"
    echo "2. Both scan the same QR code"
    echo "3. Test real-time events and messaging"
    echo ""
    
    # Start Expo
    npm start
fi

