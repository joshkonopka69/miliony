-- ============================================
-- TEST: Why is UPDATE failing?
-- ============================================

-- First, let's see if we can SELECT the row
SELECT 
  'Can we SELECT?' as test,
  id,
  display_name,
  avatar_url
FROM users
WHERE id = 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7';

-- Check the RLS policy
SELECT 
  'UPDATE policy details:' as info,
  policyname,
  cmd,
  qual::text as using_clause,
  with_check::text as with_check_clause
FROM pg_policies
WHERE tablename = 'users' AND cmd = 'UPDATE';

-- The issue: The USING clause checks if the row can be SEEN
-- The WITH CHECK clause checks if the new values are allowed
-- Both must pass for UPDATE to work

-- Let's try a simpler policy
DROP POLICY IF EXISTS "users_update_own" ON users;

CREATE POLICY "users_update_own"
ON users
FOR UPDATE
TO authenticated
USING (id::text = (auth.uid())::text)
WITH CHECK (id::text = (auth.uid())::text);

SELECT '✅ Policy recreated with swapped casting order' as status;

