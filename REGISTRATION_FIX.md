# Registration Fix Guide

## Problem
Registration is failing - need to identify and fix the issue.

## Common Issues & Solutions

### 1. Supabase Email Confirmation
**Problem:** Supabase requires email confirmation by default  
**Solution:** Disable email confirmation for development

Go to Supabase Dashboard > Authentication > Settings > Email Auth
- Disable "Enable email confirmations"
- Or set "Confirm email" to OFF

### 2. Check Environment Variables
Run this to verify your .env is loaded:
```bash
cd /home/hubi/SportMap/miliony
cat .env | grep SUPABASE
```

Should show:
- EXPO_PUBLIC_SUPABASE_URL=https://qqxpvrbdcyedescyxesu.supabase.co
- EXPO_PUBLIC_SUPABASE_ANON_KEY=(long key)

### 3. Test Supabase Connection
Create a test file to check if Supabase is working:

```typescript
// Test in browser console or create test file
import { supabase } from './src/services/supabase';

// Test connection
const testConnection = async () => {
  const { data, error } = await supabase.auth.signUp({
    email: 'test@example.com',
    password: 'test123456'
  });
  console.log('Result:', data, error);
};
```

### 4. Check Supabase Auth Settings
1. Go to: https://qqxpvrbdcyedescyxesu.supabase.co
2. Click: Authentication > Settings
3. Verify:
   - Site URL: http://localhost:8083 (for development)
   - Enable "Allow new users to sign up"
   - Disable "Enable email confirmations" (for testing)

### 5. Manual Test User Creation
If registration still fails, create user manually:

1. Go to Supabase > Authentication > Users
2. Click "Add User"
3. Email: test@sportmap.com
4. Password: Test123456
5. Check "Auto Confirm User"
6. Click "Create User"

Then run the SQL in CREATE_TEST_USER.sql with the user's ID.

## Quick Fix Commands

```bash
# 1. Kill all expo processes
pkill -9 -f "expo start"

# 2. Clear all caches
cd /home/hubi/SportMap/miliony
rm -rf .expo
rm -rf node_modules/.cache

# 3. Start fresh
npx expo start --clear --port 8085
```

## Debug Steps

1. Check terminal for errors when you try to register
2. Check phone/Expo Go for error messages
3. Check Supabase Dashboard > Authentication > Logs for errors
4. Check Supabase Dashboard > Database > Tables > users to see if user was created

## Most Likely Issues

1. **Email confirmation required** - Disable in Supabase settings
2. **Weak password** - Use password with 6+ characters
3. **Duplicate user** - Try different email
4. **Network issue** - Check internet connection

