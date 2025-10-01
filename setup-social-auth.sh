#!/bin/bash

echo "🚀 Setting up Social Authentication for SportMap"
echo "================================================"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Google OAuth Configuration
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_google_web_client_id_here

# Apple OAuth Configuration  
EXPO_PUBLIC_APPLE_SERVICE_ID=your_apple_service_id_here

# Supabase Configuration (if not already set)
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
EOF
    echo "✅ .env file created. Please update it with your actual credentials."
else
    echo "✅ .env file already exists."
fi

# Check if app.json needs updating
echo ""
echo "📱 Checking app.json configuration..."

# Check if Google Sign-In plugin is configured
if ! grep -q "@react-native-google-signin/google-signin" app.json; then
    echo "⚠️  Google Sign-In plugin not found in app.json"
    echo "   Please add the following to your app.json:"
    echo ""
    echo '   "plugins": ['
    echo '     ['
    echo '       "@react-native-google-signin/google-signin",'
    echo '       {'
    echo '         "iosUrlScheme": "com.yourcompany.sportmap"'
    echo '       }'
    echo '     ],'
    echo '     "expo-apple-authentication"'
    echo '   ]'
    echo ""
fi

# Check if Apple Authentication plugin is configured
if ! grep -q "expo-apple-authentication" app.json; then
    echo "⚠️  Apple Authentication plugin not found in app.json"
    echo "   Please add 'expo-apple-authentication' to your plugins array"
    echo ""
fi

echo ""
echo "🔧 Next Steps:"
echo "=============="
echo ""
echo "1. 📋 Google Cloud Console Setup:"
echo "   - Go to https://console.cloud.google.com/"
echo "   - Create/select your project"
echo "   - Enable Google+ API"
echo "   - Create OAuth 2.0 credentials for:"
echo "     • Android (with your package name and SHA-1)"
echo "     • iOS (with your bundle identifier)"
echo "     • Web (for Expo development)"
echo ""
echo "2. 🍎 Apple Developer Console Setup:"
echo "   - Go to https://developer.apple.com/"
echo "   - Create App ID with Sign In with Apple capability"
echo "   - Configure your bundle identifier"
echo ""
echo "3. 🗄️  Supabase Configuration:"
echo "   - Go to your Supabase Dashboard"
echo "   - Navigate to Authentication → Providers"
echo "   - Enable Google and Apple providers"
echo "   - Add your OAuth credentials"
echo ""
echo "4. 📝 Update .env file with your credentials:"
echo "   - EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID"
echo "   - EXPO_PUBLIC_APPLE_SERVICE_ID"
echo "   - EXPO_PUBLIC_SUPABASE_URL"
echo "   - EXPO_PUBLIC_SUPABASE_ANON_KEY"
echo ""
echo "5. 🔄 Update app.json with the required plugins"
echo ""
echo "6. 🧪 Test the authentication:"
echo "   - Run: npm start"
echo "   - Test on both iOS and Android devices"
echo ""
echo "📚 For detailed instructions, see: SOCIAL_AUTH_IMPLEMENTATION_GUIDE.md"
echo ""
echo "✅ Setup script completed!"
