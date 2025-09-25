#!/bin/bash

# Setup environment file for SportMap
echo "🔧 Setting up SportMap environment..."

# Create .env file with Firebase credentials
cat > .env << 'EOF'
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyB0IHLweZ7IN5rPxqvDWfuW_ACe70FfzNE
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=sportmap-cc906.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=sportmap-cc906
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=sportmap-cc906.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=853936038513
EXPO_PUBLIC_FIREBASE_APP_ID=1:853936038513:web:a1e55608786dacda6df1d0

# Supabase Configuration (You need to get these from Supabase)
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Maps API Key (You need to get this from Google Cloud Console)
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Google Places API Key (You need to get this from Google Cloud Console)
EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=your_google_places_api_key
EOF

echo "✅ .env file created with your Firebase credentials!"
echo ""
echo "📝 Next steps:"
echo "1. Get Supabase credentials from https://supabase.com/dashboard"
echo "2. Get Google Maps API key from https://console.cloud.google.com/"
echo "3. Update the .env file with your actual keys"
echo ""
echo "🔍 To get Supabase credentials:"
echo "   - Go to https://supabase.com/dashboard"
echo "   - Create a new project or select existing"
echo "   - Go to Settings → API"
echo "   - Copy Project URL and anon public key"
echo ""
echo "🔍 To get Google Maps API key:"
echo "   - Go to https://console.cloud.google.com/"
echo "   - Create a new project or select existing"
echo "   - Enable APIs: Maps JavaScript API, Places API, Geocoding API"
echo "   - Create API Key and restrict it"
echo ""
echo "🧪 Test your setup with: npm start"
