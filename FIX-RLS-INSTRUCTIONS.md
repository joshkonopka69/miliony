# 🔒 Fix RLS Policies - Step by Step

## Current Status
✅ App works with RLS disabled
❌ Need to enable RLS with correct policies

## Step 1: Check Your Column Types (Optional but Helpful)

Run `CHECK-COLUMN-TYPES.sql` in Supabase SQL Editor to see what types your ID columns are.

This will tell you:
- If your IDs are UUID or TEXT
- What `auth.uid()` returns
- How to compare them correctly

## Step 2: Run the Fix

Run `FIX-RLS-PROPERLY.sql` in Supabase SQL Editor.

This script:
1. ✅ Enables RLS on `users` and `user_friendships`
2. ✅ Drops all old conflicting policies
3. ✅ Creates new policies that use `id::uuid` casting
4. ✅ Fixes storage policies for avatars
5. ✅ Shows you what policies were created

## Step 3: Test Your App

After running the SQL:
1. **Restart your app** completely
2. **Test profile photo upload**
   - Upload a photo
   - Navigate away
   - Come back - photo should still be there
3. **Test friend request**
   - Search for a user
   - Click "+" to add friend
   - Should see "✅ Friend request sent"

## Expected Results

**Before (RLS disabled):**
```
✅ Everything works BUT no security
⚠️ Any user can update any profile
⚠️ Any user can create any friendship
```

**After (RLS enabled with correct policies):**
```
✅ Everything still works
✅ Users can only update their OWN profile
✅ Users can only create friendships where they are the sender
✅ Users can only see friendships where they are involved
✅ Secure and ready for production!
```

## Troubleshooting

### If you get error about "operator does not exist"

Your ID columns might be TEXT type instead of UUID. In that case, change the policies to:

```sql
-- Change this:
auth.uid() = id::uuid

-- To this:
auth.uid()::text = id
```

### If friend requests still fail

Check if the policy was created:
```sql
SELECT policyname FROM pg_policies 
WHERE tablename = 'user_friendships' 
AND policyname = 'friendships_insert_own';
```

If it doesn't exist, the policy creation failed. Run the fix script again.

### If profile photo still doesn't save

Check if the policy was created:
```sql
SELECT policyname FROM pg_policies 
WHERE tablename = 'users' 
AND policyname = 'users_update_own';
```

## Why Did It Fail Before?

The previous policies used:
- `USING (true)` - Too permissive, but should have worked
- Or incorrect type casting

The issue was likely:
1. Policies weren't actually created (script failed silently)
2. Type mismatch between `auth.uid()` and your ID columns
3. Conflicting old policies blocking new ones

The new script:
- Drops ALL old policies first
- Uses explicit `::uuid` casting
- Verifies policies were created

## Ready?

**Run `FIX-RLS-PROPERLY.sql` now!**

Then test your app and let me know if it works! 🎯










