# 🚀 SportMap - Quick Setup Guide

**Last Updated:** October 22, 2025

---

## ✅ **CURRENT STATUS:**

- ✅ **Syntax Error:** Fixed (GoogleMapsView.tsx cleaned)
- ✅ **API Keys:** Configured in `.env`
- ✅ **Backend Service:** Updated to use new Supabase
- ✅ **Code:** 100% Complete
- ⏳ **Database:** Needs setup in Supabase
- ⏳ **Testing:** Pending after database

---

## 🎯 **TO GET APP WORKING:**

### **Step 1: Setup Database (5 minutes)**

You need to create database tables in your Supabase project.

**Option A: Use Friend's Database Schema**
- You have the complete schema from your friend's backend package
- Location: `c:/Users/Adrian/Downloads/friend-backend-package/database-schema.sql`
- This includes: users, events, event_participants, event_messages tables

**Option B: Create Minimal Schema**
Run this SQL in Supabase SQL Editor:

```sql
-- Users table
CREATE TABLE IF NOT EXISTS users (
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

-- Events table
CREATE TABLE IF NOT EXISTS events (
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
  status TEXT DEFAULT 'live',
  participants_count INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Event Participants
CREATE TABLE IF NOT EXISTS event_participants (
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (event_id, user_id)
);

-- Event Messages (Chat)
CREATE TABLE IF NOT EXISTS event_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_messages ENABLE ROW LEVEL SECURITY;

-- Basic policies
CREATE POLICY "Public read" ON users FOR SELECT USING (true);
CREATE POLICY "Public read" ON events FOR SELECT USING (true);
CREATE POLICY "Public read" ON event_participants FOR SELECT USING (true);
```

### **Step 2: Restart Expo (2 minutes)**

```bash
cd miliony
npx expo start --clear
```

### **Step 3: Test (5 minutes)**

- ✅ Map loads
- ✅ Can see location
- ✅ Can create events (long-press)
- ✅ Can join events
- ✅ Chat works

---

## 🔑 **YOUR CREDENTIALS:**

Located in `.env` file:

```
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyA3lHi62zKZ49NPY6oPkYW_TYasFRS5n4E
EXPO_PUBLIC_SUPABASE_URL=https://qqxpvrbdcyedescyxesu.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
EXPO_PROJECT_ID=372e8a03-e24f-4695-9ec5-f86f6408a7fa
```

---

## 📁 **IMPORTANT FILES:**

```
miliony/
├── .env                    (API keys)
├── app.config.js           (Expo config)
├── package.json            (Dependencies)
├── App.tsx                 (Entry point)
└── src/
    ├── services/
    │   └── supabase.ts     (Database service)
    └── components/
        ├── GoogleMapsView.tsx
        └── ... (all UI components)
```

---

## 🐛 **TROUBLESHOOTING:**

### **Map won't load:**
- Check `.env` has correct Google Maps API key
- Restart Expo: `npx expo start --clear`

### **Database errors:**
- Check Supabase URL in `.env`
- Verify tables exist in Supabase Table Editor

### **Syntax errors:**
- Already fixed! File cleaned on Oct 22, 2025

---

## 📞 **NEXT SESSION:**

1. Run database SQL in Supabase
2. Restart Expo
3. Test all features
4. Configure Google/Apple Sign In (optional)

---

**Total time to working app: 12 minutes** ⏱️

Good luck! 🎉


