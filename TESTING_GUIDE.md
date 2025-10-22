# 🎯 COMPLETE TESTING GUIDE FOR YOUR APP

## 📱 Testing Event Creation & Real-Time Sync

### Step 1: Run SQL Setup
Run this SQL in your Supabase Dashboard:
```sql
-- Enable Real-Time for Chat and Events
ALTER PUBLICATION supabase_realtime ADD TABLE events;
ALTER PUBLICATION supabase_realtime ADD TABLE event_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE event_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE users;

-- Create sample events for testing
INSERT INTO events (title, sport_type, description, max_participants, latitude, longitude, location_name, created_by, scheduled_datetime, status) VALUES
('Live Basketball Game', 'Basketball', 'Real-time test basketball game', 10, 51.1079, 17.0385, 'Wrocław Center', 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', NOW() + INTERVAL '1 hour', 'active');

-- Add participants
INSERT INTO event_participants (event_id, user_id, joined_at)
SELECT e.id, 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', NOW()
FROM events e
WHERE e.title = 'Live Basketball Game';

-- Create test messages
INSERT INTO event_messages (event_id, user_id, message, created_at)
SELECT e.id, 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', 'Welcome to the live event! Chat is working!', NOW()
FROM events e
WHERE e.title = 'Live Basketball Game';
```

### Step 2: Test Your App
1. **Restart your app** (press `r` in terminal)
2. **Open the app** on your phone
3. **Navigate to Map screen**
4. **Look for events** - you should see "Live Basketball Game"
5. **Tap on the event** to open details
6. **Try to send a message** in the chat

### Step 3: Test Event Creation
1. **Tap "Create Event" button** on map
2. **Fill in event details:**
   - Title: "My Test Event"
   - Sport: Basketball
   - Description: "Testing event creation"
   - Max Participants: 10
   - Location: Use your current location
3. **Tap "Create Event"**
4. **Check if event appears** on the map

## 👥 Testing with Friends (Multi-User)

### Step 1: Create Test Users
Run this SQL to create test users:
```sql
-- Create test users for multi-device testing
INSERT INTO users (id, email, display_name, favorite_sports, created_at, updated_at) VALUES
('friend-1', 'friend1@test.com', 'Test Friend 1', '["Basketball", "Football"]', NOW(), NOW()),
('friend-2', 'friend2@test.com', 'Test Friend 2', '["Tennis", "Swimming"]', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  favorite_sports = EXCLUDED.favorite_sports,
  updated_at = NOW();
```

### Step 2: Test Multi-User Chat
1. **Create an event** on your phone
2. **Add test users as participants:**
```sql
-- Add friends to your event
INSERT INTO event_participants (event_id, user_id, joined_at)
SELECT e.id, 'friend-1', NOW()
FROM events e
WHERE e.title = 'My Test Event';

INSERT INTO event_participants (event_id, user_id, joined_at)
SELECT e.id, 'friend-2', NOW()
FROM events e
WHERE e.title = 'My Test Event';
```

3. **Send messages** from different users:
```sql
-- Send messages as different users
INSERT INTO event_messages (event_id, user_id, message, created_at)
SELECT e.id, 'friend-1', 'Hello from Friend 1!', NOW()
FROM events e
WHERE e.title = 'My Test Event';

INSERT INTO event_messages (event_id, user_id, message, created_at)
SELECT e.id, 'friend-2', 'Hello from Friend 2!', NOW()
FROM events e
WHERE e.title = 'My Test Event';
```

### Step 3: Test Real-Time Updates
1. **Open the event chat** on your phone
2. **Send a message** from your phone
3. **Check if it appears** in real-time
4. **Send messages via SQL** (as shown above)
5. **Check if they appear** on your phone instantly

## 🔧 Fixing Chat Issues

### If Chat is Not Working:
1. **Check real-time subscription** in your app logs
2. **Verify Supabase connection** is working
3. **Check if messages are being sent** to database
4. **Verify RLS policies** allow message reading

### If Events Don't Appear:
1. **Check map permissions** - location access
2. **Verify event creation** in database
3. **Check event fetching** in app logs
4. **Verify RLS policies** allow event reading

## 📊 Monitoring Real-Time

### Check Real-Time Status:
```sql
-- Check if real-time is enabled
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
```

### Monitor Chat Activity:
```sql
-- Check recent messages
SELECT em.*, u.display_name, e.title as event_title
FROM event_messages em
JOIN users u ON em.user_id = u.id
JOIN events e ON em.event_id = e.id
ORDER BY em.created_at DESC
LIMIT 10;
```

### Monitor Event Activity:
```sql
-- Check recent events
SELECT e.*, u.display_name as creator_name
FROM events e
JOIN users u ON e.created_by = u.id
ORDER BY e.created_at DESC
LIMIT 10;
```

## 🎉 Success Indicators

### Your App is Working If:
- ✅ **Events appear** on the map
- ✅ **Event creation** works without errors
- ✅ **Chat messages** appear in real-time
- ✅ **Profile data** syncs properly
- ✅ **No "Property 'supabase' doesn't exist" errors**
- ✅ **No "Cannot read property 'from' of undefined" errors**

### Testing Checklist:
- [ ] Create an event
- [ ] Join an event
- [ ] Send a chat message
- [ ] Receive a chat message
- [ ] Update profile
- [ ] View other users' profiles
- [ ] Real-time updates work

## 🚀 Next Steps

1. **Run the SQL setup**
2. **Test basic functionality**
3. **Test with friends**
4. **Verify real-time sync**
5. **Deploy to Google Play!**

Your app should now be fully functional with real-time chat and event synchronization! 🎉
