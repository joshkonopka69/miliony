# 🗺️ MapScreen Setup Manual
## Complete Guide to Make Your MapScreen Work

---

## 📋 **TABLE OF CONTENTS**

1. [Current Status Analysis](#current-status-analysis)
2. [Required API Keys](#required-api-keys)
3. [Step-by-Step Setup](#step-by-step-setup)
4. [Missing Components](#missing-components)
5. [Implementation Checklist](#implementation-checklist)
6. [Testing Guide](#testing-guide)
7. [Troubleshooting](#troubleshooting)

---

## 🔍 **CURRENT STATUS ANALYSIS**

### ✅ **What's Already Working:**
- ✅ MapScreen.tsx exists with basic structure
- ✅ EnhancedInteractiveMap component implemented
- ✅ Supabase integration working (events fetching)
- ✅ Location permissions configured
- ✅ Real-time event updates subscribed
- ✅ Google Places Service created (`src/services/googlePlacesService.ts`)
- ✅ Multiple modals already created:
  - EventCreationModal
  - LocationDetailsModal
  - EventDetailsModal
  - ActivityFilterModal
  - PlaceDetailsModal
  - PlaceInfoModal

### ❌ **What's Missing:**
- ❌ Google Maps API key not configured
- ❌ Google Places API key not configured
- ❌ Filter bar with sport venue categories not implemented
- ❌ Custom location markers not implemented
- ❌ Google Places API integration not connected to MapScreen
- ❌ Create Event functionality not fully integrated

---

## 🔑 **REQUIRED API KEYS**

You need to configure **TWO** Google API keys:

### 1. **Google Maps JavaScript API Key**
**Purpose:** Display interactive maps
**Used in:** `GoogleMapsView.tsx`, map rendering

### 2. **Google Places API Key**  
**Purpose:** Search for nearby venues, get place details, photos
**Used in:** `googlePlacesService.ts`, location search

---

## 📝 **STEP-BY-STEP SETUP**

### **STEP 1: Get Google API Keys (15 minutes)**

#### **A. Go to Google Cloud Console**
1. Visit: https://console.cloud.google.com/
2. Sign in with your Google account
3. Create a new project (or select existing):
   - Click "Select a project" → "New Project"
   - Name: `SportMap`
   - Click "Create"

#### **B. Enable Required APIs**
1. Go to "APIs & Services" → "Library"
2. Search and enable these **3 APIs**:
   - ✅ **Maps JavaScript API**
   - ✅ **Places API** (new version)
   - ✅ **Geocoding API**

#### **C. Create API Keys**
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API Key"
3. Copy the key immediately (you'll need it in Step 2)
4. **IMPORTANT:** Click "Restrict Key" to secure it:
   - **Application restrictions:** 
     - Select "HTTP referrers (websites)" for development
     - Add: `localhost/*`, `*.expo.dev/*`, `*.expo.io/*`
   - **API restrictions:**
     - Select "Restrict key"
     - Select: Maps JavaScript API, Places API, Geocoding API
   - Click "Save"

> **💡 TIP:** For development, you can use the same API key for both Maps and Places. For production, create separate keys.

---

### **STEP 2: Configure Environment Variables (2 minutes)**

Open your `.env` file in the `miliony` directory and add:

```bash
# ===================================
# GOOGLE MAPS & PLACES API KEYS
# ===================================
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSy...your_actual_key_here
EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=AIzaSy...your_actual_key_here

# ===================================
# SUPABASE (Already Configured ✅)
# ===================================
EXPO_PUBLIC_SUPABASE_URL=https://ujfeqshqhlplmolfrlvc.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ IMPORTANT:** Replace `AIzaSy...your_actual_key_here` with your **actual** API keys from Step 1!

---

### **STEP 3: Update app.config.js (Android/iOS)**

Open `miliony/app.config.js` and add the Google Maps configuration:

```javascript
// App configuration for Expo
export default {
  expo: {
    name: "SportMap",
    slug: "sportmap",
    version: "1.0.0",
    owner: "hubertdomagala",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.sportmap.app",
      // 👇 ADD THIS FOR iOS
      config: {
        googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || ""
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.sportmap.app",
      // 👇 ADD THIS FOR Android
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || ""
        }
      }
    },
    web: {
      favicon: "./assets/favicon.png",
      bundler: "metro"
    },
    plugins: [
      "expo-router",
      [
        "expo-notifications",
        {
          icon: "./assets/icon.png",
          color: "#ffffff",
          defaultChannel: "default"
        }
      ],
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission: "Allow SportMap to use your location to find nearby sports venues and events."
        }
      ],
      "expo-maps"
    ],
    extra: {
      eas: {
        projectId: "372e8a03-e24f-4695-9ec5-f86f6408a7fa"
      }
    }
  }
};
```

---

### **STEP 4: Install Missing Dependencies (if needed)**

Check if these packages are installed:

```powershell
cd "C:\Users\Adrian\Nowy folder\miliony"
npm list react-native-maps react-native-map-clustering @react-native-community/datetimepicker @react-native-picker/picker lodash
```

If any are missing, install them:

```powershell
npm install react-native-maps react-native-map-clustering @react-native-community/datetimepicker @react-native-picker/picker lodash
```

> **✅ Good news:** Based on your `package.json`, these are already installed!

---

### **STEP 5: Verify Supabase Database Tables**

Ensure your Supabase database has these tables with correct schema:

#### **Required Tables:**

1. **`events`** table:
   ```sql
   - id (uuid, primary key)
   - creator_id (uuid, foreign key to auth.users)
   - title (text)
   - description (text, nullable)
   - sport_type (text)
   - latitude (numeric)
   - longitude (numeric)
   - place_name (text, nullable)
   - place_id (text, nullable)
   - scheduled_datetime (timestamp with time zone)
   - min_participants (integer)
   - max_participants (integer)
   - skill_level (text, nullable)
   - requires_approval (boolean, default false)
   - status (text, default 'active')
   - created_at (timestamp with time zone)
   ```

2. **`event_participants`** table:
   ```sql
   - id (uuid, primary key)
   - event_id (uuid, foreign key to events)
   - user_id (uuid, foreign key to auth.users)
   - status (text, default 'joined')
   - joined_at (timestamp with time zone)
   ```

3. **`profiles`** table:
   ```sql
   - id (uuid, primary key, foreign key to auth.users)
   - username (text, unique)
   - full_name (text, nullable)
   - avatar_url (text, nullable)
   - created_at (timestamp with time zone)
   ```

> **💡 TIP:** You likely already have these tables. Verify in Supabase Dashboard → Table Editor.

---

### **STEP 6: Clear Cache and Restart Expo**

After configuring API keys, **ALWAYS** restart Expo with cache cleared:

```powershell
# Stop current Expo server (Ctrl+C)

# Clear cache and restart
npx expo start --clear
```

Then scan the QR code with Expo Go app on your phone.

---

## 🧩 **MISSING COMPONENTS TO IMPLEMENT**

Based on your original prompt, here's what needs to be added to MapScreen:

### **Component 1: Filter Bar with Sport Venue Categories**

**Location:** Add to `MapScreen.tsx`

**What it should do:**
- Horizontal scrollable chips for filtering venues
- Categories: Sport Halls, Fields, Parks, Fight Clubs, Courts, Water Sports, Fitness, Outdoor
- Active filter calls Google Places API
- Shows loading indicator while fetching

**File to create:** This can be added directly to MapScreen or as a separate component.

---

### **Component 2: Custom Location Markers**

**What's needed:**
- Two types of markers:
  1. **Location markers** (Google Places venues) - pin shape with emoji
  2. **Event markers** (existing events) - circular with participant count badge

**Implementation:** Modify `EnhancedInteractiveMap.tsx` to use custom marker components.

---

### **Component 3: Location Quick Info Callout**

**What it shows:**
- Location name
- Small photo
- "Tap to see events" hint

**Implementation:** React Native Maps `<Callout>` component on location markers.

---

### **Component 4: Enhanced Event Creation Flow**

**What's needed:**
- Pre-fill location when creating event from map
- Form validation
- Connect to Supabase events table
- Add creator as first participant

**File:** `EventCreationModal.tsx` (already exists, may need updates)

---

## ✅ **IMPLEMENTATION CHECKLIST**

Use this checklist to track your progress:

### **Phase 1: API Configuration**
- [ ] Google Cloud Console project created
- [ ] Maps JavaScript API enabled
- [ ] Places API enabled  
- [ ] Geocoding API enabled
- [ ] API keys created and restricted
- [ ] `.env` file updated with both API keys
- [ ] `app.config.js` updated with Maps config
- [ ] Expo cache cleared and restarted

### **Phase 2: Verify Core Functionality**
- [ ] MapScreen loads without errors
- [ ] EnhancedInteractiveMap renders
- [ ] User location permission requested
- [ ] Map centers on user location
- [ ] Existing events from Supabase display on map
- [ ] No console errors about missing API keys

### **Phase 3: Add Filter Functionality**
- [ ] Filter bar component created
- [ ] Google Places API connected
- [ ] Filter chips trigger venue search
- [ ] Custom location markers display
- [ ] Callouts show on marker tap

### **Phase 4: Event Creation Integration**
- [ ] Tap location → open callout
- [ ] Tap callout → open location details modal
- [ ] Create Event button works
- [ ] Event form validates input
- [ ] Events save to Supabase correctly
- [ ] New events appear on map immediately

### **Phase 5: Testing**
- [ ] Test on Android device
- [ ] Test on iOS device
- [ ] Test all filter categories
- [ ] Test event creation flow
- [ ] Test real-time event updates
- [ ] Test with slow/no internet

---

## 🧪 **TESTING GUIDE**

### **Test 1: Verify API Keys are Loaded**

Add this temporary code to `MapScreen.tsx` (remove after testing):

```typescript
useEffect(() => {
  console.log('🔑 Google Maps API Key:', process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ? '✅ Loaded' : '❌ Missing');
  console.log('🔑 Google Places API Key:', process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY ? '✅ Loaded' : '❌ Missing');
}, []);
```

**Expected result:** Both should show "✅ Loaded" in Expo console.

---

### **Test 2: Test Google Places API**

Add this button to MapScreen (temporary):

```typescript
<TouchableOpacity
  style={{ position: 'absolute', top: 200, right: 20, backgroundColor: '#FDB924', padding: 15, borderRadius: 10 }}
  onPress={async () => {
    try {
      const { searchNearbyPlaces } = require('../services/googlePlacesService');
      const results = await searchNearbyPlaces(52.2297, 21.0122, 'sport_halls', 5000);
      console.log('✅ Places API Test Results:', results);
      Alert.alert('Success!', `Found ${results.length} venues`);
    } catch (error) {
      console.error('❌ Places API Error:', error);
      Alert.alert('Error', error.message);
    }
  }}
>
  <Text style={{ color: '#000', fontWeight: 'bold' }}>Test Places API</Text>
</TouchableOpacity>
```

**Expected result:** Should find nearby gyms/sport halls and show alert with count.

---

### **Test 3: Verify Events Display on Map**

**Steps:**
1. Open MapScreen
2. Check console for: "✅ Fetched X events successfully"
3. Look for event markers on map (circular with emoji)
4. Tap an event marker → Event details should open

**If no events display:**
- Create test event in Supabase manually
- Or run SQL: `INSERT INTO events (...) VALUES (...)`

---

## 🐛 **TROUBLESHOOTING**

### **Issue 1: "API key is missing" error**

**Symptoms:**
- Console shows: `Google Places API key is required`
- No locations load when filtering

**Solutions:**
1. Verify `.env` file has the keys (without quotes)
2. Restart Expo with `npx expo start --clear`
3. Check `process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY` in code
4. Ensure `.env` is in `miliony` directory (not root)

---

### **Issue 2: "REQUEST_DENIED" from Google API**

**Symptoms:**
- Console shows: `Google Places API error: REQUEST_DENIED`

**Solutions:**
1. Verify APIs are **enabled** in Google Cloud Console:
   - Go to: https://console.cloud.google.com/apis/library
   - Search "Places API" → Should show "API enabled"
2. Check API key restrictions are not too strict
3. For development, temporarily remove all restrictions
4. Wait 5 minutes after enabling APIs (propagation delay)

---

### **Issue 3: Map shows but no markers**

**Symptoms:**
- Map renders correctly
- No event or location markers appear

**Solutions:**
1. Check console for Supabase errors
2. Verify `events` table has data:
   ```sql
   SELECT * FROM events WHERE status = 'active' AND scheduled_datetime > NOW();
   ```
3. Check if events have valid latitude/longitude
4. Verify events are being passed to `EnhancedInteractiveMap`:
   ```typescript
   console.log('📍 Events to display:', events);
   ```

---

### **Issue 4: Location permission denied**

**Symptoms:**
- Alert: "Location permission is required"
- Map doesn't center on user location

**Solutions:**
1. **iOS:** Go to Settings → SportMap → Location → "While Using App"
2. **Android:** Settings → Apps → Expo Go → Permissions → Location → Allow
3. Uninstall and reinstall Expo Go app
4. Clear app data in phone settings

---

### **Issue 5: "Failed to load events" error**

**Symptoms:**
- Alert: "Could not fetch sport events"
- Console: `Supabase query error`

**Solutions:**
1. Check Supabase credentials in `.env`
2. Test Supabase connection:
   ```typescript
   const { data, error } = await supabase.from('events').select('count');
   console.log('Supabase test:', data, error);
   ```
3. Verify RLS (Row Level Security) policies allow SELECT on `events` table
4. Check internet connection

---

## 🎯 **QUICK START CHECKLIST**

**Do this NOW to get MapScreen working:**

1. **Get Google API Key** (15 min)
   - https://console.cloud.google.com/
   - Enable: Maps JavaScript API, Places API, Geocoding API
   - Create API key

2. **Update `.env`** (1 min)
   ```bash
   EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
   EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=your_key_here
   ```

3. **Update `app.config.js`** (2 min)
   - Add iOS config.googleMapsApiKey
   - Add Android config.googleMaps.apiKey

4. **Restart Expo** (1 min)
   ```powershell
   npx expo start --clear
   ```

5. **Test** (2 min)
   - Open app
   - Check MapScreen loads
   - Check console for API key logs
   - Verify no errors

---

## 📊 **EXPECTED CONSOLE LOGS (Healthy State)**

When everything works correctly, you should see:

```
🔑 Google Maps API Key: ✅ Loaded
🔑 Google Places API Key: ✅ Loaded
🔄 Fetching events from Supabase...
✅ Fetched 5 events successfully
📊 Events data: [...]
📍 User location obtained: { latitude: 52.2297, longitude: 21.0122 }
🔔 Setting up real-time event subscriptions...
```

**If you see errors instead, check the Troubleshooting section above.**

---

## 🚀 **NEXT STEPS: Implementing the Full Feature Set**

Once basic MapScreen works with API keys configured, you can implement:

1. **Filter Bar** - Horizontal scrollable chips
2. **Custom Markers** - Replace default pins with custom designs
3. **Google Places Integration** - Search venues when filter selected
4. **Location Callouts** - Info popup on marker tap
5. **Event Creation Flow** - Create events at specific venues
6. **Real-time Updates** - See events appear instantly

**Want me to implement these features?** Let me know which one to start with!

---

## 📞 **NEED HELP?**

If you encounter issues:

1. **Check console logs** - Look for red errors
2. **Read error messages carefully** - They often tell you exactly what's wrong
3. **Verify API keys** - Most issues are due to missing/invalid keys
4. **Test step by step** - Don't implement everything at once
5. **Ask for help** - Provide console logs and error screenshots

---

**Last Updated:** October 13, 2025
**Your Next Action:** → Complete Step 1 (Get Google API Keys) and Step 2 (Update .env)

Good luck! 🎉


