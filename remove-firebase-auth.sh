#!/bin/bash

# Remove Firebase Auth completely and use only Supabase
echo "🔧 Removing Firebase Auth dependencies..."

# 1. Remove Firebase auth imports from config
sed -i 's/import { getAuth, connectAuthEmulator } from '\''firebase\/auth'\'';//' src/config/firebase.ts
sed -i 's/auth = getAuth(app);//' src/config/firebase.ts

# 2. Comment out the old authService.ts file
echo "// DISABLED: Using simpleAuthService instead" > src/services/authService.ts.backup
cat src/services/authService.ts >> src/services/authService.ts.backup
echo "// DISABLED: Using simpleAuthService instead" > src/services/authService.ts

# 3. Update any remaining imports
find src -name "*.tsx" -o -name "*.ts" | xargs grep -l "authService" | xargs sed -i 's/authService/simpleAuthService/g'

echo "✅ Firebase Auth removed successfully!"
echo "📱 Your app should now work with Supabase-only authentication"

