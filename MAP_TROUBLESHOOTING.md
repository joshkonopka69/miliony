# 🗺️ Map Troubleshooting Guide

## Common Issues & Solutions

### 1. **Map Not Showing - Check These First:**

#### ✅ **API Key Configuration**
- Verify your API key is correctly added to `app.json`
- Make sure you enabled **both** Maps SDK for Android and iOS in Google Cloud Console
- Check that your API key has proper restrictions

#### ✅ **Restart Development Server**
```bash
npx expo start --clear
```

#### ✅ **Check Console Logs**
Look for these error messages:
- "Google Maps API key not found"
- "Maps SDK not enabled"
- "API key restrictions"

### 2. **Google Cloud Console Setup**

Make sure you have enabled these APIs:
- ✅ **Maps SDK for Android**
- ✅ **Maps SDK for iOS**

### 3. **API Key Restrictions**

In Google Cloud Console, set up restrictions:
- **Application restrictions**: Add your app's package name
- **API restrictions**: Select only Maps SDK APIs

### 4. **Test with Simple Map**

If the map still doesn't show, try this simple test:

```typescript
// Simple test component
import MapView from 'react-native-maps';

export default function SimpleMapTest() {
  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={{
        latitude: 40.7589,
        longitude: -73.9851,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}
    />
  );
}
```

### 5. **Platform-Specific Issues**

#### **Android:**
- Check if you're using an emulator (maps might not work on some emulators)
- Try on a real device
- Ensure Google Play Services are installed

#### **iOS:**
- Check if you're using iOS Simulator (maps work better on real devices)
- Ensure you have proper iOS configuration

### 6. **Network Issues**
- Check your internet connection
- Some corporate networks block Google Maps
- Try on different network (mobile data vs WiFi)

## Quick Fixes to Try:

1. **Clear cache and restart:**
   ```bash
   npx expo start --clear
   ```

2. **Check your app.json configuration:**
   ```json
   {
     "expo": {
       "android": {
         "config": {
           "googleMaps": {
             "apiKey": "YOUR_API_KEY"
           }
         }
       },
       "ios": {
         "config": {
           "googleMapsApiKey": "YOUR_API_KEY"
         }
       }
     }
   }
   ```

3. **Verify API key in Google Cloud Console:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Check that Maps SDK for Android and iOS are enabled
   - Verify your API key is active

4. **Test on real device** (not emulator/simulator)

## Still Not Working?

If the map still doesn't show, please share:
1. Any error messages from the console
2. Which platform you're testing on (Android/iOS)
3. Whether you're using emulator or real device
4. Screenshot of what you see instead of the map

