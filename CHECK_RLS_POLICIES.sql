-- ═══════════════════════════════════════════════════════════════════════════
-- 🔍 CHECK RLS POLICIES - CAN WE KEEP RLS ENABLED?
-- ═══════════════════════════════════════════════════════════════════════════
-- This script checks your current RLS setup to see if we can make it work
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Check RLS status on both tables
SELECT 
  '🔒 RLS STATUS' as section,
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('events', 'profiles');

-- 2. Check existing RLS policies
SELECT 
  '📋 EXISTING POLICIES' as section,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('events', 'profiles')
ORDER BY tablename, policyname;

-- 3. Test current authentication context
SELECT 
  '👤 AUTH CONTEXT' as section,
  current_user,
  session_user,
  current_setting('request.jwt.claims', true) as jwt_claims;

-- 4. Test if we can read events with current auth
SELECT 
  '🧪 EVENTS ACCESS TEST' as section,
  COUNT(*) as accessible_events
FROM events;
