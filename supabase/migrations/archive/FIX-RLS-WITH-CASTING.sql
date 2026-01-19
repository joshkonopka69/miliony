-- ============================================
-- FIX RLS POLICIES WITH EXPLICIT TYPE CASTING
-- ============================================

-- First, re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_friendships ENABLE ROW LEVEL SECURITY;

-- ========== DROP ALL EXISTING POLICIES ==========

-- Users table
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

-- User_friendships table
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

-- ========== CREATE USERS TABLE POLICIES (WITH CASTING) ==========

-- SELECT: Everyone can see all profiles
CREATE POLICY "users_select_all"
ON users
FOR SELECT
TO authenticated
USING (true);

-- INSERT: Users can create their own profile
CREATE POLICY "users_insert_own"
ON users
FOR INSERT
TO authenticated
WITH CHECK (
  (auth.uid())::text = id::text
);

-- UPDATE: Users can update their own profile (THIS IS THE CRITICAL ONE!)
CREATE POLICY "users_update_own"
ON users
FOR UPDATE
TO authenticated
USING (
  (auth.uid())::text = id::text
)
WITH CHECK (
  (auth.uid())::text = id::text
);

-- ========== CREATE USER_FRIENDSHIPS TABLE POLICIES (WITH CASTING) ==========

-- SELECT: See friendships where you're involved
CREATE POLICY "friendships_select"
ON user_friendships
FOR SELECT
TO authenticated
USING (
  (auth.uid())::text = user_id::text 
  OR (auth.uid())::text = friend_id::text
);

-- INSERT: Create friendships as either user_id or friend_id
CREATE POLICY "friendships_insert"
ON user_friendships
FOR INSERT
TO authenticated
WITH CHECK (
  (auth.uid())::text = user_id::text 
  OR (auth.uid())::text = friend_id::text
);

-- UPDATE: Update friendships where you're involved
CREATE POLICY "friendships_update"
ON user_friendships
FOR UPDATE
TO authenticated
USING (
  (auth.uid())::text = user_id::text 
  OR (auth.uid())::text = friend_id::text
)
WITH CHECK (
  (auth.uid())::text = user_id::text 
  OR (auth.uid())::text = friend_id::text
);

-- DELETE: Delete friendships where you're involved
CREATE POLICY "friendships_delete"
ON user_friendships
FOR DELETE
TO authenticated
USING (
  (auth.uid())::text = user_id::text 
  OR (auth.uid())::text = friend_id::text
);

-- ========== VERIFICATION ==========

SELECT '✅ RLS POLICIES FIXED WITH TYPE CASTING!' as status;

SELECT 'USERS TABLE POLICIES:' as info;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'users' ORDER BY cmd, policyname;

SELECT '' as spacer;

SELECT 'USER_FRIENDSHIPS TABLE POLICIES:' as info;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'user_friendships' ORDER BY cmd, policyname;

SELECT '' as spacer;

SELECT '📊 Summary:' as info;
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

SELECT '' as spacer;

SELECT '🎯 Now test your app with RLS ENABLED!' as next_step;

