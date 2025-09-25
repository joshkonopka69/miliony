# 🔥 Firebase Firestore Setup Guide for SportMap

## 📋 Step-by-Step Firebase Console Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"**
3. Enter project name: `sportmap-app`
4. Enable Google Analytics (optional)
5. Click **"Create project"**

### 2. Enable Firestore Database

1. In your Firebase project dashboard, click **"Firestore Database"**
2. Click **"Create database"**
3. Choose **"Start in test mode"** (we'll add security rules later)
4. Select a location (choose closest to your users)
5. Click **"Done"**

### 3. Set Up Firestore Collections

#### Collection 1: `liveEvents`

**Path:** `liveEvents/{eventId}`

**Document Structure:**
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

**How to create in Firebase Console:**
1. Go to **Firestore Database** → **Data** tab
2. Click **"Start collection"**
3. Collection ID: `liveEvents`
4. Click **"Next"**
5. Document ID: `sample-event-1` (auto-generated)
6. Add the fields above with their respective data types
7. Click **"Save"**

#### Collection 2: `liveEvents/{eventId}/messages`

**Path:** `liveEvents/{eventId}/messages/{messageId}`

**Document Structure:**
```json
{
  "id": "message-id",
  "senderId": "user-id",
  "senderName": "John Doe",
  "text": "Ready to train?",
  "createdAt": "2024-01-15T11:00:00Z",
  "type": "text"
}
```

**How to create in Firebase Console:**
1. In the `liveEvents` collection, click on a document
2. Click **"Start subcollection"**
3. Subcollection ID: `messages`
4. Click **"Next"**
5. Document ID: `sample-message-1`
6. Add the fields above
7. Click **"Save"**

#### Collection 3: `liveEvents/{eventId}/presence`

**Path:** `liveEvents/{eventId}/presence/{userId}`

**Document Structure:**
```json
{
  "userId": "user-id",
  "status": "online",
  "lastSeen": "2024-01-15T11:00:00Z"
}
```

**How to create in Firebase Console:**
1. In the `liveEvents` collection, click on a document
2. Click **"Start subcollection"**
3. Subcollection ID: `presence`
4. Click **"Next"**
5. Document ID: `user-id-1`
6. Add the fields above
7. Click **"Save"**

### 4. Set Up Firestore Security Rules

1. Go to **Firestore Database** → **Rules** tab
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Live events are readable by everyone
    match /liveEvents/{eventId} {
      allow read: if true;
      allow write: if request.auth != null;
      
      // Messages are readable by event participants
      match /messages/{messageId} {
        allow read: if request.auth != null && 
          exists(/databases/$(database)/documents/liveEvents/$(eventId)) &&
          request.auth.uid in get(/databases/$(database)/documents/liveEvents/$(eventId)).data.participants;
        allow write: if request.auth != null && 
          request.auth.uid in get(/databases/$(database)/documents/liveEvents/$(eventId)).data.participants;
      }
      
      // Presence is readable by event participants
      match /presence/{userId} {
        allow read: if request.auth != null && 
          exists(/databases/$(database)/documents/liveEvents/$(eventId)) &&
          request.auth.uid in get(/databases/$(database)/documents/liveEvents/$(eventId)).data.participants;
        allow write: if request.auth != null && 
          request.auth.uid == userId;
      }
    }
  }
}
```

3. Click **"Publish"**

### 5. Enable Firebase Authentication

1. Go to **Authentication** → **Sign-in method**
2. Enable **Email/Password**
3. Enable **Google** (optional)
4. Enable **Apple** (optional)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null && resource.data.publicProfile == true;
    }
    
    // Events are readable by all authenticated users
    match /events/{eventId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (resource == null || resource.data.creatorId == request.auth.uid);
    }
    
    // Event participants
    match /eventParticipants/{participantId} {
      allow read, write: if request.auth != null;
    }
    
    // Chats are only accessible by event participants
    match /chats/{chatId} {
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/events/$(chatId)) &&
        request.auth.uid in get(/databases/$(database)/documents/events/$(chatId)).data.participants;
    }
    
    // Messages are only accessible by chat participants
    match /messages/{messageId} {
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/chats/$(resource.data.chatId)) &&
        request.auth.uid in get(/databases/$(database)/documents/chats/$(resource.data.chatId)).data.participants;
    }
  }
}
### 6. Set Up Firebase Cloud Messaging (FCM)

1. Go to **Project Settings** → **Cloud Messaging**
2. Note down your **Server Key** (you'll need this for push notifications)
3. Go to **Authentication** → **Settings** → **Web API Key**

### 7. Configure Firebase for React Nativee

#### Install Firebase Dependencies

```bash
npm install @react-native-firebase/app @react-native-firebase/firestore @react-native-firebase/auth @react-native-firebase/messaging
```

#### Create Firebase Configuration

Create `src/config/firebase.ts`:

```typescript
import { initializeApp } from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import messaging from '@react-native-firebase/messaging';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export { firestore, auth, messaging };
export default app;
```

### 8. Create Sample Data in Firebase Console

#### Sample Live Event Document

**Collection:** `liveEvents`
**Document ID:** `sample-event-1`

```json
{
  "id": "sample-event-1",
  "supabaseEventId": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Morning Yoga Session",
  "activity": "Yoga",
  "location": {
    "latitude": 51.1079,
    "longitude": 17.0385,
    "placeId": "yoga-studio-123",
    "name": "Zen Yoga Studio"
  },
  "createdBy": "user-123",
  "participants": ["user-123", "user-456"],
  "maxParticipants": 15,
  "createdAt": "2024-01-15T10:30:00Z",
  "status": "live",
  "lastActivity": "2024-01-15T11:00:00Z"
}
```

#### Sample Message Document

**Collection:** `liveEvents/sample-event-1/messages`
**Document ID:** `sample-message-1`

```json
{
  "id": "sample-message-1",
  "senderId": "user-123",
  "senderName": "John Doe",
  "text": "Ready to start the session?",
  "createdAt": "2024-01-15T11:00:00Z",
  "type": "text"
}
```

#### Sample Presence Document

**Collection:** `liveEvents/sample-event-1/presence`
**Document ID:** `user-123`

```json
{
  "userId": "user-123",
  "status": "online",
  "lastSeen": "2024-01-15T11:00:00Z"
}
```

### 9. Test Firestore Connection

Create a test file `src/services/firebase-test.ts`:

```typescript
import { firestore } from '../config/firebase';

