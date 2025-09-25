# 🔥 Firebase + Supabase Integration Guide for SportMap

## 🏗️ Architecture Overview

This hybrid architecture leverages the strengths of both platforms:

- **Supabase (PostgreSQL + Storage)** → Structured data, analytics, persistent storage
- **Firebase (Firestore + Auth + FCM)** → Real-time features, live events, chat, push notifications

### Data Flow Example:
1. User creates event → **Supabase** (persistent record)
2. Event also gets live entry in **Firestore** (real-time availability)
3. Other users see event pin on map (Firestore listener)
4. Users join & chat inside event (Firestore subcollections)
5. When event ends → mark as `closed` in Supabase & remove from Firestore

---

## 🗄️ Supabase Setup

### Database Schema

#### `users` Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  friends UUID[] DEFAULT '{}',
  favorite_sports TEXT[] DEFAULT '{}',
  location_latitude DOUBLE PRECISION,
  location_longitude DOUBLE PRECISION,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `events` Table
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  activity TEXT NOT NULL,
  description TEXT,
  min_participants INT DEFAULT 1,
  max_participants INT NOT NULL,
  media_url TEXT,
  location_name TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  place_id TEXT,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'live' CHECK (status IN ('live', 'past', 'cancelled')),
  participants_count INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `sports` Table
```sql
CREATE TABLE sports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  icon_url TEXT,
  category TEXT DEFAULT 'general'
);
```

#### `event_participants` Table (Many-to-Many)
```sql
CREATE TABLE event_participants (
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (event_id, user_id)
);
```

### Storage Buckets

1. **`avatars`** - User profile pictures
2. **`events`** - Event images/videos
3. **`sports`** - Sport category icons

### Row Level Security (RLS)

```sql
-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Events are public to read
CREATE POLICY "Events are viewable by everyone" ON events
  FOR SELECT USING (true);

-- Users can create events
CREATE POLICY "Users can create events" ON events
  FOR INSERT WITH CHECK (auth.uid() = created_by);
```

---

## 🔥 Firebase Setup

### Firestore Collections

#### `liveEvents` Collection
```json
{
  "id": "firebase-event-id",
  "supabaseEventId": "uuid-from-supabase",
  "name": "Biceps Training",
  "activity": "Gym",
  "location": {
    "latitude": 51.1079,
    "longitude": 17.0385,
    "placeId": "gym-123",
    "name": "Fitness World"
  },
  "createdBy": "user-id",
  "participants": ["user-id-1", "user-id-2"],
  "maxParticipants": 10,
  "createdAt": "2024-01-15T10:30:00Z",
  "status": "live",
  "lastActivity": "2024-01-15T11:00:00Z"
}
```

#### `liveEvents/{eventId}/messages` Subcollection
```json
{
  "id": "message-id",
  "senderId": "user-id",
  "senderName": "John Doe",
  "text": "Ready to train?",
  "createdAt": "2024-01-15T11:00:00Z",
  "type": "text" // text, image, system
}
```

#### `liveEvents/{eventId}/presence` Subcollection
```json
{
  "userId": "user-id",
  "status": "online", // online, away, offline
  "lastSeen": "2024-01-15T11:00:00Z"
}
```

### Firebase Cloud Messaging (FCM)

**Topics for Push Notifications:**
- `new-events-{sport}` - New events in specific sports
- `events-nearby-{location}` - Events near user location
- `event-{eventId}-updates` - Updates for specific events

---

## 🔄 Event Lifecycle Implementation

### 1. Create Event

```typescript
// 1. Save to Supabase (persistent)
const createEvent = async (eventData: CreateEventData) => {
  const { data: event, error } = await supabase
    .from('events')
    .insert({
      name: eventData.name,
      activity: eventData.activity,
      description: eventData.description,
      max_participants: eventData.maxParticipants,
      location_name: eventData.locationName,
      latitude: eventData.latitude,
      longitude: eventData.longitude,
      place_id: eventData.placeId,
      created_by: eventData.userId
    })
    .select()
    .single();

  if (error) throw error;

  // 2. Create live entry in Firestore
  await firestore.collection('liveEvents').doc(event.id).set({
    supabaseEventId: event.id,
    name: event.name,
    activity: event.activity,
    location: {
      latitude: event.latitude,
      longitude: event.longitude,
      placeId: event.place_id,
      name: event.location_name
    },
    createdBy: event.created_by,
    participants: [event.created_by],
    maxParticipants: event.max_participants,
    createdAt: new Date(),
    status: 'live',
    lastActivity: new Date()
  });

  return event;
};
```

### 2. Join Event

```typescript
const joinEvent = async (eventId: string, userId: string) => {
  // 1. Add to Supabase participants
  const { error: supabaseError } = await supabase
    .from('event_participants')
    .insert({ event_id: eventId, user_id: userId });

  if (supabaseError) throw supabaseError;

  // 2. Update Firestore live event
  const eventRef = firestore.collection('liveEvents').doc(eventId);
  await eventRef.update({
    participants: firestore.FieldValue.arrayUnion(userId),
    lastActivity: new Date()
  });

  // 3. Add user to presence
  await eventRef.collection('presence').doc(userId).set({
    status: 'online',
    lastSeen: new Date()
  });
};
```

### 3. Real-time Event Updates

```typescript
// Listen to live events for map pins
const subscribeToLiveEvents = (onUpdate: (events: LiveEvent[]) => void) => {
  return firestore
    .collection('liveEvents')
    .where('status', '==', 'live')
    .onSnapshot((snapshot) => {
      const events = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as LiveEvent[];
      onUpdate(events);
    });
};

// Listen to specific event updates
const subscribeToEvent = (eventId: string, onUpdate: (event: LiveEvent) => void) => {
  return firestore
    .collection('liveEvents')
    .doc(eventId)
    .onSnapshot((doc) => {
      if (doc.exists) {
        onUpdate({ id: doc.id, ...doc.data() } as LiveEvent);
      }
    });
};
```

