-- ============================================
-- CLEANUP DUPLICATE POLICIES
-- ============================================

-- Drop old duplicate policies
DROP POLICY IF EXISTS "friendships_delete_involved" ON user_friendships;
DROP POLICY IF EXISTS "friendships_insert_own" ON user_friendships;
DROP POLICY IF EXISTS "friendships_select_own" ON user_friendships;
DROP POLICY IF EXISTS "friendships_update_involved" ON user_friendships;

-- Verify only 4 policies remain
SELECT '✅ CLEANUP COMPLETE!' as status;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'user_friendships';

