-- ═══════════════════════════════════════════════════════════════════════════
-- 🎯 QUICK FIX - GET PINS WORKING FIRST
-- ═══════════════════════════════════════════════════════════════════════════
-- This script focuses ONLY on getting event pins to work
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Disable RLS on events table (allows queries without authentication)
ALTER TABLE public.events DISABLE ROW LEVEL SECURITY;

-- 2. Verify events are accessible
SELECT 
  '✅ EVENTS NOW ACCESSIBLE' as status,
  COUNT(*) as total_events,
  COUNT(*) FILTER (WHERE status = 'active') as active_events
FROM events;

-- 3. Show the events that should appear as pins
SELECT 
  '📍 EVENTS FOR PINS' as status,
  id,
  title,
  status,
  latitude,
  longitude,
  location_name
FROM events 
WHERE status = 'active'
ORDER BY scheduled_datetime;

-- 4. Check if coordinates are valid (not NULL or 0)
SELECT 
  '🔍 COORDINATE CHECK' as status,
  id,
  title,
  CASE 
    WHEN latitude IS NULL OR longitude IS NULL THEN '❌ NULL coordinates'
    WHEN latitude = 0 OR longitude = 0 THEN '❌ Zero coordinates'
    WHEN latitude < 50.9 OR latitude > 51.3 THEN '⚠️ Outside Wrocław (latitude)'
    WHEN longitude < 16.8 OR longitude > 17.5 THEN '⚠️ Outside Wrocław (longitude)'
    ELSE '✅ Valid Wrocław coordinates'
  END as coordinate_status,
  latitude,
  longitude
FROM events 
WHERE status = 'active';
