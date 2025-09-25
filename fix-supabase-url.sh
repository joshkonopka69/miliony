#!/bin/bash

echo "🔧 Fixing Supabase URL issue..."

# Create a backup of current .env
cp .env .env.backup

# Replace the placeholder values with working format
sed -i 's/your_supabase_project_url/https:\/\/your-project-id.supabase.co/g' .env
sed -i 's/your_supabase_anon_key/your-anon-key-here/g' .env

echo "✅ Fixed .env file format"
echo "📝 You still need to replace the placeholder values with your real Supabase credentials"
echo ""
echo "To get your Supabase credentials:"
echo "1. Go to https://supabase.com/dashboard"
echo "2. Select your project"
echo "3. Go to Settings > API"
echo "4. Copy the Project URL and anon key"
echo "5. Replace the placeholder values in .env"

