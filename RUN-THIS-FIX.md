# 🔧 COMPLETE RLS FIX - Run This Now!

## Problem
- ❌ Profile photo uploads but old photo shows when you return
- ❌ Friend requests fail with RLS policy error
- **Root cause:** Missing/incorrect RLS policies on both database AND storage

## Solution
Run **ONE** SQL file that fixes everything.

---

## 📋 Instructions

### Step 1: Open Supabase SQL Editor
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Copy and Run the SQL
1. Open file: `COMPLETE-RLS-FIX.sql`
2. Copy **ALL** the contents
3. Paste into the SQL Editor
4. Click **Run** (or press Ctrl+Enter)

### Step 3: Verify Success
You should see output showing:
- ✅ Database policies created (users, user_friendships)
- ✅ Storage policies created (avatars bucket)
- Your auth.uid() displayed

### Step 4: Restart Your App
1. Close the app completely
2. Reopen it
3. Test:
   - Upload profile photo → Navigate away → Come back ✅ Should persist
   - Add friend → ✅ Should work without RLS error

---

## ✅ What This Fix Does

### Database Policies:
- `users` table: Can read all, update/delete own
- `user_friendships` table: Can see own friendships, add friends, accept/reject requests

### Storage Policies:
- `avatars` bucket: Anyone can view, users can upload/update/delete their own avatars

### Key Feature:
- Uses `::text` casting on BOTH sides to handle UUID/TEXT type mismatches
- Works regardless of your column types

---

## ❓ If It Still Doesn't Work

Check in SQL Editor:
```sql
-- See your current auth user
SELECT auth.uid();

-- See all policies
SELECT * FROM pg_policies 
WHERE tablename IN ('users', 'user_friendships', 'objects');
```

If you see no policies or auth.uid() is null, you need to:
1. Make sure you're logged in to Supabase
2. Run the SQL while authenticated

---

## 🚀 After This Works

You can move on to:
- ✅ Task 3: Groups real-time
- ✅ Task 4: Achievements real-time
- ✅ Task 5: GameChat messaging
- ✅ Task 6: Fix translations






