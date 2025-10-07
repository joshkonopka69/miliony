# 🐛 DEBUG EVENT PINS - Find Why Pins Don't Show

## What I've Added

I've added debug logs at **3 critical points** in the event rendering pipeline to find where the data is getting lost:

### 1. MapScreen (Line 234)
```typescript
console.log('🗺️ MapScreen passing events to EnhancedInteractiveMap:', events.length, 'events');
```
This shows how many events MapScreen is passing to the map component.

### 2. EnhancedInteractiveMap (Lines 100-101)
```typescript
console.log('🗺️ EnhancedInteractiveMap received events prop:', events.length, 'events');
console.log('🗺️ EnhancedInteractiveMap events data:', events);
```
This shows if the events are being received by the intermediate component.

### 3. GoogleMapsView (Lines 63-64)
```typescript
console.log('🗺️ GoogleMapsView received events:', events);
console.log('🗺️ GoogleMapsView events count:', events.length);
```
This shows if the events reach the actual map rendering component.

## What to Do Now

1. **Reload your app** (shake phone → Reload)
2. **Navigate to the Map screen**
3. **Check the terminal logs**

## What You Should See

### ✅ If Everything Works:
```
✅ Fetched 3 events successfully
📊 Events data: [array of 3 events]
🗺️ MapScreen passing events to EnhancedInteractiveMap: 3 events
🗺️ EnhancedInteractiveMap received events prop: 3 events
🗺️ EnhancedInteractiveMap events data: [array of 3 events]
🗺️ GoogleMapsView received events: [array of 3 events]
🗺️ GoogleMapsView events count: 3
```

### ❌ If Events Get Lost:
The logs will show WHERE the events disappear:

**Scenario 1: Events lost between MapScreen and EnhancedInteractiveMap**
```
✅ Fetched 3 events successfully
🗺️ MapScreen passing events to EnhancedInteractiveMap: 3 events
🗺️ EnhancedInteractiveMap received events prop: 0 events  ← Problem here!
```
**Solution:** Props not being passed correctly

**Scenario 2: Events lost between EnhancedInteractiveMap and GoogleMapsView**
```
🗺️ EnhancedInteractiveMap received events prop: 3 events
🗺️ GoogleMapsView received events: []  ← Problem here!
```
**Solution:** EnhancedInteractiveMap not passing events to GoogleMapsView

**Scenario 3: Events reach GoogleMapsView but pins don't render**
```
🗺️ GoogleMapsView received events: [array of 3 events]
🗺️ GoogleMapsView events count: 3
```
But no pins show on map.
**Solution:** Issue with marker rendering or invalid coordinates

## Common Issues & Solutions

### Issue: All logs show 0 events
**Problem:** Events not being fetched from Supabase  
**Check:**
- Run `SELECT * FROM events WHERE status = 'active';` in Supabase
- Verify events have `status = 'active'` (not 'live')

### Issue: Events have NULL coordinates
**Problem:** latitude/longitude are NULL in database  
**Solution:** Run `SET_EVENTS_TO_WROCLAW.sql` to set Wrocław coordinates

### Issue: Events have wrong coordinates
**Problem:** Coordinates are outside Wrocław  
**Solution:** Check coordinates are:
- latitude: 50.9 - 51.3
- longitude: 16.8 - 17.5

### Issue: Map not centered on events
**Problem:** Map might be zoomed to wrong location  
**Solution:** Map should center on your location (Wrocław)

## After You See the Logs

**Send me the terminal output** showing all the 🗺️ logs, and I'll tell you exactly where the problem is!

