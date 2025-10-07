-- ═══════════════════════════════════════════════════════════════════════════
-- 🔓 DISABLE RLS ON EVENTS TABLE - QUICK FIX
-- ═══════════════════════════════════════════════════════════════════════════
-- This script disables RLS on events table so queries work without authentication
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Check current RLS status
SELECT 
  '🔍 CURRENT RLS STATUS' as section,
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('events', 'profiles');

-- 2. Disable RLS on events table
ALTER TABLE public.events DISABLE ROW LEVEL SECURITY;

-- 3. Verify RLS is disabled
SELECT 
  '✅ RLS DISABLED ON EVENTS' as section,
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'events';

-- 4. Test query that was failing
SELECT 
  '🧪 TEST QUERY' as section,
  COUNT(*) as total_events,
  COUNT(*) FILTER (WHERE status = 'active') as active_events
FROM events;

-- 5. Show events that should now be accessible
SELECT 
  '📊 EVENTS NOW ACCESSIBLE' as section,
  id,
  title,
  status,
  latitude,
  longitude
FROM events 
WHERE status = 'active'
ORDER BY scheduled_datetime;
