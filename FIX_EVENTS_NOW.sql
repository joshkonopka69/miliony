-- ═══════════════════════════════════════════════════════════════════════════
-- 🚀 QUICK FIX: Make Events Show in Your App
-- ═══════════════════════════════════════════════════════════════════════════
-- Copy and paste this ENTIRE script into Supabase SQL Editor and run it.
-- ═══════════════════════════════════════════════════════════════════════════

-- Step 1: Check what we have
SELECT 
  '📊 CURRENT STATE' as step,
  COUNT(*) as total_events,
  COUNT(*) FILTER (WHERE status = 'active') as active_events,
  COUNT(*) FILTER (WHERE scheduled_datetime > NOW()) as future_events,
  COUNT(*) FILTER (WHERE status = 'active' AND scheduled_datetime > NOW()) as will_show_in_app
FROM events;

-- Step 2: Temporarily disable RLS for testing
ALTER TABLE events DISABLE ROW LEVEL SECURITY;

-- Step 3: Fix existing events - make them future-dated
UPDATE events 
SET scheduled_datetime = (NOW() + INTERVAL '1 day')::timestamp
WHERE status = 'active';

-- Step 4: Check results
SELECT 
  '✅ AFTER FIX' as step,
  id,
  title,
  sport_type,
  status,
  TO_CHAR(scheduled_datetime, 'YYYY-MM-DD HH24:MI') as scheduled_for,
  scheduled_datetime > NOW() as is_future,
  ROUND(latitude::numeric, 4) as lat,
  ROUND(longitude::numeric, 4) as lng
FROM events 
WHERE status = 'active'
ORDER BY scheduled_datetime;

-- Step 5: Re-enable RLS with proper policy
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Step 6: Create SELECT policy (if doesn't exist)
DROP POLICY IF EXISTS "Allow public read access to active events" ON events;
CREATE POLICY "Allow public read access to active events"
ON events FOR SELECT
USING (status = 'active');

-- Step 7: Final verification
SELECT 
  '🎉 READY TO TEST' as message,
  COUNT(*) as events_that_will_show
FROM events 
WHERE status = 'active' 
  AND scheduled_datetime > NOW();

-- ═══════════════════════════════════════════════════════════════════════════
-- ✅ DONE! Now restart your Expo app and check the map.
-- ═══════════════════════════════════════════════════════════════════════════

