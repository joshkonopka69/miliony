-- ============================================
-- CLEAN AND FIX ALL RLS POLICIES
-- ============================================

-- ========== USERS TABLE - DROP ALL POLICIES ==========

DROP POLICY IF EXISTS "users_select_all" ON users;
DROP POLICY IF EXISTS "users_insert_own" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can view all profiles" ON users;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON users;
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON users;
DROP POLICY IF EXISTS "Enable update for users based on id" ON users;
DROP POLICY IF EXISTS "allow_read_all_profiles" ON users;
DROP POLICY IF EXISTS "allow_update_own_profile" ON users;
DROP POLICY IF EXISTS "allow_insert_own_profile" ON users;

-- ========== USER_FRIENDSHIPS TABLE - DROP ALL POLICIES ==========

DROP POLICY IF EXISTS "friendships_select" ON user_friendships;
DROP POLICY IF EXISTS "friendships_insert" ON user_friendships;
DROP POLICY IF EXISTS "friendships_update" ON user_friendships;
DROP POLICY IF EXISTS "friendships_delete" ON user_friendships;
DROP POLICY IF EXISTS "Users can view own friendships" ON user_friendships;
DROP POLICY IF EXISTS "Users can create friendships" ON user_friendships;
DROP POLICY IF EXISTS "Users can update own friendships" ON user_friendships;
DROP POLICY IF EXISTS "Users can delete own friendships" ON user_friendships;
DROP POLICY IF EXISTS "Enable read access for all users" ON user_friendships;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON user_friendships;
DROP POLICY IF EXISTS "allow_read_own_friendships" ON user_friendships;
DROP POLICY IF EXISTS "allow_create_friendships" ON user_friendships;
DROP POLICY IF EXISTS "allow_update_own_friendships" ON user_friendships;
DROP POLICY IF EXISTS "allow_delete_own_friendships" ON user_friendships;
DROP POLICY IF EXISTS "users_read_own_friendships" ON user_friendships;
DROP POLICY IF EXISTS "users_create_friendships" ON user_friendships;
DROP POLICY IF EXISTS "users_update_own_friendships" ON user_friendships;
DROP POLICY IF EXISTS "users_delete_own_friendships" ON user_friendships;
DROP POLICY IF EXISTS "friendships_delete_involved" ON user_friendships;
DROP POLICY IF EXISTS "friendships_insert_own" ON user_friendships;
DROP POLICY IF EXISTS "friendships_select_own" ON user_friendships;
DROP POLICY IF EXISTS "friendships_update_involved" ON user_friendships;

-- ========== ENABLE RLS ==========

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_friendships ENABLE ROW LEVEL SECURITY;

-- ========== CREATE USERS TABLE POLICIES ==========

-- Simple READ policy - everyone can see all profiles
CREATE POLICY "users_select_all"
ON users
FOR SELECT
TO authenticated
USING (true);

-- Simple INSERT policy - users can create their own profile
CREATE POLICY "users_insert_own"
ON users
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- Simple UPDATE policy - users can update their own profile
CREATE POLICY "users_update_own"
ON users
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- ========== CREATE USER_FRIENDSHIPS TABLE POLICIES ==========

-- Simple SELECT policy
CREATE POLICY "friendships_select"
ON user_friendships
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR friend_id = auth.uid());

-- Simple INSERT policy
CREATE POLICY "friendships_insert"
ON user_friendships
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() OR friend_id = auth.uid());

-- Simple UPDATE policy
CREATE POLICY "friendships_update"
ON user_friendships
FOR UPDATE
TO authenticated
USING (user_id = auth.uid() OR friend_id = auth.uid())
WITH CHECK (user_id = auth.uid() OR friend_id = auth.uid());

-- Simple DELETE policy
CREATE POLICY "friendships_delete"
ON user_friendships
FOR DELETE
TO authenticated
USING (user_id = auth.uid() OR friend_id = auth.uid());

-- ========== VERIFICATION ==========

SELECT '✅ ALL RLS POLICIES CREATED!' as status;

SELECT 'USERS TABLE POLICIES:' as info;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'users' ORDER BY cmd, policyname;

SELECT '' as spacer;

SELECT 'USER_FRIENDSHIPS TABLE POLICIES:' as info;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'user_friendships' ORDER BY cmd, policyname;

SELECT '' as spacer;

SELECT '📊 Policy Count:' as info;
SELECT 
  'users' as table_name,
  COUNT(*) as total_policies
FROM pg_policies 
WHERE tablename = 'users'
UNION ALL
SELECT 
  'user_friendships',
  COUNT(*)
FROM pg_policies 
WHERE tablename = 'user_friendships';

