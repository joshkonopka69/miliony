-- ═══════════════════════════════════════════════════════════════════════════
-- 🔍 DEBUG YOUR EXISTING EVENTS
-- ═══════════════════════════════════════════════════════════════════════════
-- Run this to see what's wrong with your events
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Show ALL your events with details
SELECT 
  '📊 ALL YOUR EVENTS' as section,
  id,
  title,
  sport_type,
  status,
  scheduled_datetime,
  NOW() as current_time,
  scheduled_datetime > NOW() as is_future,
  latitude,
  longitude,
  created_at
FROM events 
ORDER BY created_at DESC;

-- 2. Check what your app is looking for
SELECT 
  '🎯 WHAT APP LOOKS FOR' as section,
  COUNT(*) as total_events,
  COUNT(*) FILTER (WHERE status = 'active') as with_active_status,
  COUNT(*) FILTER (WHERE scheduled_datetime > NOW()) as with_future_date,
  COUNT(*) FILTER (WHERE status = 'active' AND scheduled_datetime > NOW()) as will_show_in_app
FROM events;

-- 3. Show only events that WILL show in app
SELECT 
  '✅ EVENTS THAT WILL SHOW' as section,
  id,
  title,
  sport_type,
  status,
  TO_CHAR(scheduled_datetime, 'YYYY-MM-DD HH24:MI') as scheduled_for,
  latitude,
  longitude
FROM events 
WHERE status = 'active' 
  AND scheduled_datetime > NOW()
ORDER BY scheduled_datetime;

-- 4. Check RLS policies
SELECT 
  '🔒 RLS POLICIES' as section,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'events';

-- 5. Test the exact query your app uses
SELECT 
  '🧪 APP QUERY TEST' as section,
  *
FROM events
WHERE status = 'active'
  AND scheduled_datetime > NOW()
ORDER BY scheduled_datetime
LIMIT 100;
