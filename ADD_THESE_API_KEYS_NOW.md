# 🔑 ADD YOUR API KEYS NOW - URGENT!

## ✅ STEP 1: Update Your .env File

Open this file: `C:\Users\Adrian\Nowy folder\miliony\.env`

**Add these TWO lines at the end:**

```bash
# Google Maps & Places API Configuration
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyD6nUmyKQ_9EqPpv4axk8J5YhZlI9J0fak
EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=AIzaSyDBJ65DOu4WMoTRjvz1J6i6VbYbjOoEW2E
```

### Your Complete .env File Should Look Like This:

```bash
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://ujfeqshqhlplmolfrlvc.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqZmVxc2hxaGxwbG1vbGZybHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MzI0NDQsImV4cCI6MjA3NTQwODQ0NH0.vUEi4gl7qsl7fU518CMV79TJG9j3MWgwBQHEzbfuwIA

# Google Maps & Places API Configuration
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyD6nUmyKQ_9EqPpv4axk8J5YhZlI9J0fak
EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=AIzaSyDBJ65DOu4WMoTRjvz1J6i6VbYbjOoEW2E
```

---

## ✅ STEP 2: I Already Updated app.config.js For You!

Your `app.config.js` has been updated with Google Maps configuration. ✅ DONE!

---

## ✅ STEP 3: Restart Expo (IMPORTANT!)

**Stop your current Expo server** (press `Ctrl+C`)

Then run this command:

```powershell
cd "C:\Users\Adrian\Nowy folder\miliony"
npx expo start --clear
```

**Why `--clear`?** This clears the cache so the new environment variables are loaded.

---

## ✅ STEP 4: Test MapScreen

1. **Scan QR code** with Expo Go
2. **Navigate to MapScreen**
3. **Check console** for these success messages:

### ✅ Success (What You Should See):

```
🔑 Google Maps API Key: ✅ Loaded
🔑 Google Places API Key: ✅ Loaded
🔄 Fetching events from Supabase...
✅ Fetched X events successfully
📍 User location obtained: { latitude: ..., longitude: ... }
🔔 Setting up real-time event subscriptions...
```

### ❌ If You See Errors:

```
❌ API key is required
❌ Google Places API error: REQUEST_DENIED
```

**Solutions:**
1. Verify you added the keys to `.env` (no quotes, no spaces)
2. Restart Expo again with `--clear` flag
3. Wait 2-3 minutes for cache to clear completely

---

## 🎯 QUICK COMMAND SUMMARY

```powershell
# 1. Edit .env file (add the two API key lines above)
notepad "C:\Users\Adrian\Nowy folder\miliony\.env"

# 2. Restart Expo with cache cleared
cd "C:\Users\Adrian\Nowy folder\miliony"
npx expo start --clear

# 3. Open app and check MapScreen works!
```

---

## 🎉 WHAT HAPPENS NEXT

Once you complete these 4 steps:

✅ **MapScreen will work!**
- Map will render
- Google Places API will work
- No more "API key required" errors
- Events will display as markers
- Filter functionality ready to implement

---

## 🚀 AFTER IT WORKS

**You can then implement:**

1. **Filter Bar** - Sport venue categories (Halls, Fields, Parks, etc.)
2. **Custom Markers** - Location pins with emojis
3. **Google Places Search** - Find venues automatically
4. **Location Callouts** - Tap markers for info
5. **Create Events at Locations** - Full workflow

**Want me to implement these features?** Just say which one!

---

## ⚠️ IMPORTANT NOTES

1. **Never commit .env to Git** - API keys should stay secret
2. **The .env file already exists** - Just add the two new lines
3. **Must restart Expo with --clear** - Otherwise changes won't load
4. **Wait a few minutes** - Sometimes cache takes time to clear

---

## 📞 NEED HELP?

If it doesn't work after following these steps:

1. Share the console output with me
2. Tell me what error you see
3. Confirm you added the keys to `.env` correctly
4. Verify you restarted Expo with `--clear`

---

**DO THIS NOW:**

```powershell
notepad "C:\Users\Adrian\Nowy folder\miliony\.env"
```

**Then add the two API key lines and restart Expo!** 🚀


