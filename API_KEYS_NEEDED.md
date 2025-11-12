# 🔑 API Keys Required for SportMap - Quick Reference

## ⚠️ **CURRENTLY MISSING**

Your `.env` file is missing these critical API keys:

```bash
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=<NOT SET>
EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=<NOT SET>
```

---

## ✅ **ALREADY CONFIGURED**

```bash
✅ EXPO_PUBLIC_SUPABASE_URL=https://ujfeqshqhlplmolfrlvc.supabase.co
✅ EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
```

---

## 📝 **WHAT YOU NEED TO DO NOW**

### **Option 1: Quick Setup (10 minutes)**

1. **Go to:** https://console.cloud.google.com/

2. **Create API Key:**
   - Click "Create Credentials" → "API Key"
   - Copy the key

3. **Enable APIs:**
   - Search and enable: "Maps JavaScript API"
   - Search and enable: "Places API"
   - Search and enable: "Geocoding API"

4. **Add to `.env` file:**
   ```bash
   EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSy...your_key_here
   EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=AIzaSy...your_key_here
   ```
   > You can use the same key for both during development

5. **Restart Expo:**
   ```powershell
   npx expo start --clear
   ```

---

## 🎯 **WHY YOU NEED THESE KEYS**

| API Key | Used For | Without It |
|---------|----------|------------|
| **Google Maps API** | Display interactive map | Map won't load, blank screen |
| **Google Places API** | Search for sport venues, gyms, parks | Filters won't work, no venue markers |
| **Supabase** (✅ already set) | Store events, user data | App won't save/load events |

---

## 🧪 **TEST AFTER SETUP**

After adding the API keys, run this test:

```javascript
// Add to MapScreen.tsx temporarily
console.log('Google Maps API:', process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ? 'OK ✅' : 'MISSING ❌');
console.log('Google Places API:', process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY ? 'OK ✅' : 'MISSING ❌');
```

**Expected output:**
```
Google Maps API: OK ✅
Google Places API: OK ✅
```

---

## 🐛 **COMMON ISSUES**

### **Issue: API key still shows as missing after adding to .env**

**Solution:**
```powershell
# Stop Expo (Ctrl+C)
# Clear cache and restart:
npx expo start --clear
```

### **Issue: "REQUEST_DENIED" error from Google**

**Solution:**
- Wait 5 minutes after enabling APIs (propagation delay)
- Check APIs are enabled: https://console.cloud.google.com/apis/library
- Remove API key restrictions temporarily for testing

### **Issue: Map shows but filters don't work**

**Solution:**
- Both API keys needed
- Check console for "Google Places API key is required"
- Verify `EXPO_PUBLIC_GOOGLE_PLACES_API_KEY` is set

---

## 📋 **COMPLETE .env FILE TEMPLATE**

Your `.env` should look like this:

```bash
# ===================================
# GOOGLE MAPS & PLACES API
# ===================================
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyC7Bq...your_actual_key
EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=AIzaSyC7Bq...your_actual_key

# ===================================
# SUPABASE (Already Set ✅)
# ===================================
EXPO_PUBLIC_SUPABASE_URL=https://ujfeqshqhlplmolfrlvc.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqZmVxc2hxaGxwbG1vbGZybHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MzI0NDQsImV4cCI6MjA3NTQwODQ0NH0.vUEi4gl7qsl7fU518CMV79TJG9j3MWgwBQHEzbfuwIA
```

---

## 🎯 **YOUR IMMEDIATE TODO**

**DO THIS NOW:**

1. [ ] Go to https://console.cloud.google.com/
2. [ ] Get your Google API key
3. [ ] Add it to `.env` file
4. [ ] Run `npx expo start --clear`
5. [ ] Check MapScreen works

**Time needed:** ~10 minutes

---

**For detailed step-by-step instructions, see:** `MAPSCREEN_SETUP_MANUAL.md`


