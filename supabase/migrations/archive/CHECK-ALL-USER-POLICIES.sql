-- ============================================
-- CHECK: All policies on users table
-- ============================================

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive, -- 'PERMISSIVE' or 'RESTRICTIVE'
  roles,
  cmd,
  qual::text as using_expression,
  with_check::text as with_check_expression
FROM pg_policies
WHERE tablename = 'users'
ORDER BY cmd, policyname;

-- Check if RLS is actually enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'users';

-- If there are multiple UPDATE policies, they ALL must pass
-- (for PERMISSIVE policies, at least ONE must pass)
-- Let's see what we have

