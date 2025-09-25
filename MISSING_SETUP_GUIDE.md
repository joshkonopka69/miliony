# 🚨 Missing Setup Guide for SportMap

## 📋 **What's Missing in Your Code**

### 1. **Missing Dependencies** ✅ FIXED
- ✅ Added `@supabase/supabase-js` to package.json
- ✅ Firebase dependencies are already installed

### 2. **Missing Environment File**
You need to create a `.env` file (copy from `env.example`):

```bash
cp env.example .env
```

### 3. **Missing API Keys in Code**
Your code references these environment variables but they're not set:

## 🔑 **API Keys You Need to Find**

### **Firebase API Keys** (Required)
1. **Go to [Firebase Console](https://console.firebase.google.com/)**
2. **Create a new project** or select existing
3. **Go to Project Settings** → **General** tab
4. **Scroll down to "Your apps"** → **Add app** → **Web**
5. **Copy these values:**

```env
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy... (from config object)
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789 (from Cloud Messaging)
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef (from config object)
```

### **Supabase API Keys** (Required)
1. **Go to [Supabase Console](https://supabase.com/dashboard)**
2. **Create a new project** or select existing
3. **Go to Settings** → **API**
4. **Copy these values:**

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (anon/public key)
```

### **Google Maps API Key** (Required for maps)
1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**
2. **Create a new project** or select existing
3. **Enable APIs:**
   - Maps JavaScript API
   - Maps SDK for Android
   - Maps SDK for iOS
   - Places API
   - Geocoding API
4. **Go to Credentials** → **Create Credentials** → **API Key**
5. **Restrict the key** (recommended):
   - Application restrictions: Android/iOS apps
   - API restrictions: Select the APIs above

```env
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSy... (your Google Maps API key)
EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=AIzaSy... (same key, or create separate one)
```

## 🛠️ **Setup Steps**

### **Step 1: Install Dependencies**
```bash
cd /home/hubi/SportMap/miliony
npm install
```

### **Step 2: Create Environment File**
```bash
cp env.example .env
```

### **Step 3: Fill in Your API Keys**
Edit `.env` file with your actual API keys:

```env
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your_actual_firebase_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_actual_supabase_anon_key

# Google Maps API Key
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_google_maps_api_key
EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=your_actual_google_places_api_key
```

### **Step 4: Set Up Supabase Database**
1. **Run the SQL script** in Supabase SQL Editor:
   - Copy content from `SUPABASE_COMPLETE_SETUP.sql`
   - Paste in Supabase → SQL Editor
   - Click "Run"

### **Step 5: Set Up Firebase Firestore**
1. **Follow the guide** in `FIREBASE_FIRESTORE_SETUP.md`
2. **Create collections** as described
3. **Set up security rules**

### **Step 6: Update Google Maps Configuration**
Update your `app.json` with your actual Google Maps API key:

```json
{
  "expo": {
    "ios": {
      "config": {
        "googleMapsApiKey": "your_actual_google_maps_api_key"
      }
    },
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "your_actual_google_maps_api_key"
        }
      }
    }
  }
}
```

## 🔍 **Where to Find Each API Key**

### **Firebase Console**
1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Select your project
3. Click ⚙️ → **Project Settings**
4. Scroll to **"Your apps"** section
5. Click **"Add app"** → **Web** (🌐 icon)
6. Register your app and copy the config object

### **Supabase Dashboard**
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy **Project URL** and **anon public** key

### **Google Cloud Console**
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Select your project
3. Go to **APIs & Services** → **Credentials**
4. Click **"+ CREATE CREDENTIALS"** → **API key**
5. Copy the generated key

## ⚠️ **Important Notes**

1. **Never commit your `.env` file** to version control
2. **Restrict your API keys** for security
3. **Test each service** after setup
4. **Keep your keys secure** and rotate them regularly

## 🧪 **Test Your Setup**

Create a test file `src/test-setup.ts`:

```typescript
import { supabaseService } from './services/supabase';
import { firebaseService } from './services/firebase';

export const testSetup = async () => {
  console.log('Testing Supabase connection...');
  const user = await supabaseService.getCurrentUser();
  console.log('Supabase:', user ? 'Connected' : 'Not connected');
  
  console.log('Testing Firebase connection...');
  const events = await firebaseService.getLiveEvents();
  console.log('Firebase:', events ? 'Connected' : 'Not connected');
};
```

## 🚀 **Next Steps After Setup**

1. **Run the app**: `npm start`
2. **Test each service** individually
3. **Set up real Firebase project** (replace mock services)
4. **Configure push notifications**
5. **Test real-time features**

Your SportMap app will be ready for real-time sports events! 🏆
