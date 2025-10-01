# 🔐 Complete Authentication Setup Guide for SportMap

## 🎯 **Goal: Make Registration & Login 100% Functional**

Your friend should be able to:
1. ✅ Register with email/password using Supabase
2. ✅ Login with email/password using Supabase  
3. ✅ Login with Google using Firebase
4. ✅ Login with Apple using Firebase
5. ✅ Reset password via email
6. ✅ Verify email address

---

## 📋 **Current Status Analysis**

### ✅ **What's Working:**
- Supabase authentication service is properly implemented
- Firebase configuration is set up
- Authentication forms are ready
- Database schema is defined

### ❌ **What Needs Fixing:**
- Missing environment variables (.env file)
- Supabase database not configured
- Firebase social auth not implemented
- Google/Apple sign-in not working

---

## 🚀 **Step-by-Step Setup Instructions**

### **Step 1: Create Environment File**

Create a `.env` file in your project root:

```bash
# Navigate to your project
cd /home/hubi/SportMap/miliony

# Create .env file
touch .env
```

Add this content to `.env`:

```env
# Firebase Configuration (Already configured)
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyB0IHLweZ7IN5rPxqvDWfuW_ACe70FfzNE
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=sportmap-cc906.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=sportmap-cc906
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=sportmap-cc906.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=853936038513
EXPO_PUBLIC_FIREBASE_APP_ID=1:853936038513:web:a1e55608786dacda6df1d0

# Supabase Configuration (YOU NEED TO GET THESE)
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Google Maps API Key (YOU NEED TO GET THIS)
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=your_google_maps_api_key_here
```

### **Step 2: Get Supabase Credentials**

1. **Go to [Supabase Dashboard](https://supabase.com/dashboard)**
2. **Create a new project** (or use existing)
3. **Wait for project to be ready** (2-3 minutes)
4. **Go to Settings → API**
5. **Copy these values:**

```env
# Replace in your .env file:
EXPO_PUBLIC_SUPABASE_URL=https://your-actual-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your_actual_key
```

### **Step 3: Set Up Supabase Database**

1. **Go to Supabase → SQL Editor**
2. **Copy and paste this SQL script:**

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  favorite_sports TEXT[] DEFAULT '{}',
  location_latitude DECIMAL,
  location_longitude DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  activity TEXT NOT NULL,
  description TEXT,
  min_participants INTEGER DEFAULT 1,
  max_participants INTEGER NOT NULL,
  media_url TEXT,
  location_name TEXT NOT NULL,
  latitude DECIMAL NOT NULL,
  longitude DECIMAL NOT NULL,
  place_id TEXT,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'live' CHECK (status IN ('live', 'past', 'cancelled')),
  participants_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create event_participants table
CREATE TABLE IF NOT EXISTS event_participants (
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (event_id, user_id)
);

-- Create event_messages table
CREATE TABLE IF NOT EXISTS event_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'system')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sports table
CREATE TABLE IF NOT EXISTS sports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  icon_url TEXT,
  category TEXT
);

-- Insert default sports
INSERT INTO sports (name, category) VALUES
  ('Basketball', 'Team Sports'),
  ('Football', 'Team Sports'),
  ('Soccer', 'Team Sports'),
  ('Tennis', 'Racket Sports'),
  ('Volleyball', 'Team Sports'),
  ('Badminton', 'Racket Sports'),
  ('Squash', 'Racket Sports'),
  ('Swimming', 'Individual Sports'),
  ('Running', 'Individual Sports'),
  ('Cycling', 'Individual Sports'),
  ('Golf', 'Individual Sports'),
  ('MMA', 'Combat Sports'),
  ('Judo', 'Combat Sports'),
  ('Boxing', 'Combat Sports')
ON CONFLICT (name) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users
CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for events
CREATE POLICY "Anyone can view events" ON events FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create events" ON events FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Event creators can update their events" ON events FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Event creators can delete their events" ON events FOR DELETE USING (auth.uid() = created_by);

