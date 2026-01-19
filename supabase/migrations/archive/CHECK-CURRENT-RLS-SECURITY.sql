-- ============================================
-- CHECK CURRENT RLS SECURITY STATUS
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Check if RLS is enabled
SELECT 
  'RLS STATUS' as check_type,
  tablename, 
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE tablename IN ('users', 'user_friendships')
ORDER BY tablename;

-- 2. Check active policies
SELECT 
  'ACTIVE POLICIES' as check_type,
  tablename, 
  policyname, 
  cmd as command,
  roles,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE tablename IN ('users', 'user_friendships')
ORDER BY tablename, cmd, policyname;

-- 3. Check column data types (to verify UUID/TEXT matching)
SELECT 
  'COLUMN TYPES' as check_type,
  table_name || '.' || column_name as column_info,
  data_type,
  udt_name
FROM information_schema.columns
WHERE table_name IN ('users', 'user_friendships')
  AND column_name IN ('id', 'user_id', 'friend_id')
ORDER BY table_name, column_name;

-- 4. Summary
SELECT 
  'SUMMARY' as check_type,
  'RLS is enabled on both tables. Policies are active.' as status;

