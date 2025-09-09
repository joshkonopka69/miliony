# 🗺️ Interactive Maps Setup Guide

## 📦 Installation Steps

### 1. Install Required Packages
```bash
npm install react-native-maps
npm install react-native-geolocation-service
npm install @react-native-async-storage/async-storage

# For iOS (if targeting iOS)
cd ios && pod install && cd ..
```

### 2. Android Configuration

#### Add to `android/app/src/main/AndroidManifest.xml`:
```xml
<!-- Add permissions -->
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.INTERNET" />

<!-- Add Google Maps API Key inside <application> tag -->
<meta-data
  android:name="com.google.android.geo.API_KEY"
  android:value="YOUR_GOOGLE_MAPS_API_KEY_HERE"/>
```

### 3. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable these APIs:
   - Maps SDK for Android
   - Maps SDK for iOS (if needed)
   - Places API (for search functionality)
   - Geocoding API (for address conversion)

4. Create credentials → API Key
5. Restrict the key to your app's package name

### 4. iOS Configuration (if targeting iOS)

Add to `ios/YourApp/AppDelegate.m`:
```objc
#import <GoogleMaps/GoogleMaps.h>

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  [GMSServices provideAPIKey:@"YOUR_GOOGLE_MAPS_API_KEY_HERE"];
  // ... rest of your code
}
```

## 🎯 Sports-Specific Features

### Location Categories
- 🏟️ **Stadiums**: Football, Soccer, Baseball
- 🏊 **Aquatic Centers**: Swimming, Water Sports
- 🎾 **Courts**: Tennis, Basketball, Volleyball
- 🏃 **Tracks**: Running, Athletics
- 🏋️ **Fitness**: Gyms, CrossFit boxes
- ⛳ **Golf**: Courses, Driving ranges
- 🚴 **Cycling**: Bike paths, Mountain bike trails
- 🥊 **Combat Sports**: Boxing gyms, MMA centers

### Advanced Features to Add Later

#### Phase 2: Search Integration
```bash
npm install @google-cloud/places
```

#### Phase 3: Real-time Features
```bash
npm install socket.io-client  # For real-time user locations
npm install @react-native-firebase/firestore  # For data sync
```

#### Phase 4: Navigation
```bash
npm install react-native-maps-directions
```

## 🔧 Usage in Your App

### Replace MapScreen Background Image
```typescript
// Instead of ImageBackground, use:
import { InteractiveMap } from '../components';

// In your MapScreen:
<InteractiveMap 
  searchQuery={searchQuery}
  onLocationSelect={(location) => {
    console.log('Selected:', location);
    // Handle location selection
  }}
/>
```

### Add Search Functionality
```typescript
const handleSearch = (query: string) => {
  // This will filter map markers
  setSearchQuery(query);
  
  // Later: integrate with Google Places API
  // searchNearbyPlaces(query, userLocation);
};
```

## 💰 Cost Considerations

### Google Maps Pricing (as of 2024)
- **Maps SDK**: $7 per 1,000 requests
- **Places API**: $32 per 1,000 requests  
- **Geocoding**: $5 per 1,000 requests

### Free Tier
- $200 credit per month
- ~28,500 map loads per month free
- Perfect for development and small apps

### Cost Optimization Tips
1. **Cache Results**: Store frequent searches
2. **Limit Requests**: Debounce search queries
3. **Use Static Maps**: For non-interactive views
4. **Optimize Markers**: Load only visible area

## 🚀 Implementation Priority

### Week 1: Basic Map
- ✅ Install react-native-maps
- ✅ Get Google Maps API key
- ✅ Replace static map with interactive map
- ✅ Add user location

### Week 2: Sports Locations
- ✅ Add custom markers for different sports
- ✅ Create location data structure
- ✅ Add info windows with facility details

### Week 3: Search & Discovery
- ✅ Integrate Google Places API
- ✅ Add search functionality
- ✅ Filter by sport type

### Week 4: Social Features
- ✅ Show user events on map
- ✅ Add location-based notifications
- ✅ Enable location sharing

## 🔒 Security Notes

1. **API Key Security**:
   - Restrict API keys to your app
   - Use different keys for dev/prod
   - Monitor usage in Google Console

2. **Location Privacy**:
   - Always ask for permission
   - Explain why you need location
   - Allow users to opt-out

3. **Data Storage**:
   - Don't store sensitive location data
   - Comply with GDPR/privacy laws
   - Use secure connections (HTTPS)

## 🐛 Common Issues & Solutions

### Android Build Errors
```bash
# Clean and rebuild
cd android && ./gradlew clean && cd ..
npx react-native run-android
```

### iOS Build Errors
```bash
cd ios && pod install && cd ..
npx react-native run-ios
```

### Map Not Showing
1. Check API key is correct
2. Verify permissions are granted
3. Check internet connection
4. Look at console logs for errors

This setup will give you a professional, interactive map perfect for finding sports locations! 🎯

