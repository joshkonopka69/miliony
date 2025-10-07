-- ═══════════════════════════════════════════════════════════════════════════
-- 🔍 TEST RLS (ROW LEVEL SECURITY) ISSUE
-- ═══════════════════════════════════════════════════════════════════════════
-- This script tests if RLS is blocking the events query
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Check if RLS is enabled on events table
SELECT 
  '🔒 RLS STATUS' as section,
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'events';

-- 2. Check RLS policies on events table
SELECT 
  '📋 RLS POLICIES' as section,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'events';

-- 3. Test query as superuser (bypasses RLS)
SELECT 
  '👑 SUPERUSER QUERY' as section,
  COUNT(*) as total_events,
  COUNT(*) FILTER (WHERE status = 'active') as active_events
FROM events;

-- 4. Test the exact query the app uses
SELECT 
  '🎯 APP QUERY TEST' as section,
  id,
  title,
  status,
  latitude,
  longitude
FROM events
WHERE status = 'active'
ORDER BY scheduled_datetime
LIMIT 100;

-- 5. Check current user and permissions
SELECT 
  '👤 USER INFO' as section,
  current_user,
  session_user,
  current_setting('request.jwt.claims', true) as jwt_claims;
