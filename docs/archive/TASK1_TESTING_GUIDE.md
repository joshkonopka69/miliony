# 🧪 TASK 1 TESTING GUIDE: Location Details Modal

**Date:** October 28, 2025  
**Status:** ✅ Ready for Testing  
**Components:** LocationDetailsModal, MapScreen, Supabase, Google Places API

---

## 📋 **PRE-FLIGHT CHECKLIST:**

Before testing, ensure:
- [ ] Expo is running (port 8088+)
- [ ] App is loaded on device/emulator
- [ ] Location permission granted
- [ ] Internet connection active
- [ ] Google Places API key configured

---

## 🎯 **TEST SCENARIOS:**

### **TEST 1: Open Location Details Modal**

**Steps:**
1. Open app → MapScreen loads
2. Tap filter button (top right)
3. Select "Parks" or "Gyms"
4. Tap "Apply"
5. Wait for markers to appear
6. **Tap any green venue marker**

**Expected Result:**
✅ Location Details Modal slides up from bottom  
✅ Modal header shows "Location Details" with X button  
✅ Loading indicator appears briefly  

**Console Log to Check:**
```
📍 MapScreen: Location selected: { name: "...", placeId: "..." }
📍 Fetching events at location:
   Place ID: ChIJ...
   Coordinates: 51.XXXX, 17.XXXX
```

---

### **TEST 2: Verify Google Photo Loads**

**After opening modal:**

**Expected Result:**
✅ Photo loads within 1-2 seconds  
✅ Shows location exterior/interior photo  
✅ High quality (800px wide)  

**OR (if no photo available):**
✅ Gray placeholder with 📍 emoji  

**Console Log to Check:**
```
[Google Places Details API should return photos array]
```

**Fallback Test:**
- If photo fails to load, verify API key is valid
- Check `EXPO_PUBLIC_GOOGLE_PLACES_API_KEY` in `.env`

---

### **TEST 3: Verify Location Information**

**After modal opens:**

**Should Display:**
1. **Location Name** (large, bold at top)
   - Example: "Park Szczytnicki"
2. **Address** (below name)
   - Example: "Wrocław" or full street address
3. **Rating** (if available)
   - Example: "⭐ 4.5 (150 reviews)"
4. **Distance** (if user location available)
   - Example: "📍 1.2km away" or "📍 450m away"

**Expected Result:**
✅ All text is readable and properly formatted  
✅ Rating shows star emoji + number  
✅ Distance updates based on your location  

---

### **TEST 4: Verify Events List**

#### **TEST 4A: Location WITH Events**

**If there are events at this location:**

**Expected Result:**
✅ "Upcoming Events" header visible  
✅ Event count shows (e.g., "3 events")  
✅ Each event card displays:
  - Sport emoji (🏀, ⚽, 🎾, etc.)
  - Event title (bold)
  - Creator name ("by username")
  - Date/time formatted:
    - "Today • 6:00 PM"
    - "Tomorrow • 2:00 PM"
    - "Oct 30 • 3:00 PM"
  - Participants: "👥 5/10 players"
  - Green progress bar (filled 50% in this example)
  - Description (if present, 2 lines max)

**Test Interaction:**
1. Tap an event card
2. **Expected:** Alert shows event details
3. **Console:** `🎮 MapScreen: Event selected: { name: "..." }`

#### **TEST 4B: Location WITHOUT Events**

**If no events at location:**

**Expected Result:**
✅ "Upcoming Events" header visible  
✅ Event count shows "0 events"  
✅ Empty state displays:
  - Large 📅 emoji
  - "No events yet"
  - "Be the first to create an event at this location!"

---

### **TEST 5: Create Event Button**

**At bottom of modal:**

**Expected Result:**
✅ Blue button with text: "✨ Create Event at This Location"  
✅ Button has shadow/elevation  
✅ Tapping button:
  - Modal closes
  - Alert shows: "Event creation at [Location Name] will be implemented in the next step!"
  - **Console:** `✨ MapScreen: Creating event at: [Location Name]`

---

### **TEST 6: Close Modal**

**Two ways to close:**

#### **Method 1: X Button**
1. Tap X button (top left)
2. **Expected:** Modal closes with slide-down animation

#### **Method 2: Swipe Down**
1. Swipe down from top of modal
2. **Expected:** Modal closes (iOS native gesture)

**After Closing:**
✅ Modal disappears  
✅ Map remains visible  
✅ Markers still showing  

---

### **TEST 7: Multiple Locations**

**Steps:**
1. Open modal for location A
2. Verify data loads
3. Close modal
4. Tap marker for location B
5. Modal opens again

**Expected Result:**
✅ New location data loads  
✅ Photo changes (if different location)  
✅ Events list changes  
✅ No stale data from previous location  

**Console Log to Check:**
```
📍 MapScreen: Location selected: { name: "Location B", ... }
📍 Fetching events at location:
   Place ID: [different ID]
✓ Found X events by place_id
```

