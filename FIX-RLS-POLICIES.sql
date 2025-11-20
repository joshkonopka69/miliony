-- ============================================================================
-- FIX RLS POLICIES FOR PROFILE PHOTO AND FRIEND REQUESTS
-- ============================================================================
-- This script fixes two critical issues:
-- 1. Profile photo updates not persisting (users table RLS)
-- 2. Friend requests being blocked (user_friendships table RLS)
-- ============================================================================

-- First, let's check current policies and drop them
-- ============================================================================

-- Drop existing policies on users table
DROP POLICY IF EXISTS "Users can view all profiles" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON users;
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;

-- Drop existing policies on user_friendships table
DROP POLICY IF EXISTS "Users can view their own friendships" ON user_friendships;
DROP POLICY IF EXISTS "Users can create friendships" ON user_friendships;
DROP POLICY IF EXISTS "Users can update their own friendships" ON user_friendships;
DROP POLICY IF EXISTS "Users can delete their own friendships" ON user_friendships;

-- ============================================================================
-- FIX 1: USERS TABLE - Allow profile photo updates
-- ============================================================================

-- Enable RLS on users table (if not already enabled)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow all authenticated users to view all profiles
-- (Needed for friend search, viewing other users, etc.)
CREATE POLICY "Allow authenticated users to view all profiles"
ON users
FOR SELECT
TO authenticated
USING (true);

-- Policy 2: Allow users to update their own profile
-- This is the CRITICAL policy for profile photo updates
CREATE POLICY "Allow users to update own profile"
ON users
FOR UPDATE
TO authenticated
USING (auth.uid()::text = id)
WITH CHECK (auth.uid()::text = id);

-- Policy 3: Allow users to insert their own profile (for registration)
CREATE POLICY "Allow users to insert own profile"
ON users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = id);

-- ============================================================================
-- FIX 2: USER_FRIENDSHIPS TABLE - Allow friend requests
-- ============================================================================

-- Enable RLS on user_friendships table (if not already enabled)
ALTER TABLE user_friendships ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view friendships where they are either user_id or friend_id
CREATE POLICY "Allow users to view their friendships"
ON user_friendships
FOR SELECT
TO authenticated
USING (
  auth.uid()::text = user_id OR 
  auth.uid()::text = friend_id
);

-- Policy 2: Users can create friend requests where they are the user_id
-- This is the CRITICAL policy for sending friend requests
CREATE POLICY "Allow users to create friend requests"
ON user_friendships
FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = user_id);

-- Policy 3: Users can update friendships where they are involved
-- (Needed for accepting/rejecting friend requests)
CREATE POLICY "Allow users to update their friendships"
ON user_friendships
FOR UPDATE
TO authenticated
USING (
  auth.uid()::text = user_id OR 
  auth.uid()::text = friend_id
)
WITH CHECK (
  auth.uid()::text = user_id OR 
  auth.uid()::text = friend_id
);

-- Policy 4: Users can delete friendships where they are involved
CREATE POLICY "Allow users to delete their friendships"
ON user_friendships
FOR DELETE
TO authenticated
USING (
  auth.uid()::text = user_id OR 
  auth.uid()::text = friend_id
);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these to verify the policies are working:

-- 1. Check users table policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;

-- 2. Check user_friendships table policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'user_friendships'
ORDER BY policyname;

-- 3. Test if you can update your profile (replace 'YOUR_USER_ID' with actual user ID)
-- UPDATE users SET avatar_url = 'test_url' WHERE id = 'YOUR_USER_ID';

-- 4. Test if you can insert a friend request (replace with actual user IDs)
-- INSERT INTO user_friendships (user_id, friend_id, status) 
-- VALUES ('YOUR_USER_ID', 'FRIEND_USER_ID', 'pending');

-- ============================================================================
-- IMPORTANT NOTES:
-- ============================================================================
-- 1. The auth.uid()::text cast is CRITICAL because:
--    - auth.uid() returns UUID type
--    - The id, user_id, and friend_id columns are TEXT type
--    - Without ::text cast, PostgreSQL cannot compare them
--
-- 2. If you still get errors after running this:
--    - Check if your user_id and friend_id columns are actually TEXT type
--    - If they are UUID type, remove the ::text cast
--    - Run: SELECT column_name, data_type FROM information_schema.columns 
--           WHERE table_name = 'users' AND column_name = 'id';
--
-- 3. The WITH CHECK clause is important for INSERT and UPDATE policies
--    - It defines what values can be written
--    - It prevents users from creating records as other users
-- ============================================================================










