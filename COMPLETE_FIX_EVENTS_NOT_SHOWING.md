# 🔧 Complete Fix: Events Not Showing

## ✅ **Your Implementation is Correct!**

I've checked your code and found:
- ✅ No TypeScript/linter errors
- ✅ MapScreen correctly fetches events from Supabase
- ✅ Events are passed to EnhancedInteractiveMap correctly
- ✅ EnhancedInteractiveMap passes events to GoogleMapsView correctly
- ✅ GoogleMapsView has marker rendering logic

**The issue is likely with your Supabase data, not your code!**

---

## 🎯 **Most Common Issues & Fixes**

### **Issue #1: Events Have Past Dates** ⏰

Your query filters for `scheduled_datetime > NOW()`, so past events won't show.

**Fix in Supabase SQL Editor:**
```sql
-- Check your events
SELECT 
  id, 
  title, 
  sport_type, 
  status,
  scheduled_datetime,
  NOW() as current_time,
  scheduled_datetime > NOW() as will_show_in_app
FROM events 
WHERE status = 'active';
```

If `will_show_in_app` is `false`, update them:
```sql
-- Update all active events to tomorrow
UPDATE events 
SET scheduled_datetime = (NOW() + INTERVAL '1 day')::timestamp
WHERE status = 'active';
```

---

### **Issue #2: Supabase RLS Policies Blocking Access** 🔒

Row Level Security might be preventing the SELECT query.

**Quick Test - Disable RLS temporarily:**
```sql
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
```

**Proper Fix - Add SELECT policy:**
```sql
-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read active events
CREATE POLICY "Allow public read access to active events"
ON events FOR SELECT
USING (status = 'active');
```

---

### **Issue #3: No Events in Database** 📊

Maybe events were never created or got deleted.

**Check:**
```sql
SELECT COUNT(*) FROM events;
```

If 0, insert test events:
```sql
-- Get your user ID first
SELECT id FROM auth.users LIMIT 1;

-- Then insert (replace YOUR_USER_ID)
INSERT INTO events (
  creator_id, title, description, sport_type,
  latitude, longitude, place_name,
  scheduled_datetime, min_participants, max_participants,
  requires_approval, status
) VALUES 
  ('YOUR_USER_ID', 'Basketball 3v3', 'Casual game', 'basketball',
   52.2297, 21.0122, 'Warsaw Central Park',
   NOW() + INTERVAL '1 day', 1, 6, false, 'active'),
  
  ('YOUR_USER_ID', 'Morning 5K Run', 'Easy pace', 'running',
   52.2319, 21.0055, 'Łazienki Park',
   NOW() + INTERVAL '1 day', 1, 10, false, 'active'),
  
  ('YOUR_USER_ID', '5-a-side Football', 'Friendly match', 'football',
   52.2256, 21.0189, 'Torwar Sports Complex',
   NOW() + INTERVAL '1 day', 1, 10, false, 'active');
```

---

### **Issue #4: Wrong Column Names** 📝

Your schema uses `title` and `sport_type`, but the query might be looking for different columns.

**Verify schema:**
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'events';
```

Should show:
- `title` (text)
- `sport_type` (text)
- `scheduled_datetime` (timestamp)
- `latitude` (numeric)
- `longitude` (numeric)
- `status` (text)

---

## 🚀 **Complete SQL Fix Script**

Run this entire script in Supabase SQL Editor:

```sql
-- ═══════════════════════════════════════════════════════
-- COMPLETE FIX SCRIPT FOR EVENTS NOT SHOWING
-- ═══════════════════════════════════════════════════════

-- Step 1: Check current state
SELECT 
  'Current Events' as info,
  COUNT(*) as total_events,
  COUNT(*) FILTER (WHERE status = 'active') as active_events,
  COUNT(*) FILTER (WHERE scheduled_datetime > NOW()) as future_events
FROM events;

-- Step 2: Disable RLS temporarily for testing
ALTER TABLE events DISABLE ROW LEVEL SECURITY;

-- Step 3: Update existing events to future dates
UPDATE events 
SET scheduled_datetime = (NOW() + INTERVAL '1 day' + (random() * INTERVAL '7 days'))::timestamp
WHERE status = 'active' 
  AND scheduled_datetime < NOW();

-- Step 4: Verify updates
SELECT 
  id, 
  title, 
  sport_type,
  status,
  scheduled_datetime,
  scheduled_datetime > NOW() as is_future,
  latitude,
  longitude
FROM events 
WHERE status = 'active'
ORDER BY scheduled_datetime;

-- Step 5: If no events exist, insert test data
DO $$
DECLARE
  user_id uuid;
  event_count integer;
BEGIN
  -- Get first user ID
  SELECT id INTO user_id FROM auth.users LIMIT 1;
  
  -- Check if events exist
  SELECT COUNT(*) INTO event_count FROM events;
  
  -- Insert only if no events exist
  IF event_count = 0 AND user_id IS NOT NULL THEN
    INSERT INTO events (
      creator_id, title, description, sport_type,
      latitude, longitude, place_name,
      scheduled_datetime, min_participants, max_participants,
      requires_approval, status
    ) VALUES 
      (user_id, 'Basketball 3v3', 'Casual basketball game', 'basketball',
       52.2297, 21.0122, 'Warsaw Central Park',
       NOW() + INTERVAL '1 day', 1, 6, false, 'active'),
      
      (user_id, 'Morning 5K Run', 'Easy pace run', 'running',
       52.2319, 21.0055, 'Łazienki Park',
       NOW() + INTERVAL '2 days', 1, 10, false, 'active'),
      
      (user_id, '5-a-side Football', 'Friendly match', 'football',
       52.2256, 21.0189, 'Torwar Sports Complex',
       NOW() + INTERVAL '3 days', 1, 10, false, 'active');
    
    RAISE NOTICE 'Inserted 3 test events';
  ELSE
    RAISE NOTICE 'Events already exist or no user found';
  END IF;
