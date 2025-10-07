-- ═══════════════════════════════════════════════════════════════════════════
-- 🔍 DEBUG DATE COMPARISON ISSUE
-- ═══════════════════════════════════════════════════════════════════════════
-- This script helps debug why the date comparison is failing
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Show current time in different formats
SELECT 
  '🕐 TIME COMPARISON' as section,
  NOW() as current_time,
  NOW()::text as current_time_text,
  (NOW() AT TIME ZONE 'UTC')::text as current_utc,
  (NOW() AT TIME ZONE 'UTC')::timestamp as current_utc_timestamp;

-- 2. Show events with detailed time comparison
SELECT 
  '📊 EVENTS WITH TIME COMPARISON' as section,
  id,
  title,
  scheduled_datetime,
  scheduled_datetime::text as scheduled_text,
  NOW() as current_time,
  scheduled_datetime > NOW() as is_future_sql,
  scheduled_datetime > (NOW() AT TIME ZONE 'UTC') as is_future_utc,
  EXTRACT(EPOCH FROM (scheduled_datetime - NOW())) as seconds_difference
FROM events 
ORDER BY scheduled_datetime;

-- 3. Test the exact filter conditions
SELECT 
  '🎯 FILTER TEST' as section,
  COUNT(*) as total_events,
  COUNT(*) FILTER (WHERE status = 'active') as with_active_status,
  COUNT(*) FILTER (WHERE scheduled_datetime > NOW()) as with_future_date,
  COUNT(*) FILTER (WHERE status = 'active' AND scheduled_datetime > NOW()) as will_show_in_app
FROM events;

-- 4. Show events that should pass the filter
SELECT 
  '✅ EVENTS THAT SHOULD SHOW' as section,
  id,
  title,
  status,
  scheduled_datetime,
  scheduled_datetime > NOW() as is_future
FROM events 
WHERE status = 'active' 
  AND scheduled_datetime > NOW()
ORDER BY scheduled_datetime;
