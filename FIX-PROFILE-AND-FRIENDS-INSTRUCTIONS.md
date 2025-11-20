# Fix Profile Photo & Friend Requests - Step by Step Guide

## Issues to Fix

1. **Profile Photo Not Persisting**: Photos upload successfully but don't appear when returning to profile
2. **Friend Requests Blocked**: RLS policy error when trying to send friend requests

## Root Causes

Both issues are caused by **Row-Level Security (RLS) policies** in Supabase:
- The `users` table RLS policy is blocking profile updates
- The `user_friendships` table RLS policy is blocking friend request inserts

## Solution Steps

### Step 1: Run Debug Queries (Optional but Recommended)

Open Supabase Dashboard → SQL Editor and run the queries in `DEBUG-DATABASE-STATE.sql` to verify:
- What's actually stored in the database
- What RLS policies currently exist
- What column types you have (TEXT vs UUID)

**Key Query to Run First:**
```sql
-- Check your user's current avatar_url
SELECT id, display_name, avatar_url, length(avatar_url) as url_length
FROM users
WHERE id = 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7';
```

This will tell you if the photo URL is actually being saved or not.

### Step 2: Fix RLS Policies

Open Supabase Dashboard → SQL Editor and run the entire `FIX-RLS-POLICIES.sql` script.

This will:
1. Drop all existing conflicting policies
2. Create new policies that allow:
   - Users to update their own profile (including avatar_url)
   - Users to send friend requests
   - Users to view all profiles (for friend search)
   - Users to manage their friendships

### Step 3: Fix Storage Bucket Policies

Run the entire `FIX-STORAGE-POLICIES.sql` script.

This ensures:
1. The `avatars` bucket exists and is public
2. Users can upload to their own folder (avatars/USER_ID/filename.jpg)
3. Everyone can view avatar images (public read access)
4. Users can only manage their own avatar files

### Step 4: Verify Column Types (IMPORTANT!)

The RLS policies assume your ID columns are **TEXT** type. If they're **UUID** type, you need to modify the policies.

**Run this to check:**
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'id';

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_friendships' AND column_name IN ('user_id', 'friend_id');
```

**If you see `uuid` instead of `text`:**
- Edit the policies and remove `::text` casts
- Change `auth.uid()::text = id` to just `auth.uid() = id`
- Re-run the policy script with these changes

### Step 5: Test Profile Photo Upload

1. Open the app and go to Profile screen
2. Tap the camera icon
3. Select a photo
4. Wait for the upload to complete
5. **Navigate away** (go to Map screen)
6. **Navigate back** to Profile screen
7. The photo should now persist!

**Check the logs for:**
```
✅ Upload successful: c46dec97-.../1762242922327.jpg
🔗 Public URL: https://ujfeqshqhlplmolfrlvc...
✅ Profile updated successfully
```

Then when you return:
```
✅ Profile loaded: {"avatar_url": "https://...", "avatar_url_length": 123}
```

If it still shows `"avatar_url": "(none)"`, run the debug queries to check the database.

### Step 6: Test Friend Request

1. Go to Profile screen → tap "Add Friend"
2. Search for a user (e.g., type "lup")
3. Tap the "+" button next to a user
4. You should see: `✅ Friend request sent`

**Check the logs for:**
```
📤 Sending friend request: {"friendId": "...", "userId": "..."}
✅ Friend request sent
```

If you still see RLS error `42501`, check:
- Did the RLS policy script run successfully?
- Are the column types correct (see Step 4)?
- Did you refresh your app after running the SQL?

## Troubleshooting

### Profile Photo Still Shows "(none)"

1. **Check if upload succeeded:**
   ```sql
   SELECT name, created_at FROM storage.objects 
   WHERE bucket_id = 'avatars' 
   AND name LIKE 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7/%'
   ORDER BY created_at DESC;
   ```

2. **Check if database was updated:**
   ```sql
   SELECT avatar_url, updated_at FROM users 
   WHERE id = 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7';
   ```

3. **Try manual update:**
   ```sql
   UPDATE users 
   SET avatar_url = 'https://ujfeqshqhlplmolfrlvc.supabase.co/storage/v1/object/public/avatars/c46dec97-bfd3-4d30-9cc8-178b1a2b66a7/test.jpg'
   WHERE id = 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7';
   ```
   
   If this works, the issue is with RLS policies.
   If this fails, check column name or data type.

### Friend Request Still Fails

1. **Verify table exists:**
   ```sql
   SELECT * FROM user_friendships LIMIT 1;
   ```

2. **Check if you can insert manually:**
   ```sql
   INSERT INTO user_friendships (user_id, friend_id, status)
   VALUES ('c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', 'ae31f8ef-e325-4e32-88b4-d7894f7dcd67', 'pending');
   ```

3. **Verify auth.uid() matches your user ID:**
   ```sql
   SELECT 
       auth.uid() as my_auth_uuid,
       auth.uid()::text as my_auth_text,
       'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7' as expected_id,
       auth.uid()::text = 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7' as does_match;
   ```

### Still Not Working?

If both issues persist after following all steps:

1. **Export your current policies:**
   ```sql
   SELECT schemaname, tablename, policyname, cmd, qual, with_check
   FROM pg_policies
   WHERE tablename IN ('users', 'user_friendships')
   ORDER BY tablename, policyname;
   ```

2. **Check for triggers or functions that might be interfering:**
   ```sql
   SELECT * FROM information_schema.triggers
   WHERE event_object_table IN ('users', 'user_friendships');
   ```

3. **Try with RLS temporarily disabled (for testing only!):**
   ```sql
   ALTER TABLE users DISABLE ROW LEVEL SECURITY;
   ALTER TABLE user_friendships DISABLE ROW LEVEL SECURITY;
   -- Test the app
   -- Then re-enable:
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   ALTER TABLE user_friendships ENABLE ROW LEVEL SECURITY;
   ```

## Expected Results After Fix

✅ **Profile Photo:**
- Upload photo → success
- Navigate away → return
- Photo still visible
- Logs show actual avatar_url with length > 0

✅ **Friend Requests:**
- Search for users → see real users
- Tap "+" button → friend request sent
- Status changes to "Pending"
- Request appears in database

## Files Created

- `FIX-RLS-POLICIES.sql` - Main fix for both issues
- `FIX-STORAGE-POLICIES.sql` - Storage bucket policies for avatars
- `DEBUG-DATABASE-STATE.sql` - Debug queries to check current state
- `FIX-PROFILE-AND-FRIENDS-INSTRUCTIONS.md` - This file

## Next Steps After Fix

Once both issues are resolved, we can continue with the remaining tasks:
- ✅ Task 1: Profile photo - WILL BE FIXED
- ✅ Task 2: Add friends - WILL BE FIXED
- ⏳ Task 3: Groups real-time
- ⏳ Task 4: Achievements real-time
- ⏳ Task 5: GameChat messaging
- ⏳ Task 6: Fix translations










