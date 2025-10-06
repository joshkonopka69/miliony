# 🎯 Quick Guide: Display Event Markers on Map

## Overview
This guide shows how to pass events from MapScreen to EnhancedInteractiveMap and render them as markers.

---

## 📝 Step-by-Step Implementation

### **Step 1: Update EnhancedInteractiveMap Props**

**File:** `src/components/EnhancedInteractiveMap.tsx`

```typescript
// Add to the interface (around line 40)
interface EnhancedInteractiveMapProps {
  onLocationSelect?: (location: any) => void;
  searchQuery?: string;
  onMapReady?: (mapRef: React.RefObject<any>) => void;
  onLocationPermissionGranted?: () => void;
  hideControls?: boolean;
  events?: MapEvent[];  // 👈 ADD THIS
}

// Add MapEvent interface
interface MapEvent {
  id: string;
  name: string;
  activity: string;
  latitude: number;
  longitude: number;
  participants_count: number;
  max_participants: number;
  status: 'live' | 'past' | 'cancelled';
  created_at: string;
}

// Add to component destructuring (around line 50)
export default function EnhancedInteractiveMap({
  onLocationSelect,
  searchQuery,
  onMapReady,
  onLocationPermissionGranted,
  hideControls = false,
  events = [],  // 👈 ADD THIS with default empty array
}: EnhancedInteractiveMapProps) {
  // ... rest of component
}
```

### **Step 2: Pass Events from MapScreen**

**File:** `src/screens/MapScreen.tsx`

```typescript
// Already implemented! ✅
<EnhancedInteractiveMap
  onMapReady={(ref) => {
    mapRef.current = ref;
  }}
  onLocationPermissionGranted={handleLocationPermissionGranted}
  hideControls={true}
  events={events}  // 👈 ALREADY PASSING EVENTS
/>
```

### **Step 3: Render Markers in GoogleMapsView**

**File:** `src/components/GoogleMapsView.tsx`

Update the component to accept and display events:

```typescript
interface GoogleMapsViewProps {
  onLocationSelect?: (location: any) => void;
  onPlaceSelect?: (place: any) => void;
  searchQuery?: string;
  events?: MapEvent[];  // 👈 ADD THIS
}

// Add sport emoji helper
const getSportEmoji = (activity: string): string => {
  const emojiMap: Record<string, string> = {
    basketball: '🏀',
    football: '⚽',
    soccer: '⚽',
    running: '🏃‍♂️',
    tennis: '🎾',
    cycling: '🚴‍♂️',
    swimming: '🏊‍♂️',
    gym: '💪',
    volleyball: '🏐',
    climbing: '🧗‍♂️',
  };
  return emojiMap[activity.toLowerCase()] || '🏃';
};

export default function GoogleMapsView({
  onLocationSelect,
  onPlaceSelect,
  searchQuery,
  events = [],  // 👈 ADD THIS
}: GoogleMapsViewProps) {
  
  // Add event marker HTML generation
  const generateEventMarkersHTML = () => {
    if (!events || events.length === 0) return '';
    
    return events.map(event => `
      <div 
        class="event-marker" 
        id="event-${event.id}"
        style="
          position: absolute;
          left: ${event.longitude}px;
          top: ${event.latitude}px;
          transform: translate(-50%, -50%);
          cursor: pointer;
          z-index: 100;
        "
        onclick="window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'eventPress',
          eventId: '${event.id}'
        }))"
      >
        <div style="
          background: #FDB924;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          border: 3px solid white;
        ">
          ${getSportEmoji(event.activity)}
        </div>
        <div style="
          position: absolute;
          bottom: -20px;
          left: 50%;
          transform: translateX(-50%);
          background: white;
          padding: 4px 8px;
          border-radius: 12px;
          white-space: nowrap;
          font-size: 11px;
          font-weight: 600;
          box-shadow: 0 1px 4px rgba(0,0,0,0.2);
        ">
          ${event.participants_count}/${event.max_participants}
        </div>
      </div>
    `).join('');
  };
  
  // Update HTML to include event markers
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places"></script>
        <style>
          body, html { margin: 0; padding: 0; height: 100%; }
          #map { height: 100%; width: 100%; }
          .event-marker { transition: transform 0.2s; }
          .event-marker:hover { transform: translate(-50%, -50%) scale(1.1); }
        </style>
      </head>
      <body>
        <div id="map"></div>
        ${generateEventMarkersHTML()}
        <script>
          // ... existing map initialization code ...
        </script>
      </body>
    </html>
  `;
  
  return (
    <WebView
      source={{ html: htmlContent }}
      // ... rest of WebView props
    />
  );
}
```

---

## 🎨 Alternative: Use React Native Maps Markers

If you're using `react-native-maps` instead of WebView:

```typescript
import MapView, { Marker } from 'react-native-maps';

