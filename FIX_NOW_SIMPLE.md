# 🚀 Fix Events - Simple Steps

## 📋 **What You Need:**
- Supabase Dashboard access
- 2 minutes

---

## ✅ **Step 1: Run SQL Script** (1 minute)

1. **Open Supabase Dashboard**
2. Go to **SQL Editor** (left sidebar)
3. **Copy ALL contents** from `CREATE_EVENTS_COMPLETE.sql`
4. **Paste** into SQL Editor
5. Click **RUN** button

### **Expected Output:**
```
✅ VERIFICATION
  - Basketball 3v3
  - Morning 5K Run  
  - 5-a-side Football

🎉 READY - events_that_will_show_in_app: 3
```

✅ If you see this → **SUCCESS! Events are created!**

❌ If you see errors → Share the error message with me

---

## ✅ **Step 2: Restart App** (1 minute)

```bash
# Stop current Expo (press Ctrl+C in terminal)

# Start fresh
cd /home/hubi/SportMap/miliony
npx expo start --clear
```

---

## ✅ **Step 3: Check Map** (30 seconds)

Open your app and look for:
- ✅ Yellow badge: "3 events nearby"
- ✅ Three markers with emojis: 🏀 🏃‍♂️ ⚽
- ✅ Debug info at bottom: "Events: 3"

---

## 🆘 **Still Not Working?**

### **If SQL gave an error:**
Share the exact error message

### **If SQL worked but app still shows 0:**
Run this in Supabase:
```sql
SELECT title, scheduled_datetime > NOW() as will_show
FROM events WHERE status = 'active';
```

All should show `will_show = true`

### **Check Console Logs:**
Look for in Metro bundler:
```
✅ Fetched 3 events successfully
```

---

**🚀 Start with Step 1: Run CREATE_EVENTS_COMPLETE.sql now!**

