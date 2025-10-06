-- =====================================================
-- TEST EVENTS FOR YOUR SUPABASE SCHEMA
-- =====================================================
-- This SQL matches YOUR actual database schema
-- Column mapping:
--   title (not name)
--   sport_type (not activity)
--   scheduled_datetime (not created_at)
--   status = 'active' (not 'live')
-- =====================================================

-- First, get your test user UUID:
-- SELECT id FROM profiles LIMIT 1;
-- Copy the UUID and replace YOUR_USER_UUID below

-- =====================================================
-- BASKETBALL EVENT
-- =====================================================
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
  status
) VALUES (
  'YOUR_USER_UUID', -- Replace with your actual user UUID
  'Basketball 3v3',
  'Casual basketball game, all levels welcome!',
  'basketball',
  52.2297,
  21.0122,
  'Central Park Basketball Court',
  null,
  (NOW() + INTERVAL '1 day')::timestamp AT TIME ZONE 'UTC', -- Tomorrow 6 PM
  1,
  6,
  false,
  'active'
);

-- =====================================================
-- RUNNING EVENT
-- =====================================================
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
  status
) VALUES (
  'YOUR_USER_UUID', -- Replace with your actual user UUID
  'Morning 5K Run',
  'Easy pace, good for beginners',
  'running',
  52.2319,
  21.0055,
  'Łazienki Park',
  null,
  (NOW() + INTERVAL '1 day' + INTERVAL '7 hours')::timestamp AT TIME ZONE 'UTC', -- Tomorrow morning
  1,
  10,
  false,
  'active'
);

-- =====================================================
-- FOOTBALL EVENT
-- =====================================================
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
  status
) VALUES (
  'YOUR_USER_UUID', -- Replace with your actual user UUID
  '5-a-side Football',
  'Need 2 more players for friendly match',
  'football',
  52.2256,
  21.0189,
  'Torwar Sports Complex',
  null,
  (NOW() + INTERVAL '1 day' + INTERVAL '16 hours')::timestamp AT TIME ZONE 'UTC', -- Tomorrow 4 PM
  1,
  10,
  false,
  'active'
);

-- =====================================================
-- MORE TEST EVENTS (Warsaw, Poland)
-- =====================================================

-- Tennis
INSERT INTO events (
  creator_id, title, description, sport_type, 
  latitude, longitude, place_name, scheduled_datetime,
  min_participants, max_participants, requires_approval, status
) VALUES (
  'YOUR_USER_UUID',
  'Tennis Practice',
  'Doubles practice session',
  'tennis',
  52.2370, 21.0175, 'Tennis Courts Marymont',
  (NOW() + INTERVAL '2 days')::timestamp AT TIME ZONE 'UTC',
  2, 4, false, 'active'
);

-- Yoga
INSERT INTO events (
  creator_id, title, description, sport_type,
  latitude, longitude, place_name, scheduled_datetime,
  min_participants, max_participants, requires_approval, status
) VALUES (
  'YOUR_USER_UUID',
  'Sunset Yoga',
  'Relaxing yoga in the park',
  'yoga',
  52.2162, 21.0311, 'Park Skaryszewski',
  (NOW() + INTERVAL '2 days' + INTERVAL '18 hours')::timestamp AT TIME ZONE 'UTC',
  5, 15, false, 'active'
);

-- Cycling
INSERT INTO events (
  creator_id, title, description, sport_type,
  latitude, longitude, place_name, scheduled_datetime,
  min_participants, max_participants, requires_approval, status
) VALUES (
  'YOUR_USER_UUID',
  'Group Bike Ride',
  'Scenic 20km ride along Vistula',
  'cycling',
  52.2430, 21.0150, 'Vistula Boulevards',
  (NOW() + INTERVAL '3 days')::timestamp AT TIME ZONE 'UTC',
  5, 20, false, 'active'
);

-- Volleyball
INSERT INTO events (
  creator_id, title, description, sport_type,
  latitude, longitude, place_name, scheduled_datetime,
  min_participants, max_participants, requires_approval, status
) VALUES (
  'YOUR_USER_UUID',
  'Beach Volleyball',
  'Friendly beach volleyball game',
  'volleyball',
  52.2580, 21.0400, 'Plaża Poniatówka',
  (NOW() + INTERVAL '3 days' + INTERVAL '14 hours')::timestamp AT TIME ZONE 'UTC',
  8, 12, false, 'active'
);

-- Gym
INSERT INTO events (
  creator_id, title, description, sport_type,
  latitude, longitude, place_name, scheduled_datetime,
  min_participants, max_participants, requires_approval, status
) VALUES (
  'YOUR_USER_UUID',
  'CrossFit Session',
  'High intensity workout',
  'gym',
  52.2250, 21.0100, 'CrossFit Box Warsaw',
  (NOW() + INTERVAL '4 days' + INTERVAL '18 hours')::timestamp AT TIME ZONE 'UTC',
  6, 12, false, 'active'
);

-- Swimming
INSERT INTO events (
  creator_id, title, description, sport_type,
  latitude, longitude, place_name, scheduled_datetime,
  min_participants, max_participants, requires_approval, status
) VALUES (
  'YOUR_USER_UUID',
  'Morning Swim',
  'Lane swimming for fitness',
  'swimming',
  52.2200, 21.0220, 'Aquatic Center',
  (NOW() + INTERVAL '5 days' + INTERVAL '7 hours')::timestamp AT TIME ZONE 'UTC',
  4, 10, false, 'active'
);

-- Climbing
INSERT INTO events (
  creator_id, title, description, sport_type,
  latitude, longitude, place_name, scheduled_datetime,
  min_participants, max_participants, requires_approval, status
) VALUES (
  'YOUR_USER_UUID',
  'Indoor Climbing',
  'Bouldering session',
  'climbing',
  52.2350, 21.0050, 'Climbing Gym Warsaw',
  (NOW() + INTERVAL '5 days' + INTERVAL '19 hours')::timestamp AT TIME ZONE 'UTC',
  4, 8, false, 'active'
);

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================
-- Run this to verify events were created
SELECT 
  id,
  title,
  sport_type,
  latitude,
  longitude,
  place_name,
  scheduled_datetime,
  status,
  max_participants
FROM events
WHERE status = 'active'
  AND scheduled_datetime > NOW()
ORDER BY scheduled_datetime ASC;

-- =====================================================
-- COUNT QUERY
-- =====================================================
SELECT 
  COUNT(*) as total_events,
  sport_type,
  status
FROM events
WHERE scheduled_datetime > NOW()
GROUP BY sport_type, status
ORDER BY COUNT(*) DESC;

-- =====================================================
-- CLEANUP (Optional)
-- =====================================================
-- Uncomment to delete test events
-- DELETE FROM events 
-- WHERE title IN (
--   'Basketball 3v3',
--   'Morning 5K Run',
--   '5-a-side Football',
--   'Tennis Practice',
--   'Sunset Yoga',
--   'Group Bike Ride',
--   'Beach Volleyball',
--   'CrossFit Session',
--   'Morning Swim',
--   'Indoor Climbing'
-- );

