# 🚀 QUICK FIX - Profile Photo & Friend Requests

## The Problem

From your logs:
```
✅ Profile updated successfully
✅ Profile loaded: {"avatar_url": "(none)", "avatar_url_length": 0}
❌ Error sending friend request: {"code": "42501", "message": "new row violates row-level security policy"}
```

## The Solution (3 Minutes)

### 1️⃣ Open Supabase Dashboard
Go to: https://app.supabase.com/project/ujfeqshqhlplmolfrlvc/sql/new

### 2️⃣ Run First Script
Copy and paste ALL content from `FIX-RLS-POLICIES.sql` → Click "Run"

**Wait for:** ✅ Success message

### 3️⃣ Run Second Script  
Copy and paste ALL content from `FIX-STORAGE-POLICIES.sql` → Click "Run"

**Wait for:** ✅ Success message

### 4️⃣ Restart Your App
- Close the app completely
- Reopen it
- Try uploading a photo again
- Try adding a friend again

## What These Scripts Do

**FIX-RLS-POLICIES.sql:**
- Fixes `users` table → allows profile updates
- Fixes `user_friendships` table → allows friend requests

**FIX-STORAGE-POLICIES.sql:**
- Fixes `avatars` bucket → allows photo uploads
- Makes profile photos publicly viewable

## Expected Result

✅ **Before:**
```
LOG  ✅ Profile loaded: {"avatar_url": "(none)", "avatar_url_length": 0}
ERROR ❌ Error sending friend request: RLS policy violation
```

✅ **After:**
```
LOG  ✅ Profile loaded: {"avatar_url": "https://...avatars/.../photo.jpg", "avatar_url_length": 123}
LOG  ✅ Friend request sent
```

## Still Not Working?

### Check 1: Verify Column Types
Run this in Supabase SQL Editor:
```sql
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'id';
```

- If result is `uuid` → Remove `::text` from policies
- If result is `text` → Policies are correct as-is

### Check 2: Verify Policies Exist
```sql
SELECT tablename, policyname FROM pg_policies 
WHERE tablename IN ('users', 'user_friendships');
```

You should see:
- `Allow users to update own profile`
- `Allow users to create friend requests`
- And others...

### Check 3: Test Manually
```sql
-- Test profile update
UPDATE users SET avatar_url = 'https://test.com/image.jpg' 
WHERE id = 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7';

-- Test friend request
INSERT INTO user_friendships (user_id, friend_id, status) 
VALUES ('c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', 'ae31f8ef-e325-4e32-88b4-d7894f7dcd67', 'pending');
```

If these work → Problem was RLS policies (now fixed!)
If these fail → Check error message for clues

## Need More Help?

Read the detailed guide: `FIX-PROFILE-AND-FRIENDS-INSTRUCTIONS.md`

Debug with queries in: `DEBUG-DATABASE-STATE.sql`

---

**Created:** 2025-11-04
**For User:** josh (c46dec97-bfd3-4d30-9cc8-178b1a2b66a7)
**Project:** SportMap - Supabase Setup






