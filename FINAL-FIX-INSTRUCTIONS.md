# 🔧 FINAL FIX - Instructions

## 🎯 What We Found in Your Logs:

### ✅ **Profile Photo UPLOAD Works**
The photo uploads successfully:
```
✅ Upload successful: .../1763258158045.jpg
✅ Profile updated successfully
```

### ❌ **But CACHING Issue**
When you navigate back, it loads the OLD photo:
```
avatar_url: .../1762244241968.jpg (old)
```

### ❌ **Friend Request RLS Error**
```
ERROR: new row violates row-level security policy for table "user_friendships"
```

The policy only allowed `user_id = auth.uid()`, but when user A adds user B, the app might set `friend_id = auth.uid()` instead.

---

## 🔨 **THE FIXES:**

### **FIX 1: Friendship RLS Policy** ✅

Run **`FINAL-FIX-FRIENDSHIPS.sql`** in Supabase SQL Editor.

This updates the INSERT policy to allow:
```sql
WITH CHECK (
  user_id = auth.uid() OR friend_id = auth.uid()
)
```

Now users can create friendships as EITHER `user_id` OR `friend_id`.

---

### **FIX 2: Profile Photo Cache-Busting** ✅

Updated `ProfileScreen.tsx` to add a timestamp to the avatar URL:
```typescript
avatar_url: profileData.avatar_url 
  ? `${profileData.avatar_url}?t=${Date.now()}`
  : profileData.avatar_url
```

This forces the browser/app to load the fresh image instead of using the cached one.

---

## 📋 **STEPS TO APPLY:**

### **Step 1: Run SQL Fix**
1. Go to **Supabase Dashboard** → **SQL Editor**
2. Open and run **`FINAL-FIX-FRIENDSHIPS.sql`**
3. You should see: ✅ `FRIENDSHIP POLICIES UPDATED!`

### **Step 2: Restart Your App**
```powershell
# Stop current app (Ctrl+C if needed)
cd miliony
.\START-APP.ps1
```

### **Step 3: Test Both Features**

#### Test 1: Profile Photo
1. Go to Profile
2. Upload a NEW photo
3. Navigate to another screen (e.g., My Games)
4. Come back to Profile
5. ✅ **Should show the NEW photo now** (not the old one)

#### Test 2: Add Friend
1. Go to Add Friend
2. Search for a user (e.g., "lup")
3. Click "Add Friend"
4. ✅ **Should show "Pending" status** (no error)

---

## 🧪 **Expected Results:**

### Profile Photo:
```
LOG ✅ Profile loaded: {
  avatar_url: "https://.../NEW_PHOTO.jpg?t=1763258999999"
}
```

### Add Friend:
```
LOG ✅ Friend request sent successfully
```
(No more 42501 RLS error)

---

## 📤 **If Still Not Working:**

Send me:
1. The complete console logs after testing
2. The output from running `FINAL-FIX-FRIENDSHIPS.sql`
3. Screenshot of the Storage policies page

---

## 🎯 **What These Fixes Do:**

| Issue | Root Cause | Solution |
|-------|------------|----------|
| Profile photo shows old image | Browser/app caching | Cache-busting timestamp added |
| Friend request fails RLS | Policy only checked `user_id` | Policy now checks BOTH `user_id` and `friend_id` |

---

**RUN THE SQL AND RESTART THE APP NOW!** 🚀

