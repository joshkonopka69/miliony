-- ═══════════════════════════════════════════════════════════════════════════
-- 🔧 FIX PROFILES TABLE REFERENCES
-- ═══════════════════════════════════════════════════════════════════════════
-- This script helps fix the app to use your profiles table instead of users
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Disable RLS on events table (quick fix for pins)
ALTER TABLE public.events DISABLE ROW LEVEL SECURITY;

-- 2. Check if events have valid coordinates
SELECT 
  '📍 COORDINATE CHECK' as status,
  id,
  title,
  status,
  latitude,
  longitude,
  CASE 
    WHEN latitude IS NULL OR longitude IS NULL THEN '❌ NULL coordinates'
    WHEN latitude = 0 OR longitude = 0 THEN '❌ Zero coordinates'
    WHEN latitude < 50.9 OR latitude > 51.3 THEN '⚠️ Outside Wrocław'
    WHEN longitude < 16.8 OR longitude > 17.5 THEN '⚠️ Outside Wrocław'
    ELSE '✅ Valid coordinates'
  END as coordinate_status
FROM events 
WHERE status = 'active';

-- 3. Test the exact query the app uses
SELECT 
  '🧪 APP QUERY TEST' as status,
  COUNT(*) as total_events,
  COUNT(*) FILTER (WHERE status = 'active') as active_events
FROM events;

-- 4. Show events that should appear as pins
SELECT 
  '📊 EVENTS FOR PINS' as status,
  id,
  title,
  sport_type,
  status,
  latitude,
  longitude,
  place_name,
  scheduled_datetime
FROM events 
WHERE status = 'active'
ORDER BY scheduled_datetime;
