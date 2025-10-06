-- ═══════════════════════════════════════════════════════════════════════════
-- 🔍 CHECK YOUR EVENTS STATUS
-- ═══════════════════════════════════════════════════════════════════════════
-- Run this in Supabase SQL Editor and share the results with me
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Check if events table exists
SELECT 'Table exists: ' || COUNT(*)::text as check_1
FROM information_schema.tables 
WHERE table_name = 'events';

-- 2. Count total events
SELECT 'Total events in database: ' || COUNT(*)::text as check_2
FROM events;

-- 3. Show all events with details
SELECT 
  'Event details' as check_3,
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

-- 4. Check what's blocking events from showing
SELECT 
  'Analysis' as check_4,
  COUNT(*) as total_events,
  COUNT(*) FILTER (WHERE status = 'active') as with_active_status,
  COUNT(*) FILTER (WHERE scheduled_datetime > NOW()) as with_future_date,
  COUNT(*) FILTER (WHERE status = 'active' AND scheduled_datetime > NOW()) as will_show_in_app
FROM events;

-- 5. Check your user ID (for creating events)
SELECT 
  'Your user ID' as check_5,
  id as user_id,
  email
FROM auth.users 
LIMIT 1;

