-- ============================================================================
-- FIX RLS POLICIES PROPERLY - Based on UUID type
-- ============================================================================
-- This assumes your ID columns are UUID type (most common with Supabase)
-- If CHECK-COLUMN-TYPES.sql shows TEXT, we'll need different policies
-- ============================================================================

-- Step 1: Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_friendships ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop all existing policies
DROP POLICY IF EXISTS "Users can view all profiles" ON users;
DROP POLICY IF EXISTS "Allow authenticated users to view all profiles" ON users;
DROP POLICY IF EXISTS "Allow users to update own profile" ON users;
DROP POLICY IF EXISTS "Allow users to insert own profile" ON users;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON users;
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "users_select_policy" ON users;
DROP POLICY IF EXISTS "users_update_policy" ON users;
DROP POLICY IF EXISTS "users_insert_policy" ON users;

DROP POLICY IF EXISTS "Users can view their own friendships" ON user_friendships;
DROP POLICY IF EXISTS "Allow users to view their friendships" ON user_friendships;
DROP POLICY IF EXISTS "Users can create friendships" ON user_friendships;
DROP POLICY IF EXISTS "Allow users to create friend requests" ON user_friendships;
DROP POLICY IF EXISTS "Users can update their own friendships" ON user_friendships;
DROP POLICY IF EXISTS "Allow users to update their friendships" ON user_friendships;
DROP POLICY IF EXISTS "Users can delete their own friendships" ON user_friendships;
DROP POLICY IF EXISTS "Allow users to delete their friendships" ON user_friendships;
DROP POLICY IF EXISTS "friendships_select_policy" ON user_friendships;
DROP POLICY IF EXISTS "friendships_insert_policy" ON user_friendships;
DROP POLICY IF EXISTS "friendships_update_policy" ON user_friendships;
DROP POLICY IF EXISTS "friendships_delete_policy" ON user_friendships;

-- Step 3: Create CORRECT policies for UUID types
-- (If your IDs are TEXT, you'll need to add ::text to auth.uid())

-- USERS TABLE POLICIES
CREATE POLICY "users_select_all" 
ON users FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "users_insert_own" 
ON users FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id::uuid);

CREATE POLICY "users_update_own" 
ON users FOR UPDATE 
TO authenticated 
USING (auth.uid() = id::uuid)
WITH CHECK (auth.uid() = id::uuid);

CREATE POLICY "users_delete_own" 
ON users FOR DELETE 
TO authenticated 
USING (auth.uid() = id::uuid);

-- USER_FRIENDSHIPS TABLE POLICIES
CREATE POLICY "friendships_select_own" 
ON user_friendships FOR SELECT 
TO authenticated 
USING (
    auth.uid() = user_id::uuid OR 
    auth.uid() = friend_id::uuid
);

CREATE POLICY "friendships_insert_own" 
ON user_friendships FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id::uuid);

CREATE POLICY "friendships_update_involved" 
ON user_friendships FOR UPDATE 
TO authenticated 
USING (
    auth.uid() = user_id::uuid OR 
    auth.uid() = friend_id::uuid
)
WITH CHECK (
    auth.uid() = user_id::uuid OR 
    auth.uid() = friend_id::uuid
);

CREATE POLICY "friendships_delete_involved" 
ON user_friendships FOR DELETE 
TO authenticated 
USING (
    auth.uid() = user_id::uuid OR 
    auth.uid() = friend_id::uuid
);

-- Step 4: Storage policies (these were working)
DROP POLICY IF EXISTS "storage_select_policy" ON storage.objects;
DROP POLICY IF EXISTS "storage_insert_policy" ON storage.objects;
DROP POLICY IF EXISTS "storage_update_policy" ON storage.objects;
DROP POLICY IF EXISTS "storage_delete_policy" ON storage.objects;

CREATE POLICY "storage_select_avatars" 
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id = 'avatars');

CREATE POLICY "storage_insert_own_avatar" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "storage_update_own_avatar" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "storage_delete_own_avatar" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Step 5: Verify policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd as operation,
    CASE 
        WHEN qual IS NOT NULL THEN 'USING: ' || substring(qual, 1, 50) || '...'
        ELSE 'No USING clause'
    END as using_clause
FROM pg_policies
WHERE tablename IN ('users', 'user_friendships')
ORDER BY tablename, cmd, policyname;

-- ============================================================================
-- RESULT: You should see policies created for both tables
-- ============================================================================










