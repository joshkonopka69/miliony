# ⚡ QUICK SUPABASE SETUP (5 Minutes)

**For Profile Photo Upload Feature**

---

## 📋 **STEP-BY-STEP:**

### **1. Create Storage Bucket** (1 minute)

1. Open Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click **Storage** in left sidebar
4. Click **"New bucket"** button
5. Enter name: `avatars`
6. **✅ CHECK: "Public bucket"**
7. Click **"Create bucket"**

✅ **Bucket created!**

---

### **2. Add RLS Policies** (3 minutes)

1. In Storage, click on **"avatars"** bucket
2. Click **"Policies"** tab
3. Click **"New policy"** button
4. Select **"For full customization"**

---

#### **Policy 1: Upload**
- **Name:** Users can upload own avatar
- **Allowed operation:** INSERT
- **Policy definition:**
```sql
(bucket_id = 'avatars'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])
```
- Click **"Review"** → **"Save policy"**

---

#### **Policy 2: Update**
- Click **"New policy"**
- **Name:** Users can update own avatar
- **Allowed operation:** UPDATE
- **Policy definition:**
```sql
(bucket_id = 'avatars'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])
```
- Click **"Review"** → **"Save policy"**

---

#### **Policy 3: Delete**
- Click **"New policy"**
- **Name:** Users can delete own avatar
- **Allowed operation:** DELETE
- **Policy definition:**
```sql
(bucket_id = 'avatars'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])
```
- Click **"Review"** → **"Save policy"**

---

#### **Policy 4: Public View** ⚠️ **MOST IMPORTANT**
- Click **"New policy"**
- **Name:** Avatars are publicly accessible
- **Allowed operation:** SELECT
- **Policy definition:**
```sql
bucket_id = 'avatars'::text
```
- Click **"Review"** → **"Save policy"**

✅ **All 4 policies created!**

---

### **3. Verify Database** (1 minute)

1. Click **"SQL Editor"** in left sidebar
2. Click **"New query"**
3. Paste this:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'avatar_url';
```
4. Click **"Run"**
5. **If returns empty:** Run this:
```sql
ALTER TABLE users ADD COLUMN avatar_url TEXT;
```

✅ **Database ready!**

---

## ✅ **YOU'RE DONE!**

Now restart Expo:
```powershell
cd miliony
npx expo start
```

Test:
1. Open ProfileScreen
2. Tap profile photo
3. Take or select photo
4. Watch it upload!

---

## 🔍 **VERIFY IT WORKED:**

### **Test Upload:**
- Tap profile photo
- Select/take photo
- Should see "Profile photo updated!" alert

### **Check Storage:**
1. Go to Supabase → Storage → avatars
2. Should see: `[your-user-id]/[timestamp].jpg`

### **Check Database:**
1. Go to Supabase → Table Editor → users
2. Find your user row
3. Check `avatar_url` column has a URL

### **Check Photo Loads:**
1. Copy the `avatar_url` value
2. Paste in browser
3. Should see your photo

---

## 🚨 **IF IT DOESN'T WORK:**

### **Photo won't upload:**
- Check all 4 policies exist
- Verify bucket is **PUBLIC** (not private)
- Check Expo console for errors

### **Photo uploads but won't display:**
- **Policy 4 missing!** Add the SELECT policy
- Bucket might be private - click bucket → Configuration → Make public

### **"No bucket found" error:**
- Bucket name must be exactly: `avatars` (lowercase, plural)

---

**That's it! 5 minutes and you're done!** 🎉



