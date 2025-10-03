# 🗺️ Google Maps & Firebase Setup Guide

## ✅ **Features Implemented:**

### 1. **Google Maps with Places API** 🗺️
- Interactive Google Maps using WebView (Expo Go compatible)
- Google Places API integration for place search
- Click on places to see details
- Real-time location services

### 2. **Interactive Place Details** 📍
- Beautiful place details modal
- **Yellow "Plan Event" button** as requested
- Place photos, ratings, and information
- "View on Maps" and "Directions" buttons

### 3. **Firebase Messaging** 💬
- Real-time message handling
- Push notifications support
- Message storage and retrieval
- User-to-user and group messaging

## 🔧 **Setup Instructions:**

### 1. **Create .env file in miliony directory:**

```bash
# Google Maps API Configuration
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Supabase Configuration  
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id_here
EXPO_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key_here

# Google OAuth Configuration
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_google_web_client_id_here

# Expo Configuration
EXPO_PROJECT_ID=your_expo_project_id_here
```

### 2. **Get Google Maps API Key:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable these APIs:
   - **Maps JavaScript API**
   - **Places API**
   - **Geocoding API**
4. Create credentials → API Key
5. Restrict the key to your domains

### 3. **Set up Firebase:**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Add a web app to your project
4. Copy the configuration values
5. Enable **Cloud Firestore** and **Cloud Messaging**

### 4. **Install Dependencies:**

```bash
cd miliony
npm install
```

### 5. **Run the App:**

```bash
npx expo start --clear
```

## 🎯 **How to Use:**

### **Google Maps Features:**
1. **View Map**: Interactive Google Maps with your location
2. **Search Places**: Use the search bar to find specific places
3. **Click Places**: Tap on any place marker to see details
4. **Place Details**: View photos, ratings, and information
5. **Plan Event**: Click the **yellow "Plan Event" button** to create events

### **Firebase Messaging:**
1. **Real-time Messages**: Messages appear instantly
2. **Push Notifications**: Get notified of new messages
3. **Group Chats**: Send messages to event participants
4. **Message History**: All messages are stored and retrievable

## 🎨 **UI Features:**

### **Place Details Modal:**
- ✅ **Yellow "Plan Event" button** (as requested)
- 📸 Place photos from Google Places
- ⭐ Ratings and price information
- 🗺️ "View on Maps" button
- 🧭 "Directions" button
- 📍 Place type and categories

### **Map Interaction:**
- 🎯 Click on any place marker
- 🔍 Search for specific places
- 📍 Your current location marker
- 🏃‍♂️ Sports venues highlighted

## 🚀 **Testing:**

1. **Open the app in Expo Go**
2. **Allow location permissions**
3. **Search for a place** (e.g., "gym near me")
4. **Click on a place marker**
5. **View place details**
6. **Click the yellow "Plan Event" button**

## 🐛 **Troubleshooting:**

### **If maps don't load:**
- Check your Google Maps API key
- Ensure APIs are enabled in Google Cloud Console
- Verify the API key has proper restrictions

### **If Firebase doesn't work:**
- Check Firebase configuration
- Ensure Firestore is enabled
- Verify project ID and keys

### **If place details don't show:**
- Check Google Places API is enabled
- Verify API key has Places API access
- Check console for errors

## 🎉 **Success!**

Your app now has:
- ✅ **Google Maps with Places API**
- ✅ **Interactive place details**
- ✅ **Yellow "Plan Event" button**
- ✅ **Firebase real-time messaging**
- ✅ **Expo Go compatibility**

All features work perfectly in Expo Go! 🚀

