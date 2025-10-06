-- =====================================================
-- TEST EVENTS FOR MAP MARKERS
-- =====================================================
-- Run this SQL in Supabase SQL Editor to create test events
-- These events will appear as markers on the map with sport emojis
-- =====================================================

-- Clean up existing test events (optional)
-- DELETE FROM events WHERE name LIKE 'Test%' OR name LIKE '%Basketball%' OR name LIKE '%Soccer%' OR name LIKE '%Tennis%';

-- Insert test events at various locations
-- Note: Using New York City coordinates as example
-- Adjust latitude/longitude for your desired location

INSERT INTO events (
  name,
  activity,
  description,
  min_participants,
  max_participants,
  participants_count,
  location_name,
  latitude,
  longitude,
  place_id,
  status,
  created_at,
  updated_at
) VALUES 
  -- Basketball Event
  (
    'Morning Basketball Game',
    'basketball',
    'Casual pickup basketball game at Central Park. All skill levels welcome!',
    4,
    10,
    3,
    'Central Park Basketball Courts',
    40.7829,
    -73.9654,
    'ChIJqapmxS5YwokRUYM8_D1ygHM',
    'live',
    NOW() + INTERVAL '1 hour',
    NOW()
  ),
  
  -- Football/Soccer Event
  (
    'Evening Soccer Match',
    'football',
    '5v5 soccer game. Looking for skilled players!',
    8,
    22,
    8,
    'Bryant Park Soccer Field',
    40.7580,
    -73.9855,
    'ChIJmQJIxlVYwokRLgeuocVOGVU',
    'live',
    NOW() + INTERVAL '2 hours',
    NOW()
  ),
  
  -- Tennis Event
  (
    'Tennis Practice Session',
    'tennis',
    'Doubles tennis practice. Bring your own racket.',
    2,
    4,
    2,
    'Tennis Courts at Riverside Park',
    40.7489,
    -73.9680,
    'ChIJQSrBBv5YwokRb1witOzHcGI',
    'live',
    NOW() + INTERVAL '3 hours',
    NOW()
  ),
  
  -- Running Event
  (
    'Morning 5K Run',
    'running',
    '5K running group. Perfect for all fitness levels.',
    5,
    20,
    15,
    'Hudson River Greenway',
    40.7614,
    -73.9776,
    'ChIJ4zGFAzpYwokRGUGphH6mAAQ',
    'live',
    NOW() + INTERVAL '4 hours',
    NOW()
  ),
  
  -- Yoga Event
  (
    'Sunset Yoga Session',
    'yoga',
    'Relaxing yoga class in the park. Bring your own mat.',
    5,
    15,
    5,
    'Sheep Meadow, Central Park',
    40.7712,
    -73.9740,
    'ChIJYeC9REpYwokRqMg5aHKFKqU',
    'live',
    NOW() + INTERVAL '5 hours',
    NOW()
  ),
  
  -- Gym Workout
  (
    'CrossFit Group Session',
    'gym',
    'High-intensity CrossFit workout. Intermediate level.',
    6,
    12,
    4,
    'Chelsea Piers Fitness Center',
    40.7467,
    -74.0093,
    'ChIJM-dVYYFZwokRs-lqWRQSEDI',
    'live',
    NOW() + INTERVAL '6 hours',
    NOW()
  ),
  
  -- Volleyball Event
  (
    'Beach Volleyball Tournament',
    'volleyball',
    'Competitive beach volleyball. Teams of 4.',
    8,
    16,
    10,
    'Brooklyn Bridge Park - Pier 5',
    40.6966,
    -73.9989,
    'ChIJhWF7X-xbwokR3Z6aIqflabI',
    'live',
    NOW() + INTERVAL '7 hours',
    NOW()
  ),
  
  -- Cycling Event
  (
    'Group Cycling Tour',
    'cycling',
    'Scenic bike ride through Manhattan. 15 miles.',
    5,
    20,
    12,
    'Central Park Loop',
    40.7812,
    -73.9665,
    'ChIJqapmxS5YwokRUYM8_D1ygHM',
    'live',
    NOW() + INTERVAL '8 hours',
    NOW()
  ),
  
  -- Swimming Event
  (
    'Morning Swim Practice',
    'swimming',
    'Pool swimming for fitness. All levels welcome.',
    4,
    12,
    6,
    'Aquatic Center',
    40.7500,
    -73.9700,
    null,
    'live',
    NOW() + INTERVAL '9 hours',
    NOW()
  ),
  
  -- Climbing Event
  (
    'Indoor Rock Climbing',
    'climbing',
    'Bouldering session at indoor climbing gym.',
    4,
    10,
    5,
    'Brooklyn Boulders',
    40.6782,
    -73.9442,
    'ChIJdwJ-X09bwokRzRgPK5VGmEA',
    'live',
    NOW() + INTERVAL '10 hours',
    NOW()
  ),
  
  -- Badminton Event
  (
    'Badminton League Night',
    'badminton',
    'Competitive badminton matches. Singles and doubles.',
    4,
    8,
    3,
    'Manhattan Sports Complex',
    40.7589,
    -73.9851,
    null,
    'live',
    NOW() + INTERVAL '11 hours',
    NOW()
  ),
  
  -- Baseball Event
  (
    'Softball Practice',
    'baseball',
    'Casual softball game. Gloves provided.',
    9,
    18,
    11,
    'Heckscher Ballfields',
    40.7688,
    -73.9730,
    'ChIJ4zGFAzpYwokRGUGphH6mAAQ',
    'live',
    NOW() + INTERVAL '12 hours',
    NOW()
  );

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================
-- Run this to verify events were created successfully
SELECT 
  id,
  name,
  activity,
  participants_count || '/' || max_participants as participants,
  location_name,
  latitude,
  longitude,
  status,
  created_at
FROM events
WHERE status = 'live'
  AND created_at > NOW()
ORDER BY created_at ASC;

-- =====================================================
-- EXPECTED RESULTS
-- =====================================================
-- You should see 12 events with different sports:
-- 🏀 Basketball
-- ⚽ Football
-- 🎾 Tennis  
-- 🏃‍♂️ Running
-- 🧘 Yoga
-- 💪 Gym
-- 🏐 Volleyball
-- 🚴‍♂️ Cycling
-- 🏊‍♂️ Swimming
-- 🧗‍♂️ Climbing
-- 🏸 Badminton
-- ⚾ Baseball
--
-- Each event should have:
-- - Unique location (latitude/longitude)
-- - Participant count
-- - Status = 'live'
-- - Future timestamp
-- =====================================================

-- =====================================================
-- CLEANUP (Optional)
-- =====================================================
-- Run this to remove all test events
-- DELETE FROM events WHERE name IN (
--   'Morning Basketball Game',
--   'Evening Soccer Match',
--   'Tennis Practice Session',
--   'Morning 5K Run',
--   'Sunset Yoga Session',
--   'CrossFit Group Session',
--   'Beach Volleyball Tournament',
--   'Group Cycling Tour',
--   'Morning Swim Practice',
--   'Indoor Rock Climbing',
--   'Badminton League Night',
--   'Softball Practice'
-- );

