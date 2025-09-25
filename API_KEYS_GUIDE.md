# 🔑 API Keys Setup Guide

## 📊 **Supabase Keys**

### **Where to get them:**
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project (or create one)
3. Go to **Settings** → **API**
4. Copy the values:

```bash
# Project URL (looks like: https://your-project.supabase.co)
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

# Anonymous Key (long string starting with eyJ...)
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🗺️ **Google Maps Keys**

### **Where to get them:**
1. Go to [https://console.cloud.google.com/](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **API Key**
5. Copy the API key (same key for both):

```bash
# Google Maps API Key (same key for both)
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyB0IHLweZ7IN5rPxqvDWfuW_ACe70FfzNE
EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=AIzaSyB0IHLweZ7IN5rPxqvDWfuW_ACe70FfzNE
```

### **Enable Required APIs:**
In Google Cloud Console, enable these APIs:
- **Maps JavaScript API**
- **Places API**
- **Geocoding API**
- **Directions API**

---

## 🚀 **Quick Setup Commands**

### **Option 1: Interactive Setup**
```bash
./add-api-keys.sh
```

### **Option 2: Manual Setup**
Edit your `.env` file and add:
```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Google Maps
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key_here
EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=your_google_maps_key_here
```

### **Verify Setup**
```bash
node check-setup.js
```

---

## 🎯 **What Each Key Does**

| Key | Purpose | Used For |
|-----|---------|----------|
| `EXPO_PUBLIC_SUPABASE_URL` | Database connection | User data, events, sports |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Database authentication | Secure data access |
| `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` | Map display | Showing maps in app |
| `EXPO_PUBLIC_GOOGLE_PLACES_API_KEY` | Location search | Finding venues, addresses |

---

## 🔧 **Troubleshooting**

### **If keys don't work:**
1. **Check spelling** in `.env` file
2. **Restart Expo** after adding keys
3. **Verify API quotas** in Google Cloud Console
4. **Check Supabase project** is active

### **Test your setup:**
```bash
# Check all keys are present
node check-setup.js

# Test Firebase connection
node -e "import('./src/test-firebase.js').then(m => m.testFirebaseConnection())"

# Start your app
npm start
```

---

## 🎉 **Ready to Go!**

Once you have all keys:
1. ✅ **Firebase** - Already configured
2. ✅ **Supabase** - Add your keys
3. ✅ **Google Maps** - Add your keys
4. ✅ **Test everything** - Run the app!

Your SportMap will be fully functional! 🏆

