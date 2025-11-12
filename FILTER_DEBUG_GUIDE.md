# 🐛 Filter Debugging Guide

## Issue Reported:
"Swimming Pool" filter shows all nearby places instead of just swimming pools.

---

## 🔍 **Enhanced Logging Applied:**

I've added detailed logging to help identify the issue:

### **New Log Emojis:**
- 🔍 Search initiation
- 🎯 Type-based search
- ⚠️ Warnings/fallbacks
- ✅ Success
- ❌ Errors  
- 📊 Statistics
- 📍 Sample data
- 🌐 API requests
- 📡 API responses
- 📦 Response data

---

## 🧪 **Testing Steps:**

### **Test 1: Select Swimming Pool Filter**
1. Open MapScreen
2. Tap Filter button
3. Select "Swimming Pool" (🏊)
4. Set radius to 5km or 10km
5. Tap "Apply"

### **What to Look For in Logs:**
```
🔍 Searching nearby places: {...}
🔍 Filter types: ['swimming_pool']
🔍 Filter keywords: []
🔍 Filter radius: 5000

🎯 Searching by types: ['swimming_pool']
🔎 Searching for type: swimming_pool -> Google type: swimming_pool

🌐 Making API request for type "swimming_pool": https://...
📡 API response status for "swimming_pool": 200
📦 API response for "swimming_pool": {
  status: 'OK' or 'ZERO_RESULTS',
  resultsCount: X
}
```

---

## 📊 **Expected Outcomes:**

### **Scenario A: Swimming Pools Found**
```
✅ Found X results for type swimming_pool
📊 Total results before deduplication: X
✅ Results after deduplication: X
📍 Sample results: [...]
```
**Result:** Map shows only swimming pools ✅

### **Scenario B: No Swimming Pools in Area**
```
⚠️ No results found for type "swimming_pool"
📊 Total results before deduplication: 0
✅ Results after deduplication: 0
```
**Result:** Map shows no markers (correct) ✅

### **Scenario C: API Returns Wrong Types**
```
✅ Found 20 results for type swimming_pool
📍 Sample results: [
  { name: "Some Gym", types: ['gym', 'health'] },  ← WRONG!
  { name: "Park", types: ['park'] }  ← WRONG!
]
```
**Result:** Google API returning incorrect types ❌

### **Scenario D: Cache Issue**
```
✅ Returning cached results: 20 places
```
**If cached results are from a previous search:** ❌
**Solution:** Clear cache or wait 5 minutes

---

## 🔧 **Possible Issues & Fixes:**

### **Issue 1: No Swimming Pools in Wrocław**
**Symptoms:**
- API returns `ZERO_RESULTS` for swimming_pool
- Map shows no markers

**Solution:**
- This is CORRECT behavior
- Swimming pools might not be common in your area
- Try: "Gym", "Park", or "Stadium" filters instead

---

### **Issue 2: Cached Results**
**Symptoms:**
- Log shows "Returning cached results"
- Results don't match selected filter

**Solution:**
```typescript
// Cache expires after 5 minutes
// Either wait or clear cache manually
```

**Temporary Fix:** Close and reopen app

---

### **Issue 3: Google API Returns Wrong Types**
**Symptoms:**
- API says "OK" with results
- But results don't match selected type
- Sample results show wrong venue types

**Solution:**
This is a Google Places API limitation. Google's type classifications aren't always accurate.

**Workaround:** Add keyword filtering
```
Filter: Swimming Pool
Keywords: "basen, piscina, aqua"  ← Polish/Latin words
```

---

### **Issue 4: Multiple Types Selected**
**Symptoms:**
- Selected: Gym + Swimming Pool
- Shows all gyms and pools (correct)

**Expected Behavior:**
- Filter combines types with OR logic
- Shows venues matching ANY selected type

**This is CORRECT** ✅

---

## 🎯 **Next Steps After Testing:**

