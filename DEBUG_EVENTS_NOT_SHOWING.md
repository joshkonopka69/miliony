# 🔍 Debug: Events Not Showing on Map

## 🎯 **Possible Issues & Solutions**

Your code implementation is correct, but events might not be showing due to one of these reasons:

---

## ✅ **Issue 1: Events Are In The Future**

### **Problem:**
Your query filters for events with `scheduled_datetime > NOW()`, which means **only future events** will show.

### **Check Your Events:**
Run this SQL in Supabase:
```sql
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
WHERE status = 'active';
```

### **Solution:**
If `is_future` is `false`, your events are in the past! Update them:
```sql
UPDATE events 
SET scheduled_datetime = NOW() + INTERVAL '1 day'
WHERE status = 'active';
```

---

## ✅ **Issue 2: Map Not Centered on Warsaw**

### **Problem:**
Events are at Warsaw coordinates (52.23, 21.01), but map might be centered elsewhere.

### **Check Console Logs:**
Look for these logs in Metro bundler:
```
🔄 Fetching events from Supabase...
✅ Fetched 3 events successfully
📊 Events data: [...]
```

### **Solution:**
If events are fetched but not visible, the map is probably not zoomed to the right location. 

**Option 1: Center map on first event**
Add this to `MapScreen.tsx` after fetching events:

```typescript
useEffect(() => {
  if (events.length > 0 && mapRef.current) {
    // Center map on first event
    mapRef.current.animateToRegion({
      latitude: events[0].latitude,
      longitude: events[0].longitude,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    });
  }
}, [events]);
```

**Option 2: Use user's location**
The current implementation tries to use user location, but if location permission is denied, it might default to a different location.

---

## ✅ **Issue 3: GoogleMapsView Not Rendering Markers**

### **Problem:**
The `createEventMarkers()` function in GoogleMapsView might not be called.

### **Check:**
Look at line 152 in GoogleMapsView.tsx:
```javascript
${events.length > 0 ? 'createEventMarkers();' : ''}
```

This should be inside the `initMap()` function.

### **Solution:**
Make sure the HTML includes the marker creation call. Check the console for any JavaScript errors in the WebView.

---

## ✅ **Issue 4: Supabase RLS Policies**

### **Problem:**
Row Level Security (RLS) might be blocking the query.

### **Check RLS Policies:**
In Supabase Dashboard → Authentication → Policies:

1. **events table** should have a SELECT policy like:
```sql
CREATE POLICY "Allow public read access to events"
ON events FOR SELECT
USING (true);
```

OR for authenticated users only:
```sql
CREATE POLICY "Allow authenticated read access to events"
ON events FOR SELECT
TO authenticated
USING (true);
```

### **Temporary Test:**
Disable RLS temporarily to test:
```sql
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
```

**⚠️ Don't forget to re-enable it after testing!**

---

## ✅ **Issue 5: WebView Not Loading Google Maps**

### **Problem:**
Google Maps API key might be missing or invalid.

### **Check:**
Look for this error in console:
```
Google Maps JavaScript API error: ...
```

### **Solution:**
1. Verify your Google Maps API key in `.env` file
2. Make sure the API key has:
   - Maps JavaScript API enabled
   - Maps SDK for Android enabled (if testing on Android)
   - Maps SDK for iOS enabled (if testing on iOS)

---

## 🔧 **Quick Diagnostic Test**

Add this to your `MapScreen.tsx` inside the component, after the `fetchEventsFromSupabase` function:

```typescript
// 🔍 DEBUG: Log events whenever they change
useEffect(() => {
  console.log('🔍 DEBUG: Events state updated');
  console.log('   Count:', events.length);
  console.log('   Data:', JSON.stringify(events, null, 2));
}, [events]);
```

Then check Metro bundler console for output.

---

## 🎯 **Step-by-Step Debugging**

### **Step 1: Verify Data is Fetched**
Check console for:
```
✅ Fetched 3 events successfully
```

If you see this → Data is fetched correctly ✅

If you see:
```
ℹ️ No active events found
```
→ Events don't match your query filters ❌

### **Step 2: Verify Events Reach GoogleMapsView**
Add this to `GoogleMapsView.tsx` at the top of the component:

```typescript
useEffect(() => {
  console.log('📍 GoogleMapsView received events:', events.length);
}, [events]);
```

### **Step 3: Verify Markers Are Created**
In the WebView HTML, the markers should be created. Check for JavaScript console errors.

### **Step 4: Verify Map Location**
Your events are at:
- Basketball: 52.2297, 21.0122
- Running: 52.2319, 21.0055
- Football: 52.2256, 21.0189

Make sure the map is zoomed to this area (Warsaw, Poland).

---

## 🚀 **Quick Fix Script**

Run this SQL to ensure your events are properly set up:

```sql
-- 1. Check current events
SELECT 
  id, 
  title, 
  sport_type, 
  status,
  scheduled_datetime,
  scheduled_datetime > NOW() as is_future,
  latitude,
  longitude
FROM events;

-- 2. Update to future dates if needed
UPDATE events 
SET scheduled_datetime = NOW() + INTERVAL '1 day'
WHERE status = 'active' 
  AND scheduled_datetime < NOW();

-- 3. Verify update
SELECT 
  title,
  sport_type,
  scheduled_datetime > NOW() as is_future
FROM events
WHERE status = 'active';
```

---

## 📱 **Test Checklist**

Run through these checks:

- [ ] Events exist in Supabase with `status = 'active'`
- [ ] Events have `scheduled_datetime > NOW()`
- [ ] Console shows "✅ Fetched X events successfully"
- [ ] Console shows events data array
- [ ] Map loads without errors
- [ ] Google Maps API key is valid
- [ ] RLS policies allow SELECT on events table
- [ ] Map is centered on Warsaw (52.23, 21.01)
- [ ] No JavaScript errors in console

---

## 💡 **Most Likely Issue**

Based on your setup, the **most likely issue** is that your events have past dates:

```sql
scheduled_datetime: 2025-10-08 18:00:00+00 (tomorrow 6 PM)
```

**But it's October 6, 2025**, so "tomorrow" would be October 7, not October 8!

**Fix:**
```sql
UPDATE events 
SET scheduled_datetime = '2025-10-07 18:00:00+00'
WHERE title = 'Basketball 3v3';

UPDATE events 
SET scheduled_datetime = '2025-10-07 07:00:00+00'
WHERE title = 'Morning 5K Run';

UPDATE events 
SET scheduled_datetime = '2025-10-07 16:00:00+00'
WHERE title = '5-a-side Football';
```

---

## 🎉 **After Fixing**

You should see:
1. Console log: "✅ Fetched 3 events successfully"
2. "3 events nearby" badge on map
3. Three markers with emojis: 🏀 🏃‍♂️ ⚽
4. Debug info at bottom showing "Events: 3"

**Test it now and let me know what you see in the console!** 🚀

