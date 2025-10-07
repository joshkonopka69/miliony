-- ═══════════════════════════════════════════════════════════════════════════
-- 🔍 DEBUG MAPSCREEN QUERY ISSUE
-- ═══════════════════════════════════════════════════════════════════════════
-- This script tests the exact query that MapScreen is using
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Test the exact MapScreen query
SELECT 
  '🎯 MAPSCREEN QUERY TEST' as section,
  *
FROM events
WHERE status = 'active'
ORDER BY scheduled_datetime
LIMIT 100;

-- 2. Check if there are any RLS policies affecting this query
SELECT 
  '🔒 RLS POLICIES CHECK' as section,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'events';

-- 3. Check if there are any constraints or triggers
SELECT 
  '⚙️ TABLE CONSTRAINTS' as section,
  conname,
  contype,
  confrelid::regclass as foreign_table
FROM pg_constraint 
WHERE conrelid = 'events'::regclass;

-- 4. Test with different user contexts (if RLS is the issue)
SELECT 
  '👤 CURRENT USER CONTEXT' as section,
  current_user,
  session_user,
  current_setting('request.jwt.claims', true) as jwt_claims;
