# 🔍 Debug Your Events - Step by Step

## 🚀 **What I Just Added:**

1. **Debug Toggle Button** - Yellow button on the right side of your map
2. **Debug Test Component** - Shows detailed event fetching info
3. **Enhanced Console Logging** - More detailed error messages

---

## ✅ **Step 1: Open Your App**

1. **Start Expo** (if not running):
   ```bash
   cd /home/hubi/SportMap/miliony
   npx expo start --clear
   ```

2. **Open in Expo Go** on your phone

---

## ✅ **Step 2: Use Debug Mode**

1. **Look for yellow "Show Debug" button** on the right side of your map
2. **Tap it** to open debug panel
3. **Look at the debug info** - it will show:
   - How many events were found
   - Any errors
   - Detailed Supabase connection test

---

## ✅ **Step 3: Check Console Logs**

In your terminal where Expo is running, look for:
- `🔄 Fetching events from Supabase...`
- `✅ Fetched X events successfully` 
- `❌ Error fetching events:` (if there's an error)

---

## ✅ **Step 4: Run SQL Check**

1. **Open Supabase Dashboard** → **SQL Editor**
2. **Copy and paste** the contents of `DEBUG_YOUR_EVENTS.sql`
3. **Click RUN**
4. **Share the results** with me

---

## 🆘 **Common Issues & Solutions:**

### **Issue 1: "0 events found"**
- Your events might have wrong `status` or `scheduled_datetime`
- Check the SQL results

### **Issue 2: "Supabase connection error"**
- Check your `.env` file has correct Supabase URL and key
- Check internet connection

### **Issue 3: "RLS policy error"**
- Your Row Level Security is blocking access
- Need to fix RLS policies

### **Issue 4: "Map not showing markers"**
- Events are fetched but map component has issue
- Check if markers are being created

---

## 📱 **What to Tell Me:**

After running the debug, tell me:

1. **What does the debug panel show?**
   - Events Found: X
   - Any error messages?

2. **What do the console logs say?**
   - Copy the relevant lines from terminal

3. **What did the SQL query return?**
   - Share the results from `DEBUG_YOUR_EVENTS.sql`

---

**🚀 Start with Step 1: Open your app and tap "Show Debug"!**