### **Step 1: Check Your Logs**
After selecting "Swimming Pool" filter, copy these specific logs:
```
1. 🔍 Filter types: [...]
2. 🎯 Searching by types: [...]
3. 📦 API response for "swimming_pool": {...}
4. ✅ Found X results for type swimming_pool
5. 📍 Sample results: [...]
```

### **Step 2: Interpret Results**

**If logs show:**
- `resultsCount: 0` → No swimming pools in your area (expected)
- `resultsCount: 5+` → Check sample results to see if they're actually pools
- "Returning cached results" → Old search cached, not the new filter

### **Step 3: Report Back**
Tell me:
1. How many results did API return?
2. Are the sample results actually swimming pools?
3. Do you see the "Returning cached results" message?

---

## 🏊 **About Swimming Pool Searches:**

### **Why Swimming Pools Might Not Show:**

1. **Not Common in Area**
   - Wrocław might not have many public swimming pools
   - Try "Aquapark" or "Basen" in keywords

2. **Google Classification**
   - Some pools are classified as "gym" or "sports_complex"
   - Not always tagged as "swimming_pool"

3. **Radius Too Small**
   - Try increasing radius to 10km or 20km
   - Public pools are often spread out

---

## 🔄 **Alternative Filters to Test:**

Try these to verify filtering works:

### **Test 1: Gym Filter**
- Should show 13+ gyms
- You confirmed this works ✅

### **Test 2: Park Filter**
- Should show parks only
- Parks are common, should have results

### **Test 3: Stadium Filter**
- Should show stadiums/sports complexes
- Fewer results but should work

### **Test 4: Multiple Types**
- Select: Gym + Park
- Should show BOTH gyms AND parks
- More markers than gym-only

---

## 💡 **Enhanced Filtering (Future):**

If swimming pool filter continues showing wrong results, we can:

### **Option A: Add Keywords**
```typescript
// In ActivityFilterModal, auto-add keywords for certain types
if (selectedTypes.includes('swimming_pool')) {
  keywords.push('basen', 'aqua', 'pool', 'pływalnia');
}
```

### **Option B: Post-Filter Results**
```typescript
// After API returns results, filter by place types
results = results.filter(place => 
  place.types.some(type => 
    type.includes('swimming') || type.includes('aquatic')
  )
);
```

### **Option C: Use Text Search Instead**
```typescript
// For swimming pools, use text search with Polish keywords
if (type === 'swimming_pool') {
  searchQuery = 'basen pływalnia aquapark';
}
```

---

## 📋 **Debugging Checklist:**

After restart, test and check:

- [ ] Open MapScreen
- [ ] Tap Filter button → Modal opens
- [ ] Select "Swimming Pool" only
- [ ] Set radius to 10km
- [ ] Tap "Apply"
- [ ] Check logs for:
  - [ ] `🔍 Filter types: ['swimming_pool']`
  - [ ] `🎯 Searching by types: ['swimming_pool']`
  - [ ] `📦 API response for "swimming_pool"`
  - [ ] Number of results
  - [ ] Sample results names/types
- [ ] Check map for:
  - [ ] How many markers appear?
  - [ ] Are they actually swimming pools?
  - [ ] Or are they gyms/parks/etc?

---

## 🎯 **Expected Result:**

### **If Area Has Swimming Pools:**
```
Map shows 2-5 markers
Markers are: Aquapark Brochów, etc.
Types include: swimming_pool, aquatic_center
```

### **If Area Has NO Swimming Pools:**
```
Map shows 0 markers (blank)
Log shows: "No results found for type swimming_pool"
This is CORRECT behavior ✅
```

### **If Filter Is Broken:**
```
Map shows 20+ markers
Markers are: Gyms, Parks, etc.
Types DON'T include: swimming_pool
This is WRONG ❌ - needs fixing
```

---

**Restart Expo now and test the Swimming Pool filter!**  
Then share the logs starting with 🔍 and 🎯



