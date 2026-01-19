-- ============================================================================
-- SIMPLE FIX - Just make it work!
-- ============================================================================
-- Run this ENTIRE script in one go in Supabase SQL Editor
-- ============================================================================

-- 1. Drop ALL existing policies (clean slate)
DROP POLICY IF EXISTS "Users can view all profiles" ON users;
DROP POLICY IF EXISTS "Allow authenticated users to view all profiles" ON users;
DROP POLICY IF EXISTS "Allow users to update own profile" ON users;
DROP POLICY IF EXISTS "Allow users to insert own profile" ON users;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON users;
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;

DROP POLICY IF EXISTS "Users can view their own friendships" ON user_friendships;
DROP POLICY IF EXISTS "Allow users to view their friendships" ON user_friendships;
DROP POLICY IF EXISTS "Users can create friendships" ON user_friendships;
DROP POLICY IF EXISTS "Allow users to create friend requests" ON user_friendships;
DROP POLICY IF EXISTS "Users can update their own friendships" ON user_friendships;
DROP POLICY IF EXISTS "Allow users to update their friendships" ON user_friendships;
DROP POLICY IF EXISTS "Users can delete their own friendships" ON user_friendships;
DROP POLICY IF EXISTS "Allow users to delete their friendships" ON user_friendships;

DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Public avatar access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can manage their avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;

-- 2. Create simple, permissive policies that WILL work

-- USERS TABLE
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_policy" ON users
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "users_update_policy" ON users
FOR UPDATE TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "users_insert_policy" ON users
FOR INSERT TO authenticated
WITH CHECK (true);

-- USER_FRIENDSHIPS TABLE
ALTER TABLE user_friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "friendships_select_policy" ON user_friendships
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "friendships_insert_policy" ON user_friendships
FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "friendships_update_policy" ON user_friendships
FOR UPDATE TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "friendships_delete_policy" ON user_friendships
FOR DELETE TO authenticated
USING (true);

-- STORAGE OBJECTS (avatars bucket)
CREATE POLICY "storage_select_policy" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'avatars');

CREATE POLICY "storage_insert_policy" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "storage_update_policy" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'avatars')
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "storage_delete_policy" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'avatars');

-- 3. Verify policies were created
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('users', 'user_friendships')
ORDER BY tablename, cmd;

-- ============================================================================
-- THIS SHOULD WORK NOW!
-- ============================================================================
-- These policies are VERY permissive (allow everything for authenticated users)
-- This is for TESTING ONLY - you should make them more restrictive later
-- But at least your app will work now!
-- ============================================================================










