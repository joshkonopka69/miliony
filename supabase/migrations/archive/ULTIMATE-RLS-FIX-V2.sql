-- ============================================
-- ULTIMATE RLS FIX V2 - Fixed Type Casting
-- ============================================

-- Step 1: Drop ALL existing policies to start fresh
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

-- Step 2: Ensure RLS is enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_friendships ENABLE ROW LEVEL SECURITY;

-- Step 3: Create USERS table policies
-- Allow users to view ALL profiles (needed for search/add friends)
CREATE POLICY "allow_read_all_profiles"
ON users
FOR SELECT
TO authenticated
USING (true);

-- Allow users to update ONLY their own profile
-- Handle both UUID and TEXT types
CREATE POLICY "allow_update_own_profile"
ON users
FOR UPDATE
TO authenticated
USING (
  CASE 
    WHEN pg_typeof(id) = 'uuid'::regtype THEN id = auth.uid()
    ELSE id::text = auth.uid()::text
  END
)
WITH CHECK (
  CASE 
    WHEN pg_typeof(id) = 'uuid'::regtype THEN id = auth.uid()
    ELSE id::text = auth.uid()::text
  END
);

-- Allow users to insert their own profile (during signup)
CREATE POLICY "allow_insert_own_profile"
ON users
FOR INSERT
TO authenticated
WITH CHECK (
  CASE 
    WHEN pg_typeof(id) = 'uuid'::regtype THEN id = auth.uid()
    ELSE id::text = auth.uid()::text
  END
);

-- Step 4: Create USER_FRIENDSHIPS table policies
-- Allow users to view friendships where they are involved
CREATE POLICY "allow_read_own_friendships"
ON user_friendships
FOR SELECT
TO authenticated
USING (
  CASE 
    WHEN pg_typeof(user_id) = 'uuid'::regtype THEN (user_id = auth.uid() OR friend_id = auth.uid())
    ELSE (user_id::text = auth.uid()::text OR friend_id::text = auth.uid()::text)
  END
);

-- Allow users to create friendships
CREATE POLICY "allow_create_friendships"
ON user_friendships
FOR INSERT
TO authenticated
WITH CHECK (
  CASE 
    WHEN pg_typeof(user_id) = 'uuid'::regtype THEN user_id = auth.uid()
    ELSE user_id::text = auth.uid()::text
  END
);

-- Allow users to update friendships where they are involved
CREATE POLICY "allow_update_own_friendships"
ON user_friendships
FOR UPDATE
TO authenticated
USING (
  CASE 
    WHEN pg_typeof(user_id) = 'uuid'::regtype THEN (user_id = auth.uid() OR friend_id = auth.uid())
    ELSE (user_id::text = auth.uid()::text OR friend_id::text = auth.uid()::text)
  END
)
WITH CHECK (
  CASE 
    WHEN pg_typeof(user_id) = 'uuid'::regtype THEN (user_id = auth.uid() OR friend_id = auth.uid())
    ELSE (user_id::text = auth.uid()::text OR friend_id::text = auth.uid()::text)
  END
);

-- Allow users to delete friendships where they are involved
CREATE POLICY "allow_delete_own_friendships"
ON user_friendships
FOR DELETE
TO authenticated
USING (
  CASE 
    WHEN pg_typeof(user_id) = 'uuid'::regtype THEN (user_id = auth.uid() OR friend_id = auth.uid())
    ELSE (user_id::text = auth.uid()::text OR friend_id::text = auth.uid()::text)
  END
);

-- Step 5: Verify policies were created
SELECT '✅ DATABASE POLICIES CREATED!' as status;
SELECT 'USERS TABLE:' as table_name, COUNT(*) as policy_count FROM pg_policies WHERE tablename = 'users'
UNION ALL
SELECT 'USER_FRIENDSHIPS TABLE:', COUNT(*) FROM pg_policies WHERE tablename = 'user_friendships';

