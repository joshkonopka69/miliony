-- ═══════════════════════════════════════════════════════════════════════════
-- 🔧 FIX EVENT DATES - UPDATE FROM 2025 TO 2026
-- ═══════════════════════════════════════════════════════════════════════════
-- This script updates all event dates from 2025 to 2026 so they appear as future events
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Show current events with their dates
SELECT 
  '📊 CURRENT EVENTS' as section,
  id,
  title,
  sport_type,
  status,
  scheduled_datetime,
  NOW() as current_time,
  scheduled_datetime > NOW() as is_future
FROM events 
ORDER BY scheduled_datetime;

-- 2. Update all events from 2025 to 2026
UPDATE events 
SET scheduled_datetime = scheduled_datetime + INTERVAL '1 year'
WHERE EXTRACT(YEAR FROM scheduled_datetime) = 2025;

-- 3. Show updated events
SELECT 
  '✅ UPDATED EVENTS' as section,
  id,
  title,
  sport_type,
  status,
  scheduled_datetime,
  NOW() as current_time,
  scheduled_datetime > NOW() as is_future
FROM events 
ORDER BY scheduled_datetime;

-- 4. Verify the fix worked
SELECT 
  '🎯 VERIFICATION' as section,
  COUNT(*) as total_events,
  COUNT(*) FILTER (WHERE status = 'active') as with_active_status,
  COUNT(*) FILTER (WHERE scheduled_datetime > NOW()) as with_future_date,
  COUNT(*) FILTER (WHERE status = 'active' AND scheduled_datetime > NOW()) as will_show_in_app
FROM events;

