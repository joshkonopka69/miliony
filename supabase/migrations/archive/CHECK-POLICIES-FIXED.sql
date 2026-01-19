-- ============================================
-- CHECK CURRENT POLICIES (Fixed - No Storage Check)
-- ============================================

-- Check all policies on users table
SELECT 'USERS TABLE POLICIES:' as info;
SELECT policyname, cmd, qual::text as using_expression, with_check::text as with_check_expression
FROM pg_policies
WHERE tablename = 'users';

-- Check all policies on user_friendships table
SELECT 'USER_FRIENDSHIPS TABLE POLICIES:' as info;
SELECT policyname, cmd, qual::text as using_expression, with_check::text as with_check_expression
FROM pg_policies
WHERE tablename = 'user_friendships';

-- Check RLS status
SELECT 'RLS STATUS:' as info;
SELECT tablename, rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('users', 'user_friendships');

-- Check table structure for type issues
SELECT 'USERS TABLE COLUMN TYPES:' as info;
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users' AND column_name IN ('id', 'avatar_url');

SELECT 'USER_FRIENDSHIPS TABLE COLUMN TYPES:' as info;
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'user_friendships' AND column_name IN ('user_id', 'friend_id');

-- Test current user ID
SELECT 'CURRENT USER ID:' as info;
SELECT auth.uid() as current_user_id;

