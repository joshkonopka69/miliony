# 🔧 Map Integration Example

## How to Replace Static Map with Interactive Map

### Option 1: Complete Replacement (Recommended)
```typescript
// In your MapScreen.tsx, replace the ImageBackground with:

import { InteractiveMap } from '../components';

export default function MapScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleLocationSelect = (location: any) => {
    console.log('User selected:', location);
    // Show location details, navigate, or book facility
  };

  const handleFloatingSearch = () => {
    // Trigger search functionality
    console.log('Search for:', searchQuery);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Interactive Map */}
      <InteractiveMap 
        searchQuery={searchQuery}
        onLocationSelect={handleLocationSelect}
      />

      {/* Search Bar Overlay */}
      <View style={styles.searchOverlay}>
        <View style={styles.searchInputContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for sports, clubs, places"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#6B7280"
          />
        </View>
      </View>

      {/* Map Controls Overlay */}
      <View style={styles.controlsOverlay}>
        <View style={styles.zoomControls}>
          <TouchableOpacity style={styles.controlButton} onPress={handleZoomIn}>
            <Text style={styles.controlIcon}>➕</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={handleZoomOut}>
            <Text style={styles.controlIcon}>➖</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.locationButton} onPress={handleMyLocation}>
          <Text style={styles.controlIcon}>🧭</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
      <BottomNavBar activeTab="Map" onSearchPress={handleFloatingSearch} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  searchOverlay: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 1,
  },
  controlsOverlay: {
    position: 'absolute',
    top: 120,
    right: 16,
    zIndex: 1,
    gap: 12,
  },
  // ... rest of your existing styles
});
```

### Option 2: Gradual Migration
Keep your existing MapScreen and create a new `RealMapScreen`:

```typescript
// Create src/screens/RealMapScreen.tsx
import React from 'react';
import { InteractiveMap } from '../components';

export default function RealMapScreen() {
  return <InteractiveMap />;
}

// Add to navigation
<Stack.Screen 
  name="RealMap" 
  component={RealMapScreen}
  options={{ headerShown: false }}
/>
```

## 📱 Expected Results After Integration

### Interactive Features You'll Get:
- ✅ **Pinch to Zoom**: Multi-touch zoom gestures
- ✅ **Pan & Scroll**: Drag to move around the map
- ✅ **Tap Markers**: Show sports facility details
- ✅ **User Location**: Blue dot showing current position
- ✅ **Custom Markers**: Different icons for each sport
- ✅ **Search Integration**: Filter locations by query
- ✅ **Info Windows**: Detailed facility information

### Sports Locations You'll See:
- ⚽ **Football Fields**: With ratings and descriptions
- 🏀 **Basketball Courts**: Indoor/outdoor options
- 🏊 **Swimming Pools**: Olympic/recreational pools
- 🎾 **Tennis Courts**: Public/private facilities
- 🏋️ **Gyms**: Fitness centers and equipment

### Next Steps After Basic Setup:
1. **Add Real Data**: Connect to sports facility APIs
2. **User Reviews**: Let users rate and review locations
3. **Booking Integration**: Reserve facilities directly
4. **Social Features**: See friends' favorite spots
5. **Event Integration**: Show upcoming sports events on map

This will transform your app from a static map placeholder into a fully interactive sports facility finder! 🎯




