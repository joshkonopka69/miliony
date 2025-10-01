#!/bin/bash

echo "🚀 Setting up SportMap for testing with friends..."

# Navigate to project directory
cd /home/hubi/SportMap/miliony

echo "📦 Installing dependencies..."
npm install

echo "🔧 Setting up environment..."
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please create it with your API keys."
    exit 1
fi

echo "🗄️ Setting up database..."
echo "Please run the following SQL scripts in your Supabase dashboard:"
echo "1. create-database-tables.sql"
echo "2. fix-database-schema.sql"
echo "3. fix-rls-policies.sql"

echo "🌐 Setting up ngrok for external access..."
if ! command -v ngrok &> /dev/null; then
    echo "Installing ngrok..."
    npm install -g ngrok
fi

echo "📱 Starting development server..."
echo "Choose your deployment method:"
echo "1. Expo Go (Quick testing)"
echo "2. Development Build (Full features)"
echo "3. Production Build (App store ready)"

read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo "📱 Starting Expo Go development server..."
        npx expo start --clear
        ;;
    2)
        echo "🔨 Creating development build..."
        if ! command -v eas &> /dev/null; then
            echo "Installing EAS CLI..."
            npm install -g @expo/eas-cli
        fi
        
        echo "Please login to Expo:"
        eas login
        
        echo "Creating development build..."
        eas build --profile development --platform android
        
        echo "📱 Install the generated APK on your devices"
        ;;
    3)
        echo "🏗️ Creating production build..."
        if ! command -v eas &> /dev/null; then
            echo "Installing EAS CLI..."
            npm install -g @expo/eas-cli
        fi
        
        echo "Please login to Expo:"
        eas login
        
        echo "Creating production build..."
        eas build --profile production --platform all
        
        echo "📱 Submit to app stores:"
        echo "eas submit --platform android"
        echo "eas submit --platform ios"
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Share the QR code or APK with your friend"
echo "2. Both users register in the app"
echo "3. Add each other as friends"
echo "4. Create events and test real-time features"
echo ""
echo "🔧 For ngrok setup:"
echo "1. Run: ngrok http 8081"
echo "2. Update Supabase URLs with ngrok URL"
echo "3. Test email confirmations"


