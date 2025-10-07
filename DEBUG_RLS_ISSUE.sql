-- ═══════════════════════════════════════════════════════════════════════════
-- 🔍 DEBUG RLS ISSUE - WHY FILTERED QUERY RETURNS 0 EVENTS
-- ═══════════════════════════════════════════════════════════════════════════
-- This script helps debug why the filtered query is blocked by RLS
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Check current RLS status
SELECT 
  '🔒 RLS STATUS' as section,
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'events';

-- 2. Check existing policies
SELECT 
  '📋 CURRENT POLICIES' as section,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'events'
ORDER BY policyname;

-- 3. Test the exact queries that are failing
-- Test 1: Unfiltered query (should work)
SELECT 
  '🧪 TEST 1: UNFILTERED QUERY' as section,
  COUNT(*) as total_events
FROM events;

-- Test 2: Filtered query (this is failing)
SELECT 
  '🧪 TEST 2: FILTERED QUERY' as section,
  COUNT(*) as active_events
FROM events 
WHERE status = 'active';

-- Test 3: Check what status values exist
SELECT 
  '🔍 STATUS VALUES' as section,
  status,
  COUNT(*) as count
FROM events 
GROUP BY status;

-- 4. Test with different approaches
-- Test 4: Try without WHERE clause but with status check
SELECT 
  '🧪 TEST 3: STATUS CHECK' as section,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'active') as active_count
FROM events;

-- 5. Show the actual events and their status
SELECT 
  '📊 ACTUAL EVENTS' as section,
  id,
  title,
  status,
  scheduled_datetime
FROM events 
ORDER BY scheduled_datetime;
