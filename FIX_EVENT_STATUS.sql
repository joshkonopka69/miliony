-- ═══════════════════════════════════════════════════════════════════════════
-- 🎯 FIX EVENT STATUS - Make Events Visible
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Check current event statuses
SELECT 
  '📊 CURRENT EVENT STATUSES' as section,
  id,
  title,
  status,
  latitude,
  longitude
FROM events;

-- 2. Set ALL events to 'active' status
UPDATE events SET status = 'active' WHERE status != 'active';

-- 3. Verify the fix
SELECT 
  '✅ EVENTS NOW ACTIVE' as section,
  id,
  title,
  status,
  latitude,
  longitude,
  CASE 
    WHEN latitude IS NULL OR longitude IS NULL THEN '❌ Missing coordinates'
    WHEN latitude = 0 OR longitude = 0 THEN '❌ Zero coordinates'
    ELSE '✅ Ready for pins'
  END as coordinate_status
FROM events 
WHERE status = 'active'
ORDER BY title;

-- 4. Final summary
SELECT 
  '🎯 SUMMARY' as section,
  COUNT(*) as total_events,
  COUNT(*) FILTER (WHERE status = 'active') as active_events,
  COUNT(*) FILTER (WHERE status = 'active' AND latitude IS NOT NULL AND longitude IS NOT NULL) as events_with_coordinates
FROM events;