-- Create RLS policies for event_participants
CREATE POLICY "Anyone can view participants" ON event_participants FOR SELECT USING (true);
CREATE POLICY "Users can join events" ON event_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave events" ON event_participants FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for event_messages
CREATE POLICY "Anyone can view messages" ON event_messages FOR SELECT USING (true);
CREATE POLICY "Authenticated users can send messages" ON event_messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email, display_name, favorite_sports)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'favorite_sports', '{}')::TEXT[]
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create function for joining events
CREATE OR REPLACE FUNCTION join_event(event_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  event_exists BOOLEAN;
  already_joined BOOLEAN;
  current_count INTEGER;
  max_participants INTEGER;
BEGIN
  -- Check if event exists and get max participants
  SELECT EXISTS(SELECT 1 FROM events WHERE id = event_uuid), 
         (SELECT max_participants FROM events WHERE id = event_uuid)
  INTO event_exists, max_participants;
  
  IF NOT event_exists THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user is already a participant
  SELECT EXISTS(SELECT 1 FROM event_participants WHERE event_id = event_uuid AND user_id = user_uuid)
  INTO already_joined;
  
  IF already_joined THEN
    RETURN FALSE;
  END IF;
  
  -- Get current participant count
  SELECT participants_count INTO current_count FROM events WHERE id = event_uuid;
  
  -- Check if event is full
  IF current_count >= max_participants THEN
    RETURN FALSE;
  END IF;
  
  -- Add participant
  INSERT INTO event_participants (event_id, user_id) VALUES (event_uuid, user_uuid);
  
  -- Update participant count
  UPDATE events SET participants_count = participants_count + 1 WHERE id = event_uuid;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function for leaving events
CREATE OR REPLACE FUNCTION leave_event(event_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  was_participant BOOLEAN;
BEGIN
  -- Check if user is a participant
  SELECT EXISTS(SELECT 1 FROM event_participants WHERE event_id = event_uuid AND user_id = user_uuid)
  INTO was_participant;
  
  IF NOT was_participant THEN
    RETURN FALSE;
  END IF;
  
  -- Remove participant
  DELETE FROM event_participants WHERE event_id = event_uuid AND user_id = user_uuid;
  
  -- Update participant count
  UPDATE events SET participants_count = participants_count - 1 WHERE id = event_uuid;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function for location-based event search
CREATE OR REPLACE FUNCTION get_events_near_location(
  user_lat DECIMAL,
  user_lng DECIMAL,
  radius_km INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  activity TEXT,
  description TEXT,
  min_participants INTEGER,
  max_participants INTEGER,
  media_url TEXT,
  location_name TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  place_id TEXT,
  created_by UUID,
  status TEXT,
  participants_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  distance_km DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.*,
    ROUND(
      6371 * acos(
        cos(radians(user_lat)) * cos(radians(e.latitude)) * 
        cos(radians(e.longitude) - radians(user_lng)) + 
        sin(radians(user_lat)) * sin(radians(e.latitude))
      )::DECIMAL, 2
    ) AS distance_km
  FROM events e
  WHERE e.status = 'live'
    AND (
      6371 * acos(
        cos(radians(user_lat)) * cos(radians(e.latitude)) * 
        cos(radians(e.longitude) - radians(user_lng)) + 
        sin(radians(user_lat)) * sin(radians(e.latitude))
      )
    ) <= radius_km
  ORDER BY distance_km;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

3. **Click "Run" to execute the script**

### **Step 4: Configure Firebase Authentication**

1. **Go to [Firebase Console](https://console.firebase.google.com/)**
2. **Select your project: sportmap-cc906**
3. **Go to Authentication → Sign-in method**
4. **Enable these providers:**

#### **Email/Password Authentication:**
- ✅ Enable Email/Password
- ✅ Enable Email link (passwordless sign-in)

#### **Google Sign-In:**
- ✅ Enable Google
- Add your app's SHA-1 fingerprint (for Android)
- Add your bundle ID (for iOS)

#### **Apple Sign-In:**
- ✅ Enable Apple
- Add your Apple Developer Team ID
- Add your Apple Services ID

### **Step 5: Get Google Maps API Key**

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**
2. **Create a new project** or select existing
3. **Enable these APIs:**
   - Maps JavaScript API
   - Maps SDK for Android
   - Maps SDK for iOS
   - Places API
   - Geocoding API
4. **Go to Credentials → Create Credentials → API Key**
5. **Copy the API key and add to .env:**

```env
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_google_maps_key
EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=your_actual_google_maps_key
```

### **Step 6: Update app.json for Google Maps**

Update your `app.json` file:

```json
{
  "expo": {
    "name": "SportMap",
    "slug": "sportmap",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.sportmap",
      "config": {
        "googleMapsApiKey": "YOUR_GOOGLE_MAPS_API_KEY"
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.yourcompany.sportmap",
      "config": {
        "googleMaps": {
          "apiKey": "YOUR_GOOGLE_MAPS_API_KEY"
        }
      }
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-location",
      "expo-notifications"
    ]
  }
}
```

### **Step 7: Install Required Dependencies**

```bash
# Install additional dependencies for social auth
npm install @react-native-google-signin/google-signin
npm install @invertase/react-native-apple-authentication

# For iOS, you'll also need to run:
cd ios && pod install
```

### **Step 8: Test the Setup**

1. **Start the development server:**
```bash
npx expo start --localhost
```

2. **Test registration:**
   - Try registering with email/password
   - Check if user is created in Supabase

3. **Test login:**
   - Try logging in with the same credentials
   - Check if user data loads correctly

4. **Test social auth:**
   - Try Google sign-in
   - Try Apple sign-in (iOS only)

---

## 🔧 **Troubleshooting Common Issues**

### **Issue 1: "Supabase URL not found"**
**Solution:** Make sure your `.env` file has the correct Supabase URL and key.

### **Issue 2: "Database connection failed"**
**Solution:** Check your Supabase project is active and the database is set up.

### **Issue 3: "Google Maps not loading"**
**Solution:** Verify your Google Maps API key is correct and has the right permissions.

### **Issue 4: "Social login not working"**
**Solution:** Make sure you've configured the OAuth providers in Firebase Console.

### **Issue 5: "User not created in database"**
**Solution:** Check the Supabase trigger is working and RLS policies are correct.

---

## ✅ **Verification Checklist**

- [ ] `.env` file created with all API keys
- [ ] Supabase database tables created
- [ ] Supabase RLS policies enabled
- [ ] Firebase authentication providers enabled
- [ ] Google Maps API key configured
- [ ] App.json updated with Google Maps key
- [ ] Dependencies installed
- [ ] Registration flow works
- [ ] Login flow works
- [ ] Social authentication works
- [ ] Password reset works
- [ ] Email verification works

---

## 🎯 **Expected Results**

After completing this setup, your friend should be able to:

1. **Register** with email/password → User created in Supabase
2. **Login** with email/password → User authenticated and data loaded
3. **Login with Google** → User authenticated via Firebase, synced to Supabase
4. **Login with Apple** → User authenticated via Firebase, synced to Supabase
5. **Reset password** → Email sent with reset link
6. **Verify email** → Email verification works

---

## 📞 **Need Help?**

If you encounter any issues:

1. **Check the console logs** for error messages
2. **Verify all API keys** are correct
3. **Test each step** individually
4. **Check Supabase logs** in the dashboard
5. **Check Firebase logs** in the console

The authentication system should now be 100% functional! 🚀