END $$;

-- Step 6: Final verification
SELECT 
  'Final Check' as info,
  title,
  sport_type,
  scheduled_datetime > NOW() as will_show_in_app,
  latitude,
  longitude
FROM events 
WHERE status = 'active'
ORDER BY scheduled_datetime;

-- Step 7: Re-enable RLS with proper policy
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Allow public read access to active events"
ON events FOR SELECT
USING (status = 'active');

-- Done!
SELECT '✅ Fix complete! Run your app now.' as message;
```

---

## 📱 **App-Side Debugging**

Add temporary console logs to verify data flow:

### **1. Add to MapScreen.tsx (line 140, after setEvents):**
```typescript
console.log(`✅ Fetched ${transformedEvents.length} events successfully`);
console.log('📊 Events data:', transformedEvents);
setEvents(transformedEvents);

// ADD THIS:
console.log('🔍 Events set in state, length:', transformedEvents.length);
if (transformedEvents.length > 0) {
  console.log('🎯 First event:', {
    name: transformedEvents[0].name,
    activity: transformedEvents[0].activity,
    lat: transformedEvents[0].latitude,
    lng: transformedEvents[0].longitude,
  });
}
```

### **2. Add to EnhancedInteractiveMap.tsx (after line 70):**
```typescript
}: EnhancedInteractiveMapProps) {
  // ADD THIS:
  useEffect(() => {
    console.log('🗺️ EnhancedInteractiveMap received events:', events.length);
    if (events.length > 0) {
      console.log('  First event:', events[0].name);
    }
  }, [events]);
```

### **3. Add to GoogleMapsView.tsx (after line 48):**
```typescript
}: GoogleMapsViewProps) {
  // ADD THIS:
  useEffect(() => {
    console.log('📍 GoogleMapsView received events:', events?.length || 0);
  }, [events]);
```

---

## 🎯 **Test Checklist**

After running the SQL fix script:

1. **Check Supabase:**
   ```sql
   SELECT title, scheduled_datetime > NOW() as will_show
   FROM events WHERE status = 'active';
   ```
   All should show `will_show = true`

2. **Run App:**
   ```bash
   cd /home/hubi/SportMap/miliony
   npx expo start
   ```

3. **Check Console Logs:**
   Look for:
   ```
   🔄 Fetching events from Supabase...
   ✅ Fetched 3 events successfully
   📊 Events data: [...]
   🔍 Events set in state, length: 3
   🎯 First event: { name: '...', ... }
   🗺️ EnhancedInteractiveMap received events: 3
   📍 GoogleMapsView received events: 3
   ```

4. **On Map Screen:**
   - Should see "3 events nearby" badge
   - Should see 3 markers with emojis
   - Should see debug info at bottom

---

## ⚡ **Quick Test Without Code Changes**

1. **Open Supabase SQL Editor**

2. **Run this:**
   ```sql
   -- Temporarily disable RLS
   ALTER TABLE events DISABLE ROW LEVEL SECURITY;
   
   -- Update all events to tomorrow
   UPDATE events SET scheduled_datetime = NOW() + INTERVAL '1 day';
   
   -- Check
   SELECT title, scheduled_datetime FROM events;
   ```

3. **Restart your app**

4. **If events show now** → Problem was RLS or past dates

5. **If events still don't show** → Problem is elsewhere (check console logs)

---

## 🆘 **Still Not Working?**

If events still don't show after running the SQL script:

1. **Check Google Maps API Key:**
   - Open `.env` file
   - Verify `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` is set
   - Check it's enabled in Google Cloud Console

2. **Check Supabase Connection:**
   - Verify `.env` has correct `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`

3. **Check Console for Errors:**
   Look for:
   - `❌ Supabase query error`
   - `Failed to load events`
   - Any red error messages

4. **Test Supabase Connection:**
   Add this temporary test to MapScreen:
   ```typescript
   useEffect(() => {
     const testConnection = async () => {
       const { data, error } = await supabase.from('events').select('count');
       console.log('🔌 Supabase connection test:', { data, error });
     };
     testConnection();
   }, []);
   ```

---

## 🎉 **Expected Result**

After the fix, you should see:

1. **Console:**
   ```
   ✅ Fetched 3 events successfully
   🗺️ EnhancedInteractiveMap received events: 3
   📍 GoogleMapsView received events: 3
   ```

2. **Map Screen:**
   - Yellow badge: "3 events nearby"
   - Three markers: 🏀 🏃‍♂️ ⚽
   - Debug info: "Events: 3 | Loading: No"

3. **Tap marker:**
   - Info window opens
   - Shows event details

---

**🚀 Run the SQL script now and restart your app!**