// In your map component render
<MapView
  style={styles.map}
  initialRegion={region}
>
  {/* User location marker */}
  {userLocation && (
    <Marker
      coordinate={{
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      }}
      title="You are here"
    />
  )}

  {/* Event markers */}
  {events.map((event) => (
    <Marker
      key={event.id}
      coordinate={{
        latitude: event.latitude,
        longitude: event.longitude,
      }}
      onPress={() => handleEventPress(event)}
      title={event.name}
      description={`${event.participants_count}/${event.max_participants} participants`}
    >
      {/* Custom marker view */}
      <View style={styles.eventMarkerContainer}>
        <View style={styles.eventMarker}>
          <Text style={styles.eventMarkerEmoji}>
            {getSportEmoji(event.activity)}
          </Text>
        </View>
        <View style={styles.participantsBadge}>
          <Text style={styles.participantsText}>
            {event.participants_count}/{event.max_participants}
          </Text>
        </View>
      </View>
    </Marker>
  ))}
</MapView>

// Styles
const styles = StyleSheet.create({
  eventMarkerContainer: {
    alignItems: 'center',
  },
  eventMarker: {
    backgroundColor: '#FDB924',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  eventMarkerEmoji: {
    fontSize: 20,
  },
  participantsBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  participantsText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#000000',
  },
});
```

---

## 🔧 Event Handler Implementation

```typescript
// In MapScreen or EnhancedInteractiveMap
const handleEventPress = (event: MapEvent) => {
  Alert.alert(
    event.name,
    `${event.activity}\n${event.participants_count}/${event.max_participants} participants`,
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'View Details',
        onPress: () => {
          // Navigate to event details
          navigation.navigate('EventDetails', { eventId: event.id });
        },
      },
      {
        text: 'Join Event',
        onPress: async () => {
          // Join event logic
          await handleJoinEvent(event.id);
        },
      },
    ]
  );
};

const handleJoinEvent = async (eventId: string) => {
  try {
    const { data, error } = await supabase.rpc('join_event', {
      event_uuid: eventId,
      user_uuid: currentUser.id,
    });
    
    if (error) throw error;
    
    Alert.alert('Success', 'You joined the event!');
    // Refresh events
    fetchEventsFromSupabase();
  } catch (error) {
    console.error('Error joining event:', error);
    Alert.alert('Error', 'Failed to join event');
  }
};
```

---

## 🎯 Quick Test

### **1. Add Test Events to Supabase**
```sql
INSERT INTO events (
  name, activity, latitude, longitude, 
  location_name, max_participants, status
) VALUES 
  ('Basketball Game', 'basketball', 40.7829, -73.9654, 'Central Park', 10, 'live'),
  ('Soccer Match', 'football', 40.7580, -73.9855, 'Bryant Park', 22, 'live'),
  ('Tennis Practice', 'tennis', 40.7489, -73.9680, 'Tennis Courts', 4, 'live');
```

### **2. Run App and Verify**
```bash
npx expo start
```

**Expected Results:**
- ✅ 3 markers appear on map
- ✅ Basketball shows 🏀
- ✅ Football shows ⚽
- ✅ Tennis shows 🎾
- ✅ Each marker is tappable
- ✅ Participant count shows below marker

---

## 🚀 You're Done!

Your map now displays event markers with sport emojis! 🎉

**Next Steps:**
1. Implement marker press handlers
2. Add event details modal
3. Add join/leave event functionality
4. Add marker clustering for many events
5. Add custom callouts with more info

---

**Need help?** Check the full implementation in:
- `src/screens/MapScreen.tsx` - Event fetching
- `MAP_EVENTS_IMPLEMENTATION.md` - Complete documentation

