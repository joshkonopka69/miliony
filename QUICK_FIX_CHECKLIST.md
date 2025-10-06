# ✅ Quick Fix Checklist - Get Events Showing NOW!

## 🎯 **The Problem**

Your code is correct, but events aren't showing because:
1. Events might have **past dates** (query filters for future events only)
2. **RLS policies** might be blocking access
3. Events might not exist in database

---

## 🚀 **Fix in 3 Steps** (5 minutes)

### **Step 1: Run SQL Fix** (2 minutes)

1. Open **Supabase Dashboard**
2. Go to **SQL Editor**
3. Open file `FIX_EVENTS_NOW.sql` (in your project root)
4. **Copy all contents** and paste into SQL Editor
5. Click **Run**

You should see:
```
✅ AFTER FIX
✅ READY TO TEST - events_that_will_show: 3
```

---

### **Step 2: Restart Your App** (1 minute)

```bash
cd /home/hubi/SportMap/miliony

# Stop current Expo (Ctrl+C)

# Start fresh
npx expo start --clear
```

---

### **Step 3: Check Console** (2 minutes)

Look for these logs in Metro bundler:
```
🔄 Fetching events from Supabase...
✅ Fetched 3 events successfully
📊 Events data: [...]
```

**If you see this** → Events are loading correctly! ✅

**If you see "ℹ️ No active events found"** → SQL fix didn't work, try Step 4

---

## 🆘 **Step 4: If Still Not Working**

### **Option A: Check in Supabase**
```sql
SELECT 
  title,
  status,
  scheduled_datetime,
  scheduled_datetime > NOW() as will_show
FROM events;
```

All `will_show` should be `true`

### **Option B: Insert Fresh Events**
```sql
-- Get your user ID
SELECT id FROM auth.users LIMIT 1;

-- Insert 3 test events (replace YOUR_USER_ID with actual ID)
INSERT INTO events (creator_id, title, sport_type, latitude, longitude, place_name, scheduled_datetime, min_participants, max_participants, requires_approval, status)
VALUES 
  ('YOUR_USER_ID', 'Basketball 3v3', 'basketball', 52.2297, 21.0122, 'Warsaw Park', NOW() + INTERVAL '1 day', 1, 6, false, 'active'),
  ('YOUR_USER_ID', 'Morning Run', 'running', 52.2319, 21.0055, 'Łazienki Park', NOW() + INTERVAL '2 days', 1, 10, false, 'active'),
  ('YOUR_USER_ID', 'Football Match', 'football', 52.2256, 21.0189, 'Torwar', NOW() + INTERVAL '3 days', 1, 10, false, 'active');
```

---

## ✅ **Success Indicators**

### **In Console:**
- ✅ "✅ Fetched 3 events successfully"
- ✅ "📊 Events data: [...]"
- ✅ No errors

### **On Map Screen:**
- ✅ Yellow badge: "3 events nearby"
- ✅ Three markers with emojis: 🏀 🏃‍♂️ ⚽
- ✅ Debug info (bottom): "Events: 3 | Loading: No"
- ✅ Sports list: "basketball, running, football"

### **When Tapping Marker:**
- ✅ Info window opens
- ✅ Shows event name, sport, participants

---

## 📋 **Troubleshooting**

| Symptom | Cause | Fix |
|---------|-------|-----|
| "ℹ️ No active events found" | Events have past dates or wrong status | Run `FIX_EVENTS_NOW.sql` |
| "❌ Supabase query error" | RLS blocking access | `ALTER TABLE events DISABLE ROW LEVEL SECURITY;` |
| Map shows but no markers | Events not in visible area | Zoom to Warsaw (52.23, 21.01) |
| Console shows "Fetched 0 events" | No events in database | Insert test events (see Option B) |
| App crashes on start | Code error | Check Metro bundler for red errors |

---

## 🎯 **Most Likely Issue**

**Events have past `scheduled_datetime`**

Your query:
```typescript
.gt('scheduled_datetime', new Date().toISOString())
```

Only shows **future** events. If your events are in the past, they won't appear.

**Quick Test:** Temporarily remove the date filter:
```typescript
// Comment out this line in MapScreen.tsx (line 109):
// .gt('scheduled_datetime', new Date().toISOString())
```

If events show after commenting → Confirm the date issue, then run SQL fix.

---

## 📞 **Still Stuck?**

Check these files:
1. `COMPLETE_FIX_EVENTS_NOT_SHOWING.md` - Detailed guide
2. `DEBUG_EVENTS_NOT_SHOWING.md` - Debugging steps
3. `FIX_EVENTS_NOW.sql` - SQL fix script

Or share your console logs and I'll help debug!

---

**🚀 Start with Step 1: Run FIX_EVENTS_NOW.sql**