export const testFirestoreConnection = async () => {
  try {
    // Test reading from liveEvents collection
    const snapshot = await firestore.collection('liveEvents').limit(1).get();
    console.log('Firestore connection successful!');
    console.log('Sample documents:', snapshot.docs.map(doc => doc.data()));
    return true;
  } catch (error) {
    console.error('Firestore connection failed:', error);
    return false;
  }
};

// Test real-time listener
export const testRealtimeListener = () => {
  const unsubscribe = firestore
    .collection('liveEvents')
    .onSnapshot((snapshot) => {
      console.log('Real-time update received!');
      snapshot.docChanges().forEach((change) => {
        console.log('Change type:', change.type);
        console.log('Document:', change.doc.data());
      });
    });

  return unsubscribe;
};
```

### 10. Environment Variables

Create `.env` file in your project root:

```env
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key_here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id

# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 11. Firebase Console Dashboard

After setup, your Firebase Console should show:

- **Firestore Database** with `liveEvents` collection
- **Authentication** enabled
- **Cloud Messaging** configured
- **Project Settings** with your API keys

### 12. Testing the Setup

1. **Test Firestore Read:**
   ```typescript
   const events = await firestore.collection('liveEvents').get();
   console.log('Events:', events.docs.map(doc => doc.data()));
   ```

2. **Test Real-time Listener:**
   ```typescript
   const unsubscribe = firestore
     .collection('liveEvents')
     .onSnapshot((snapshot) => {
       console.log('Real-time update:', snapshot.docs.map(doc => doc.data()));
     });
   ```

3. **Test Authentication:**
   ```typescript
   const user = await auth().signInAnonymously();
   console.log('User authenticated:', user.user.uid);
   ```

---

## 🚀 Next Steps

1. **Integrate with your React Native app**
2. **Set up push notifications**
3. **Implement real-time event updates**
4. **Add user authentication**
5. **Test the complete flow**

Your Firebase Firestore is now ready for real-time sports events! 🏆
