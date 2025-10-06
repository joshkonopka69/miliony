-- ═══════════════════════════════════════════════════════════════════════════
-- 🚀 CREATE EVENTS - COMPLETE FIX
-- ═══════════════════════════════════════════════════════════════════════════
-- This will create 3 test events that WILL show in your app
-- ═══════════════════════════════════════════════════════════════════════════

-- Step 1: Temporarily disable RLS
ALTER TABLE events DISABLE ROW LEVEL SECURITY;

-- Step 2: Delete old test events (optional - uncomment if you want fresh start)
-- DELETE FROM events WHERE title IN ('Basketball 3v3', 'Morning 5K Run', '5-a-side Football');

-- Step 3: Get your user ID (we'll use the first user)
DO $$
DECLARE
  v_user_id uuid;
  v_event_count integer;
BEGIN
  -- Get first user ID
  SELECT id INTO v_user_id FROM auth.users ORDER BY created_at LIMIT 1;
  
  -- If no user exists, create a dummy UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
    RAISE NOTICE 'No user found, using generated UUID: %', v_user_id;
  ELSE
    RAISE NOTICE 'Using user ID: %', v_user_id;
  END IF;
  
  -- Check if test events already exist
  SELECT COUNT(*) INTO v_event_count 
  FROM events 
  WHERE title IN ('Basketball 3v3', 'Morning 5K Run', '5-a-side Football');
  
  IF v_event_count > 0 THEN
    RAISE NOTICE 'Found % existing test events, updating them...', v_event_count;
    
    -- Update existing events to future dates
    UPDATE events 
    SET scheduled_datetime = NOW() + INTERVAL '1 day',
        status = 'active'
    WHERE title IN ('Basketball 3v3', 'Morning 5K Run', '5-a-side Football');
    
  ELSE
    RAISE NOTICE 'No test events found, creating new ones...';
    
    -- Insert 3 new test events
    INSERT INTO events (
      creator_id,
      title,
      description,
      sport_type,
      latitude,
      longitude,
      place_name,
      place_id,
      scheduled_datetime,
      min_participants,
      max_participants,
      requires_approval,
      status,
      created_at,
      updated_at
    ) VALUES 
      -- Basketball Event
      (
        v_user_id,
        'Basketball 3v3',
        'Casual basketball game, all levels welcome!',
        'basketball',
        52.2297,
        21.0122,
        'Central Park Basketball Court',
        null,
        NOW() + INTERVAL '1 day',
        1,
        6,
        false,
        'active',
        NOW(),
        NOW()
      ),
      
      -- Running Event
      (
        v_user_id,
        'Morning 5K Run',
        'Easy pace, good for beginners',
        'running',
        52.2319,
        21.0055,
        'Łazienki Park',
        null,
        NOW() + INTERVAL '2 days',
        1,
        10,
        false,
        'active',
        NOW(),
        NOW()
      ),
      
      -- Football Event
      (
        v_user_id,
        '5-a-side Football',
        'Need 2 more players for friendly match',
        'football',
        52.2256,
        21.0189,
        'Torwar Sports Complex',
        null,
        NOW() + INTERVAL '3 days',
        1,
        10,
        false,
        'active',
        NOW(),
        NOW()
      );
      
    RAISE NOTICE '✅ Created 3 new test events';
  END IF;
END $$;

-- Step 4: Verify events were created
SELECT 
  '✅ VERIFICATION' as step,
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

-- Step 5: Count events that will show
SELECT 
  '🎉 READY' as message,
  COUNT(*) as events_that_will_show_in_app
FROM events 
WHERE status = 'active' 
  AND scheduled_datetime > NOW();

-- Step 6: Re-enable RLS with proper policy
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Step 7: Drop and recreate policy
DROP POLICY IF EXISTS "Allow public read access to active events" ON events;
CREATE POLICY "Allow public read access to active events"
ON events FOR SELECT
USING (status = 'active');

-- ═══════════════════════════════════════════════════════════════════════════
-- ✅ DONE! 
-- You should see "events_that_will_show_in_app: 3"
-- Now restart your Expo app
-- ═══════════════════════════════════════════════════════════════════════════

