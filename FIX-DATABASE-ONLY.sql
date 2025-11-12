-- ============================================================================
-- DATABASE RLS FIX ONLY (Storage policies done via Supabase UI)
-- ============================================================================
-- This fixes database RLS. Storage policies must be set in Supabase Dashboard.
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
-- VERIFICATION
-- ============================================================================

SELECT 
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

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ DATABASE RLS FIXED!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Your auth.uid(): %', auth.uid();
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Next: Set storage policies in Supabase UI';
    RAISE NOTICE 'See STORAGE-POLICY-INSTRUCTIONS.md';
    RAISE NOTICE '========================================';
END $$;

