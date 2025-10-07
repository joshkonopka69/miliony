-- ═══════════════════════════════════════════════════════════════════════════
-- 📍 CHECK EVENT LOCATIONS
-- ═══════════════════════════════════════════════════════════════════════════
-- This script shows where your events are located
-- ═══════════════════════════════════════════════════════════════════════════

-- Show all events with their coordinates
SELECT 
  '📍 YOUR EVENTS LOCATIONS' as section,
  id,
  title,
  sport_type,
  latitude,
  longitude,
  location_name,
  status,
  scheduled_datetime
FROM events 
ORDER BY title;

-- Wrocław coordinates: approximately 51.1079° N, 17.0385° E
-- Let's calculate distance from Wrocław city center

-- Note: Your events have these coordinates from the logs:
-- Event 1: Basketball 3v3 - coordinates unknown (need to check DB)
-- Event 2: Morning 5K Run - coordinates unknown (need to check DB)  
-- Event 3: 5-a-side Football - coordinates unknown (need to check DB)

-- Your user location from logs: 51.0367967, 17.3133676
-- This is actually IN or very near Wrocław!


