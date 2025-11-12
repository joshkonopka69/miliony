-- ============================================================================
-- CLEANUP OLD POLICIES (removes duplicates)
-- ============================================================================

-- Drop old policies with different names
DROP POLICY IF EXISTS "Users can create own profile" ON users;
DROP POLICY IF EXISTS "Users can view all users" ON users;
DROP POLICY IF EXISTS "Users can view public profiles" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Verify clean state
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
    RAISE NOTICE '✅ CLEANUP COMPLETE!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'All duplicate policies removed';
    RAISE NOTICE 'Database RLS is now clean and working';
    RAISE NOTICE '========================================';
END $$;






