# 🚀 Quick Reference: Event System

## ✅ What's Working Now

### 1. Event Creation ✅
**Where**: Click any location on map → "Create Event Here" button  
**What happens**: 
- Modal opens with sport selection, date/time pickers
- Fill in details (title, participants, description)
- Event saves to database
- Appears on map immediately
- Shows in your "My Games" list

### 2. Viewing Events ✅
**MapScreen**: All upcoming events visible to everyone  
**MyGamesScreen**: Your created + joined events only  
**PlaceInfoModal**: Events at specific location  

### 3. Real-Time Sync ✅
- Events update automatically when created
- Participants count updates live
- No need to refresh manually

## 🔧 How It Works

### Database Table: `events`
```
name: "Basketball Game"
activity: "basketball" 
latitude: 51.0433565
longitude: 17.1163361
location_name: "Park Radwanicki"
place_id: "ChIJu-kwgcLdD0cRQ6mfrsY20Dc"
status: "live"  ← CRITICAL: Must be "live" (not "active" or "upcoming")
scheduled_datetime: "2025-11-04T14:07:13.473Z"
max_participants: 10
min_participants: 2
created_by: "c46dec97-bfd3-4d30-9cc8-178b1a2b66a7"
```

### Event Status Values
- ✅ `"live"` - Current/active events (REQUIRED for visibility)
- ❌ `"active"` - Not used (database constraint rejects it)
- ❌ `"upcoming"` - Not used (database constraint rejects it)

**Note**: Code currently creates events with `status: 'live'`

### User Authentication
- Uses `AuthContext` → `useAuth()` hook
- Gets user ID: `const { getUserId } = useAuth();`
- User must be logged in to create events

## 📱 User Features

### MapScreen
```
- View all events on map
- Click location → See events there
- Create event at location
- Real-time event updates
```

### MyGamesScreen  
```
- See YOUR created events (role: 'created')
- See YOUR joined events (role: 'joined')
- Pull to refresh
- Real-time sync
- Grouped by time (Today, Tomorrow, This Week, Later)
```

### PlaceInfoModal
```
- Opens when clicking location marker
- Shows location details (name, address, photos)
- Lists upcoming events at location
- "Create Event Here" button
- Distance from user location
```

## 🐛 Common Issues & Fixes

### Issue: "Status check constraint violation"
**Cause**: Trying to use status other than 'live'  
**Fix**: Always use `status: 'live'` when creating events

### Issue: "User not authenticated"
**Cause**: `getUserId()` returns null  
**Fix**: Ensure user is logged in before accessing MapScreen

### Issue: Events don't show on map
**Cause**: Status filter mismatch  
**Fix**: Check query uses `.in('status', ['live', 'active', 'upcoming'])`

### Issue: Events don't show in MyGamesScreen
**Cause**: User not in `event_participants` table  
**Fix**: `CreateEventModal` automatically adds creator as participant

### Issue: Real-time updates not working
**Cause**: Subscription channel not active  
**Fix**: Check console for "Subscribed to changes" logs

## 📊 Data Flow

### Creating an Event:
```
User taps location
  ↓
PlaceInfoModal opens
  ↓
"Create Event Here" button
  ↓
CreateEventModal opens
  ↓
User fills form
  ↓
Submit → Supabase INSERT into events
  ↓
INSERT into event_participants (creator)
  ↓
Real-time broadcast
  ↓
All users see new event on map
```

### Loading My Games:
```
MyGamesScreen mounts
  ↓
getUserId() from AuthContext
  ↓
Query events table WHERE created_by = userId
  ↓
Query event_participants WHERE user_id = userId
  ↓
Combine results (union)
  ↓
Transform to MyEvent format
  ↓
Display grouped by time
```

## 🔍 Debugging Tips

### Check Event Creation:
```typescript
console.log('📝 Creating event...');
console.log('   User ID:', userId);
console.log('   Status:', 'live'); // Must be 'live'
console.log('   Location:', location.name);
```

### Check Event Fetching:
```typescript
console.log('🔄 Fetching events...');
console.log('   Status filter:', ['live', 'active', 'upcoming']);
console.log('   Future events only:', new Date().toISOString());
```

### Check Real-Time:
```typescript
const subscription = supabase
  .channel('my-events')
  .on('postgres_changes', { table: 'events' }, (payload) => {
    console.log('📡 Event change:', payload);
  })
  .subscribe();
```

## 🎯 Quick Commands

### Create Test Event (via Supabase SQL):
```sql
INSERT INTO events (
  id, name, activity, latitude, longitude,
  location_name, status, scheduled_datetime,
  max_participants, min_participants, created_by
) VALUES (
  gen_random_uuid(),
  'Test Basketball',
  'basketball',
  51.0433565,
  17.1163361,
  'Test Park',
  'live',
  NOW() + interval '1 day',
  10,
  2,
  'YOUR_USER_ID_HERE'
);
```

### Check Events:
```sql
SELECT id, name, activity, status, scheduled_datetime, created_by
FROM events
WHERE status = 'live'
AND scheduled_datetime >= NOW()
ORDER BY scheduled_datetime ASC;
```

### Check User Events:
```sql
SELECT e.*, ep.user_id
FROM events e
LEFT JOIN event_participants ep ON e.id = ep.event_id
WHERE e.created_by = 'YOUR_USER_ID' OR ep.user_id = 'YOUR_USER_ID';
```

## 📞 Need Help?

1. **Check Console Logs**: Detailed logging in all event operations
2. **Check Supabase Dashboard**: Verify data is being saved
3. **Check RLS Policies**: Currently DISABLED for testing
4. **Check User Auth**: Verify `getUserId()` returns valid ID
5. **Check Status Value**: Must be 'live' (not 'active' or 'upcoming')

---

**Everything is working! Enjoy creating events! 🎉**


