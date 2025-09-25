#!/bin/bash

echo "🔑 SportMap API Keys Setup"
echo "=========================="
echo ""
echo "Please provide your API keys when prompted:"
echo ""

# Function to add or update environment variable
add_env_var() {
    local var_name=$1
    local var_description=$2
    
    echo "Enter your $var_description:"
    read -r value
    
    if [ -n "$value" ]; then
        # Check if variable already exists in .env
        if grep -q "^$var_name=" .env; then
            # Update existing variable
            sed -i "s|^$var_name=.*|$var_name=$value|" .env
            echo "✅ Updated $var_name"
        else
            # Add new variable
            echo "$var_name=$value" >> .env
            echo "✅ Added $var_name"
        fi
    else
        echo "⚠️  Skipped $var_name (empty value)"
    fi
    echo ""
}

# Add Supabase keys
echo "📊 SUPABASE SETUP"
echo "=================="
echo "Get these from: https://supabase.com/dashboard → Your Project → Settings → API"
echo ""
add_env_var "EXPO_PUBLIC_SUPABASE_URL" "Supabase Project URL"
add_env_var "EXPO_PUBLIC_SUPABASE_ANON_KEY" "Supabase Anonymous Key"

echo ""
echo "🗺️  GOOGLE MAPS SETUP"
echo "======================"
echo "Get these from: https://console.cloud.google.com/ → APIs & Services → Credentials"
echo ""
add_env_var "EXPO_PUBLIC_GOOGLE_MAPS_API_KEY" "Google Maps API Key"
add_env_var "EXPO_PUBLIC_GOOGLE_PLACES_API_KEY" "Google Places API Key"

echo ""
echo "🎉 API Keys Setup Complete!"
echo "=========================="
echo ""
echo "Next steps:"
echo "1. Run: node check-setup.js (to verify all keys)"
echo "2. Run: npm start (to test your app)"
echo "3. Set up databases (see setup guides)"
echo ""

