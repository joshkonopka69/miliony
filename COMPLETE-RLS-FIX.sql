-- ============================================================================
-- COMPLETE RLS FIX - Database + Storage with proper type casting
-- ============================================================================
-- This script fixes BOTH database RLS and storage RLS in one go
-- ============================================================================

-- ============================================================================
-- PART 1: DATABASE RLS POLICIES
-- ============================================================================

-- Drop ALL existing database policies
DROP POLICY IF EXISTS "users_select_all" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;
DROP POLICY IF EXISTS "users_insert_own" ON users;
DROP POLICY IF EXISTS "users_delete_own" ON users;
DROP POLICY IF EXISTS "friendships_select_own" ON user_friendships;
DROP POLICY IF EXISTS "friendships_insert_own" ON user_friendships;
DROP POLICY IF EXISTS "friendships_update_involved" ON user_friendships;
DROP POLICY IF EXISTS "friendships_delete_involved" ON user_friendships;

-- Enable RLS on database tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_friendships ENABLE ROW LEVEL SECURITY;

-- USERS TABLE POLICIES (with ::text cast for compatibility)
CREATE POLICY "users_select_all" 
ON users FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "users_insert_own" 
ON users FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid()::text = id::text);

CREATE POLICY "users_update_own" 
ON users FOR UPDATE 
TO authenticated 
USING (auth.uid()::text = id::text)
WITH CHECK (auth.uid()::text = id::text);

CREATE POLICY "users_delete_own" 
ON users FOR DELETE 
TO authenticated 
USING (auth.uid()::text = id::text);

-- USER_FRIENDSHIPS TABLE POLICIES (with ::text cast for compatibility)
CREATE POLICY "friendships_select_own" 
ON user_friendships FOR SELECT 
TO authenticated 
USING (
    auth.uid()::text = user_id::text OR 
    auth.uid()::text = friend_id::text
);

CREATE POLICY "friendships_insert_own" 
ON user_friendships FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "friendships_update_involved" 
ON user_friendships FOR UPDATE 
TO authenticated 
USING (
    auth.uid()::text = user_id::text OR 
    auth.uid()::text = friend_id::text
)
WITH CHECK (
    auth.uid()::text = user_id::text OR 
    auth.uid()::text = friend_id::text
);

CREATE POLICY "friendships_delete_involved" 
ON user_friendships FOR DELETE 
TO authenticated 
USING (
    auth.uid()::text = user_id::text OR 
    auth.uid()::text = friend_id::text
);

-- ============================================================================
-- PART 2: STORAGE RLS POLICIES (for avatars bucket)
-- ============================================================================

-- Drop ALL existing storage policies
DROP POLICY IF EXISTS "storage_select_avatars" ON storage.objects;
DROP POLICY IF EXISTS "storage_insert_own_avatar" ON storage.objects;
DROP POLICY IF EXISTS "storage_update_own_avatar" ON storage.objects;
DROP POLICY IF EXISTS "storage_delete_own_avatar" ON storage.objects;
DROP POLICY IF EXISTS "storage_select_policy" ON storage.objects;
DROP POLICY IF EXISTS "storage_insert_policy" ON storage.objects;
DROP POLICY IF EXISTS "storage_update_policy" ON storage.objects;
DROP POLICY IF EXISTS "storage_delete_policy" ON storage.objects;
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload an avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- PUBLIC SELECT for avatars (anyone can view)
CREATE POLICY "storage_select_avatars" 
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id = 'avatars');

-- AUTHENTICATED INSERT for avatars (users can upload to their own folder)
CREATE POLICY "storage_insert_own_avatar" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (
    bucket_id = 'avatars' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);

-- AUTHENTICATED UPDATE for avatars (users can update their own files)
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

-- AUTHENTICATED DELETE for avatars (users can delete their own files)
CREATE POLICY "storage_delete_own_avatar" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (
    bucket_id = 'avatars' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Show all database policies
SELECT 
    '🔒 DATABASE POLICIES' as section,
    tablename,
    policyname,
    cmd as operation,
    CASE 
        WHEN policyname LIKE '%select%' THEN '✅ Read'
        WHEN policyname LIKE '%insert%' THEN '✅ Create'
        WHEN policyname LIKE '%update%' THEN '✅ Update'
        WHEN policyname LIKE '%delete%' THEN '✅ Delete'
        ELSE '⚠️ Unknown'
    END as description
FROM pg_policies
WHERE tablename IN ('users', 'user_friendships')
ORDER BY tablename, cmd;

-- Show all storage policies
SELECT 
    '🗄️ STORAGE POLICIES' as section,
    tablename,
    policyname,
    cmd as operation,
    CASE 
        WHEN policyname LIKE '%select%' THEN '✅ Read'
        WHEN policyname LIKE '%insert%' THEN '✅ Create'
        WHEN policyname LIKE '%update%' THEN '✅ Update'
        WHEN policyname LIKE '%delete%' THEN '✅ Delete'
        ELSE '⚠️ Unknown'
    END as description
FROM pg_policies
WHERE tablename = 'objects' AND schemaname = 'storage'
ORDER BY cmd;

-- Show current user info
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ RLS FIX COMPLETE!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Your auth.uid(): %', auth.uid();
    RAISE NOTICE 'Converted to text: %', auth.uid()::text;
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Now test in your app:';
    RAISE NOTICE '1. Upload profile photo ✅';
    RAISE NOTICE '2. Send friend request ✅';
    RAISE NOTICE '========================================';
END $$;

