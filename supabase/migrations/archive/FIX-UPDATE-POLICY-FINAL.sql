-- ============================================
-- FINAL FIX: RLS Policy for UPDATE
-- ============================================

-- Drop the problematic policy
DROP POLICY IF EXISTS "users_update_own" ON users;

-- Create a new policy without any casting issues
-- Use direct UUID comparison
CREATE POLICY "users_update_own"
ON users
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

SELECT '✅ UPDATE policy recreated with direct UUID comparison' as status;

-- Verify it was created
SELECT 
  policyname,
  cmd,
  qual::text as using_clause,
  with_check::text as with_check_clause
FROM pg_policies
WHERE tablename = 'users' AND cmd = 'UPDATE';

