# 🚨 Quick Supabase Fix

## **The Problem:**
Your app is crashing because Supabase credentials are missing from your `.env` file.

## **Quick Fix Options:**

### **Option 1: Add Your Real Supabase Keys (Recommended)**

1. **Get your Supabase credentials:**
   - Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your project (or create one)
   - Go to **Settings** → **API**
   - Copy the **Project URL** and **anon key**

2. **Add them to your `.env` file:**
   ```bash
   # Edit your .env file
   nano .env
   
   # Add these lines:
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```

### **Option 2: Temporary Mock Values (For Testing)**

If you want to test the app without Supabase for now:

```bash
# Add these temporary values to .env
EXPO_PUBLIC_SUPABASE_URL=https://mock.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=mock_key_for_testing
```

### **Option 3: Use the Interactive Script**

```bash
./add-api-keys.sh
```

## **After Adding Keys:**

1. **Restart Expo:**
   ```bash
   # Stop current server (Ctrl+C)
   npx expo start --localhost
   ```

2. **Verify setup:**
   ```bash
   node check-setup.js
   ```

## **What You Need:**

### **Supabase URL Format:**
```
https://your-project-id.supabase.co
```

### **Supabase Anon Key Format:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvdXItcHJvamVjdCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjQwOTk1MjAwLCJleHAiOjE5NTY1NzEyMDB9.your_signature_here
```

## **Quick Test:**

After adding keys, your app should load without the Supabase error!

🎯 **Your app will work with Firebase features even without Supabase keys, but you'll need them for the full database functionality.**

