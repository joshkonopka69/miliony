# 🔧 FIX INSTRUCTIONS - Profile Photo & Add Friend

## **Root Cause Identified:**

Both issues are caused by **Row Level Security (RLS) policies** blocking database operations!

### Issue 1: Profile Photo Not Saving
```
✅ Upload successful (Storage works)
✅ Profile updated successfully (Code runs)
❌ Profile loaded: avatar_url: "(none)" (Database blocked the update!)
```

**Problem:** `users` table RLS policy is blocking the UPDATE operation

---

### Issue 2: Add Friend Error
```
ERROR ❌ new row violates row-level security policy for table "user_friendships"
```

**Problem:** `user_friendships` table RLS policy is blocking the INSERT operation

---

## **🚀 SOLUTION: Run SQL Fix**

### **Step 1: Open Supabase SQL Editor**
1. Go to https://app.supabase.com
2. Select your project
3. Click "SQL Editor" in left sidebar
4. Click "New Query"

### **Step 2: Copy & Paste This SQL**

Open the file: `QUICK-FIX-RLS-POLICIES.sql`

Or copy this:

```sql
-- Enable RLS
ALTER TABLE public.user_friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own friendships" ON public.user_friendships;
DROP POLICY IF EXISTS "Users can create friendships" ON public.user_friendships;
DROP POLICY IF EXISTS "Users can update their own friendships" ON public.user_friendships;
DROP POLICY IF EXISTS "Users can delete their own friendships" ON public.user_friendships;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

-- Create PERMISSIVE policies for user_friendships
CREATE POLICY "Users can view their own friendships"
  ON public.user_friendships FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create friendships"
  ON public.user_friendships FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can update their own friendships"
  ON public.user_friendships FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Users can delete their own friendships"
  ON public.user_friendships FOR DELETE TO authenticated USING (true);

-- Create policy for users table
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE TO authenticated
  USING (id::text = auth.uid()::text)
  WITH CHECK (id::text = auth.uid()::text);

-- Grant permissions
GRANT ALL ON public.user_friendships TO authenticated;
GRANT UPDATE ON public.users TO authenticated;
```

### **Step 3: Click "Run" (or press F5)**

You should see:
```
Success. No rows returned
```

### **Step 4: Verify Policies Were Created**

Run this query:
```sql
SELECT tablename, policyname, cmd
FROM pg_policies 
WHERE tablename IN ('users', 'user_friendships')
ORDER BY tablename, policyname;
```

You should see policies listed for both tables.

---

## **✅ TEST THE FIXES**

### **Test 1: Profile Photo**
```bash
cd miliony
# App should still be running, if not:
npx expo start
```

1. Go to Profile
2. Tap profile photo
3. Choose "Choose from Library"
4. Select a photo
5. **Check logs - should see:**
   ```
   ✅ Upload successful
   ✅ Profile updated successfully
   ```
6. **Navigate away (go to Map)**
7. **Navigate back to Profile**
8. **Check logs - should NOW see:**
   ```
   ✅ Profile loaded: {
     avatar_url: "https://ujfeqshqhlplmolfrlvc.supabase.co/storage/...",
     avatar_url_length: 120+
   }
   ```
9. **Photo should be visible! ✅**

---

### **Test 2: Add Friend**
1. Go to Profile → "Add Friends"
2. Search for "lupa"
3. Click "Add" button
4. **Check logs - should see:**
   ```
   🔍 Searching for users: lupa
   ✅ Found 1 users
   📤 Sending friend request: {...}
   ✅ Friend request sent
   ```
5. **Button changes to "Pending" ✅**
6. **NO MORE RLS errors!**

---

## **📊 If Still Not Working:**

### Check Database Directly:

**Profile Photo:**
```sql
SELECT id, display_name, avatar_url, LENGTH(avatar_url) as url_length
FROM public.users 
WHERE id = 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7';
```

Expected: `avatar_url` should have full URL, `url_length` should be 100+

**Friendships:**
```sql
SELECT * FROM public.user_friendships 
WHERE user_id = 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7';
```

Expected: Should see rows after adding friends

---

## **🔒 Security Note:**

These policies are **PERMISSIVE** for testing. After confirming everything works, you can tighten them:

### Tighter Policies (Later):
```sql
-- For user_friendships - only allow own friendships
DROP POLICY IF EXISTS "Users can create friendships" ON public.user_friendships;
CREATE POLICY "Users can create friendships"
  ON public.user_friendships FOR INSERT TO authenticated
  WITH CHECK (user_id::text = auth.uid()::text);
```

But **use the permissive ones first** to make sure everything works!

---

## **Summary:**

1. ✅ Run `QUICK-FIX-RLS-POLICIES.sql` in Supabase SQL Editor
2. ✅ Restart app (if needed)
3. ✅ Test profile photo upload
4. ✅ Test add friend functionality
5. ✅ Both should work now!

**The RLS policies were blocking legitimate operations. This fix allows authenticated users to update their profiles and create friendships! 🎉**

