# 🧪 QUICK TESTING GUIDE - Type-Based Filtering

## ⚡ **3-MINUTE TEST PROTOCOL**

---

### **TEST 1: Parks** (Most Important) 🌳

**Steps:**
1. Open MapScreen
2. Tap Filter button
3. Select "Parks"
4. Radius: 5km
5. Tap "Apply"

**Look At Map:**
- ✅ Should see green markers for parks
- ✅ Names should be like: "Park Szczytnicki", "Park Południowy"
- ❌ Should NOT see: "Parking", "Garden Center", "Nursery"

**Check Console:**
```
🔍 SEARCHING WITH TYPE-BASED FILTERING
📋 Using filtering rules for: parks
🔬 Applying validation filters...
📊 FILTERING SUMMARY:
   ✅ Validated: 8-12
   ❌ Rejected: 2-5
```

**Success:** If 90%+ are actual recreational parks ✅

---

### **TEST 2: Swimming Pools** 🏊

**Steps:**
1. Select "Water Sports" or "Swimming Pool"
2. Radius: 10km
3. Apply

**Look At Map:**
- ✅ Names: "Aquapark", "Basen", "Pływalnia"
- ❌ NOT: "Hotel", "Spa", "Pool Supply"

**Check Console:**
```
📋 Using filtering rules for: water_sports
🔬 Applying validation filters...
```

**Success:** If ONLY swimming facilities appear ✅

---

### **TEST 3: Basketball Courts** 🏀

**Steps:**
1. Select "Outside Courts"
2. Radius: 5km
3. Apply

**Look At Map:**
- ✅ Names: "Boisko do koszykówki", "Basketball Court"
- ❌ NOT: "Store", "Shop", "Courthouse"

**Success:** If ONLY courts appear ✅

---

## 📊 **COMPARISON TEST:**

### **What You Should Notice:**

**BEFORE (if you remember):**
- Parks filter: Showed parking lots, nurseries, etc.
- Swimming: Showed hotels, stores
- Courts: Showed retail stores

**AFTER (now):**
- Parks filter: ONLY parks
- Swimming: ONLY pools
- Courts: ONLY courts

**Improvement:** Should feel like "finally, it works!" 🎉

---

## 🐛 **IF SOMETHING'S WRONG:**

### **Problem: Not enough results**

**Console shows:**
```
📊 FILTERING SUMMARY:
   ✅ Validated: 1-2 (too few)
   ❌ Rejected: 10-15
```

**Solution:** Rules are too strict. Share logs with me.

---

### **Problem: Wrong results still appear**

**Example:** Parks filter shows a parking lot

**Console shows:**
```
✅ [X/Y] Parking Lot Name
   Types: parking, point_of_interest
```

**Solution:** Validation didn't catch it. Share logs with me.

---

### **Problem: Good places rejected**

**Example:** A nice park is missing

**Console shows:**
```
❌ [X/Y] Park Name
   Reason: Only 2 reviews, need 3
```

**Solution:** Rules are too strict (minReviews). I can adjust.

---

## 📝 **QUICK REPORT TEMPLATE:**

After testing, tell me:

```
TEST RESULTS:

Parks Filter:
- Total results: X
- Actual parks: Y
- False positives: Z (list names if any)
- Rating: ⭐⭐⭐⭐⭐ / ⭐⭐⭐⭐⭐

Swimming Pools Filter:
- Total results: X
- Actual pools: Y
- False positives: Z
- Rating: ⭐⭐⭐⭐⭐ / ⭐⭐⭐⭐⭐

Basketball Courts Filter:
- Total results: X
- Actual courts: Y
- False positives: Z
- Rating: ⭐⭐⭐⭐⭐ / ⭐⭐⭐⭐⭐

Overall Improvement: Much better / Same / Worse

Notes: [anything unusual]
```

---

## 🎯 **SUCCESS LOOKS LIKE:**

```
✅ Parks: 10 results, 9 are real parks (90% accurate)
✅ Swimming: 3 results, 3 are real pools (100% accurate)
✅ Courts: 5 results, 5 are real courts (100% accurate)
✅ User: "This is SO much better!" 😊
```

---

## ⏱️ **TIME ESTIMATE:**

- Test 1 (Parks): 1 minute
- Test 2 (Swimming): 1 minute
- Test 3 (Courts): 1 minute
- **Total: 3 minutes**

---

**Ready? Start testing!** 🧪

The Expo server is restarting now. Wait for the QR code, then test the filters!