### 4. Real-time Chat

```typescript
// Send message
const sendMessage = async (eventId: string, message: string, senderId: string) => {
  await firestore
    .collection('liveEvents')
    .doc(eventId)
    .collection('messages')
    .add({
      senderId,
      text: message,
      createdAt: new Date(),
      type: 'text'
    });

  // Update last activity
  await firestore.collection('liveEvents').doc(eventId).update({
    lastActivity: new Date()
  });
};

// Listen to messages
const subscribeToMessages = (eventId: string, onMessage: (message: Message) => void) => {
  return firestore
    .collection('liveEvents')
    .doc(eventId)
    .collection('messages')
    .orderBy('createdAt', 'desc')
    .limit(50)
    .onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          onMessage({ id: change.doc.id, ...change.doc.data() } as Message);
        }
      });
    });
};
```

### 5. End Event

```typescript
const endEvent = async (eventId: string, userId: string) => {
  // 1. Update Supabase
  const { error: supabaseError } = await supabase
    .from('events')
    .update({ status: 'past' })
    .eq('id', eventId)
    .eq('created_by', userId);

  if (supabaseError) throw supabaseError;

  // 2. Remove from Firestore live events
  await firestore.collection('liveEvents').doc(eventId).delete();
};
```

---

## 🗺️ Map Integration

### Live Event Pins

```typescript
// In your map component
useEffect(() => {
  const unsubscribe = subscribeToLiveEvents((events) => {
    setEventMarkers(events.map(event => ({
      id: event.id,
      coordinate: {
        latitude: event.location.latitude,
        longitude: event.location.longitude
      },
      title: event.name,
      description: `${event.participants.length}/${event.maxParticipants} participants`,
      event: event
    })));
  });

  return unsubscribe;
}, []);
```

### Search Events

```typescript
// Search in Supabase for historical + future events
const searchEvents = async (filters: EventFilters) => {
  let query = supabase
    .from('events')
    .select(`
      *,
      created_by:users!events_created_by_fkey(display_name, avatar_url)
    `)
    .eq('status', 'live');

  if (filters.activity) {
    query = query.eq('activity', filters.activity);
  }

  if (filters.location) {
    query = query
      .gte('latitude', filters.location.southWest.lat)
      .lte('latitude', filters.location.northEast.lat)
      .gte('longitude', filters.location.southWest.lng)
      .lte('longitude', filters.location.northEast.lng);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};
```

---

## 📱 Push Notifications

### FCM Setup

```typescript
// Subscribe to topics
const subscribeToSportEvents = async (sport: string) => {
  await messaging().subscribeToTopic(`new-events-${sport}`);
};

// Send notification when event is created
const notifyNewEvent = async (event: Event, nearbyUsers: string[]) => {
  const message = {
    topic: `events-nearby-${event.location_name}`,
    notification: {
      title: `New ${event.activity} Event`,
      body: `${event.name} - ${event.location_name}`
    },
    data: {
      eventId: event.id,
      type: 'new_event'
    }
  };

  await admin.messaging().send(message);
};
```

---

## 🔧 Environment Setup

### 1. Supabase Setup

```bash
# Install Supabase client
npm install @supabase/supabase-js

# Create .env file
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Firebase Setup

```bash
# Install Firebase
npm install @react-native-firebase/app @react-native-firebase/firestore @react-native-firebase/messaging

# Create .env file
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
```

### 3. Service Configuration

```typescript
// services/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// services/firebase.ts
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';

export { firestore, messaging };
```

---

## 🚀 Implementation Checklist

### Phase 1: Database Setup
- [ ] Create Supabase project
- [ ] Set up database tables
- [ ] Configure RLS policies
- [ ] Create storage buckets
- [ ] Set up Firebase project
- [ ] Configure Firestore collections

### Phase 2: Core Features
- [ ] Event creation (Supabase + Firestore)
- [ ] Event joining (real-time updates)
- [ ] Live event pins on map
- [ ] Basic chat functionality

### Phase 3: Advanced Features
- [ ] Push notifications
- [ ] Event presence tracking
- [ ] Event search and filtering
- [ ] Media upload to Supabase storage

### Phase 4: Optimization
- [ ] Data synchronization between platforms
- [ ] Performance optimization
- [ ] Error handling and offline support
- [ ] Analytics and monitoring

---

## 🔄 Data Synchronization

### Sync Strategy

1. **Supabase = Source of Truth** (permanent data)
2. **Firebase = Live Mirror** (active sessions)
3. **Sync finished events back to Supabase**

### Sync Implementation

```typescript
// Supabase Edge Function to sync Firebase → Supabase
const syncEventToSupabase = async (firebaseEvent: any) => {
  const { data, error } = await supabase
    .from('events')
    .update({
      participants_count: firebaseEvent.participants.length,
      updated_at: new Date()
    })
    .eq('id', firebaseEvent.supabaseEventId);

  return { data, error };
};
```

---

## 📊 Analytics & Monitoring

### Supabase Analytics
- User engagement metrics
- Event popularity by sport/location
- User retention and activity patterns

### Firebase Analytics
- Real-time event participation
- Chat activity and engagement
- Push notification effectiveness

---

This hybrid architecture gives you the best of both worlds: **Supabase's powerful SQL database** for structured data and analytics, combined with **Firebase's real-time capabilities** for live events and instant messaging. 🚀