---

## 🐛 **COMMON ISSUES & FIXES:**

### **Issue 1: Modal doesn't open**

**Symptoms:** Tapping marker does nothing

**Debug:**
1. Check console for: `📍 MapScreen: Location selected:`
2. If missing → `onLocationSelect` not wired
3. Verify EnhancedInteractiveMap has `onLocationSelect` prop

**Fix:**
```typescript
// In MapScreen.tsx, verify this line exists:
<EnhancedInteractiveMap
  onLocationSelect={handleLocationSelect}  // ← Must be present
  ...
/>
```

---

### **Issue 2: No photo loads**

**Symptoms:** Gray placeholder always shows

**Debug:**
1. Check console for API errors
2. Verify `.env` has: `EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=...`
3. Test API key in browser:
   ```
   https://maps.googleapis.com/maps/api/place/details/json?place_id=ChIJ...&key=YOUR_KEY
   ```

**Note:** Some locations legitimately don't have photos!

---

### **Issue 3: No events show**

**Symptoms:** Always shows "No events yet"

**Debug:**
1. Check console: Should see "✓ Found X events by place_id" or "by proximity"
2. Verify Supabase `events` table:
   - Has records with `status='active'`
   - `scheduled_datetime` is in future
   - `place_id` matches OR coordinates are close (±0.001 degrees)

**Test Query:**
```sql
SELECT * FROM events 
WHERE status = 'active' 
AND scheduled_datetime > NOW()
LIMIT 10;
```

---

### **Issue 4: Events show but missing data**

**Symptoms:** Event card shows "by Unknown" or wrong participants

**Debug:**
1. Check console for join errors
2. Verify `users` table has creator record
3. Verify `event_participants` table populated

**Fix:** Run in Supabase SQL Editor:
```sql
-- Check if creator exists
SELECT e.id, e.name, e.creator_id, u.display_name 
FROM events e
LEFT JOIN users u ON e.creator_id = u.id
WHERE e.id = 'event-id-here';

-- Check participants
SELECT * FROM event_participants 
WHERE event_id = 'event-id-here';
```

---

### **Issue 5: Distance shows wrong/missing**

**Symptoms:** No distance shown or shows "NaN km away"

**Debug:**
1. Verify location permission granted
2. Check `userLocation` state in MapScreen
3. Verify modal receives `userLocation` prop

**Console Check:**
```
📍 User location obtained: { latitude: X, longitude: Y }
```

---

## ✅ **SUCCESS CHECKLIST:**

After all tests, you should have:

- [ ] Modal opens when tapping venue marker
- [ ] Google photo displays (or placeholder)
- [ ] Location name, address, rating visible
- [ ] Distance calculated and shown
- [ ] Events list loads from Supabase
- [ ] Event cards formatted correctly
- [ ] Empty state shows when no events
- [ ] Event tap shows alert
- [ ] Create button shows alert
- [ ] Modal closes properly
- [ ] Multiple locations work correctly

---

## 📸 **EXPECTED SCREENSHOTS:**

### **With Events:**
```
┌─────────────────────────┐
│  ✕  Location Details    │
├─────────────────────────┤
│ [  Beautiful Photo   ]  │
│                         │
│ Park Szczytnicki        │
│ Wrocław                 │
│ ⭐ 4.7 (234 reviews)   │
│ 📍 1.5km away          │
│                         │
│ Upcoming Events    3    │
│                         │
│ ┌─────────────────────┐ │
│ │ 🏀 Basketball Game  │ │
│ │ by john_doe         │ │
│ │ 📅 Today • 6:00 PM  │ │
│ │ 👥 5/10 players     │ │
│ │ ▓▓▓▓▓░░░░░ 50%     │ │
│ └─────────────────────┘ │
│                         │
│ [More events...]        │
│                         │
│ ┌─────────────────────┐ │
│ │ ✨ Create Event at  │ │
│ │   This Location     │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

### **Without Events:**
```
┌─────────────────────────┐
│  ✕  Location Details    │
├─────────────────────────┤
│ [  Beautiful Photo   ]  │
│                         │
│ Fitness Center ABC      │
│ ul. Sportowa 15        │
│ ⭐ 4.5 (89 reviews)    │
│ 📍 450m away           │
│                         │
│ Upcoming Events    0    │
│                         │
│       📅               │
│   No events yet         │
│ Be the first to create  │
│ an event at this loc!   │
│                         │
│ ┌─────────────────────┐ │
│ │ ✨ Create Event at  │ │
│ │   This Location     │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

---

## 🚀 **NEXT STEPS AFTER TESTING:**

Once testing is complete and successful:

1. **Report Results** to user with screenshots
2. **Move to TASK 2:** Profile Photo Upload
3. **Prepare for TASK 3:** Create Event Modal (will use this location data)

---

**Happy Testing! 🎉**



