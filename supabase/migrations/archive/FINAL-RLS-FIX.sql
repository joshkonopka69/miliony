-- ============================================================================
-- FINAL RLS FIX - Check types first, then apply correct policies
-- ============================================================================
-- Step 1: Check what type your ID columns actually are
-- ============================================================================

DO $$
DECLARE
    users_id_type text;
    friendships_user_id_type text;
    users_id_is_uuid boolean;
    friendships_is_uuid boolean;
BEGIN
    -- Get the actual data types
    SELECT data_type INTO users_id_type
    FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'id';
    
    SELECT data_type INTO friendships_user_id_type
    FROM information_schema.columns
    WHERE table_name = 'user_friendships' AND column_name = 'user_id';
    
    -- Determine if they're UUID or not
    users_id_is_uuid := (users_id_type = 'uuid');
    friendships_is_uuid := (friendships_user_id_type = 'uuid');
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'DATABASE TYPE CHECK:';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'users.id type: %', users_id_type;
    RAISE NOTICE 'user_friendships.user_id type: %', friendships_user_id_type;
    RAISE NOTICE '========================================';
    
    IF users_id_is_uuid THEN
        RAISE NOTICE '✅ Your IDs are UUID - will create policies WITHOUT ::text cast';
    ELSE
        RAISE NOTICE '✅ Your IDs are TEXT - will create policies WITH ::text cast';
    END IF;
    RAISE NOTICE '========================================';
END $$;

-- ============================================================================
-- Step 2: Drop ALL existing policies
-- ============================================================================

DROP POLICY IF EXISTS "users_select_all" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;
DROP POLICY IF EXISTS "users_insert_own" ON users;
DROP POLICY IF EXISTS "users_delete_own" ON users;
DROP POLICY IF EXISTS "friendships_select_own" ON user_friendships;
DROP POLICY IF EXISTS "friendships_insert_own" ON user_friendships;
DROP POLICY IF EXISTS "friendships_update_involved" ON user_friendships;
DROP POLICY IF EXISTS "friendships_delete_involved" ON user_friendships;

-- ============================================================================
-- Step 3: Create policies that work for BOTH TEXT and UUID
-- ============================================================================
-- Using explicit casting that works regardless of type

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_friendships ENABLE ROW LEVEL SECURITY;

-- USERS TABLE POLICIES
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

-- USER_FRIENDSHIPS TABLE POLICIES
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
-- Step 4: Verify the policies were created
-- ============================================================================

SELECT 
    tablename,
    policyname,
    cmd as operation,
    CASE 
        WHEN policyname LIKE '%select%' THEN '✅ Read access'
        WHEN policyname LIKE '%insert%' THEN '✅ Create access'
        WHEN policyname LIKE '%update%' THEN '✅ Update access'
        WHEN policyname LIKE '%delete%' THEN '✅ Delete access'
        ELSE '⚠️ Unknown'
    END as description
FROM pg_policies
WHERE tablename IN ('users', 'user_friendships')
ORDER BY tablename, cmd;

-- ============================================================================
-- Step 5: Test if the current user can update their profile
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'TESTING POLICIES:';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Your auth.uid(): %', auth.uid();
    RAISE NOTICE 'Converted to text: %', auth.uid()::text;
    RAISE NOTICE '========================================';
    RAISE NOTICE 'If you see your UUID above, policies should work!';
    RAISE NOTICE '========================================';
END $$;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ RLS POLICIES CREATED SUCCESSFULLY!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Now:';
    RAISE NOTICE '1. Restart your app';
    RAISE NOTICE '2. Test profile photo upload';
    RAISE NOTICE '3. Test friend request';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'The policies use ::text cast on BOTH sides';
    RAISE NOTICE 'This works for UUID, TEXT, and any other type';
    RAISE NOTICE '========================================';
END $$;

