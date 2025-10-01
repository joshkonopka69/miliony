#!/bin/bash

# SportMap Authentication Setup Script
echo "🔐 Setting up SportMap Authentication System..."
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << 'EOF'
# Firebase Configuration (Already configured)
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyB0IHLweZ7IN5rPxqvDWfuW_ACe70FfzNE
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=sportmap-cc906.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=sportmap-cc906
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=sportmap-cc906.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=853936038513
EXPO_PUBLIC_FIREBASE_APP_ID=1:853936038513:web:a1e55608786dacda6df1d0

# Supabase Configuration (YOU NEED TO REPLACE THESE)
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Google Maps API Key (YOU NEED TO REPLACE THIS)
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=your_google_maps_api_key_here
EOF
    echo "✅ .env file created!"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "📦 Installing additional dependencies for social authentication..."

# Install social auth dependencies
npm install @react-native-google-signin/google-signin @invertase/react-native-apple-authentication

echo ""
echo "🔧 Next steps:"
echo "1. Get your Supabase credentials from https://supabase.com/dashboard"
echo "2. Get your Google Maps API key from https://console.cloud.google.com/"
echo "3. Update the .env file with your actual keys"
echo "4. Set up the Supabase database using the SQL script in COMPLETE_AUTH_SETUP_GUIDE.md"
echo "5. Configure Firebase authentication providers"
echo ""
echo "📖 For detailed instructions, see: COMPLETE_AUTH_SETUP_GUIDE.md"
echo ""
echo "🧪 Test your setup with: npx expo start --localhost"

