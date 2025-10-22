-- FINAL WORKING SQL - All required fields included
-- Run this in Supabase Dashboard

-- Step 1: Disable RLS temporarily
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE event_messages DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop all existing policies
DROP POLICY IF EXISTS "Users can create events" ON events;
DROP POLICY IF EXISTS "Users can view all events" ON events;
DROP POLICY IF EXISTS "Allow all operations on events" ON events;
DROP POLICY IF EXISTS "Users can join events" ON event_participants;
DROP POLICY IF EXISTS "Allow all operations on event_participants" ON event_participants;
DROP POLICY IF EXISTS "Users can send event messages" ON event_messages;
DROP POLICY IF EXISTS "Allow all operations on event_messages" ON event_messages;

-- Step 3: Clear all data
DELETE FROM event_messages;
DELETE FROM event_participants;
DELETE FROM events;

-- Step 4: Create events with ALL required fields (including sport_type)
INSERT INTO events (title, sport_type, max_participants, latitude, longitude, created_by, scheduled_datetime, status) VALUES
('Basketball Game', 'Basketball', 10, 51.1079, 17.0385, 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', NOW() + INTERVAL '1 hour', 'active'),
('Football Match', 'Football', 22, 51.1089, 17.0395, 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', NOW() + INTERVAL '2 hours', 'active'),
('Tennis Tournament', 'Tennis', 8, 51.1099, 17.0405, 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', NOW() + INTERVAL '3 hours', 'active'),
('Swimming Session', 'Swimming', 15, 51.1109, 17.0415, 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', NOW() + INTERVAL '4 hours', 'active'),
('Running Group', 'Running', 20, 51.1119, 17.0425, 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', NOW() + INTERVAL '5 hours', 'active');

-- Step 5: Add participants (josh to all events, Hubo to Basketball)
INSERT INTO event_participants (event_id, user_id, joined_at)
SELECT e.id, 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', NOW() FROM events e;

INSERT INTO event_participants (event_id, user_id, joined_at)
SELECT e.id, 'f6385377-f738-4486-8692-853dd25b08d8', NOW()
FROM events e WHERE e.title = 'Basketball Game';

-- Step 6: Create chat messages for Basketball Game
INSERT INTO event_messages (event_id, user_id, message, created_at)
SELECT e.id, 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', 'Welcome to the basketball game! Chat is working! 🏀', NOW()
FROM events e WHERE e.title = 'Basketball Game';

INSERT INTO event_messages (event_id, user_id, message, created_at)
SELECT e.id, 'f6385377-f738-4486-8692-853dd25b08d8', 'Hello josh! Looking forward to playing with you! 🎉', NOW() + INTERVAL '1 minute'
FROM events e WHERE e.title = 'Basketball Game';

INSERT INTO event_messages (event_id, user_id, message, created_at)
SELECT e.id, 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', 'Don''t forget to bring water and basketball shoes!', NOW() + INTERVAL '2 minutes'
FROM events e WHERE e.title = 'Basketball Game';

INSERT INTO event_messages (event_id, user_id, message, created_at)
SELECT e.id, 'f6385377-f738-4486-8692-853dd25b08d8', 'Sure thing! See you there! 👍', NOW() + INTERVAL '3 minutes'
FROM events e WHERE e.title = 'Basketball Game';

INSERT INTO event_messages (event_id, user_id, message, created_at)
SELECT e.id, 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', 'Game starts at 8 PM. Don''t be late! ⏰', NOW() + INTERVAL '4 minutes'
FROM events e WHERE e.title = 'Basketball Game';

-- Step 7: Create chat messages for Football Match
INSERT INTO event_messages (event_id, user_id, message, created_at)
SELECT e.id, 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', 'Football match is on! Bring your boots! ⚽', NOW()
FROM events e WHERE e.title = 'Football Match';

INSERT INTO event_messages (event_id, user_id, message, created_at)
SELECT e.id, 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', 'We need a goalkeeper! Anyone?', NOW() + INTERVAL '1 minute'
FROM events e WHERE e.title = 'Football Match';

-- Step 8: Create chat messages for Tennis Tournament
INSERT INTO event_messages (event_id, user_id, message, created_at)
SELECT e.id, 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', 'Tennis tournament starting soon! 🎾', NOW()
FROM events e WHERE e.title = 'Tennis Tournament';

-- Step 9: Re-enable RLS with simple policies that allow everything
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on events" ON events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on event_participants" ON event_participants FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on event_messages" ON event_messages FOR ALL USING (true) WITH CHECK (true);

-- Step 10: Verify everything works
SELECT '✅ Setup Complete!' as status,
       (SELECT COUNT(*) FROM events) as events_created,
       (SELECT COUNT(*) FROM event_participants) as participants_added,
       (SELECT COUNT(*) FROM event_messages) as messages_created;

-- Step 11: Display created events
SELECT 'Created Events:' as info, id, title, sport_type, max_participants, status FROM events ORDER BY created_at;

-- Step 12: Display participants
SELECT 'Participants:' as info, ep.event_id, e.title as event_title, u.display_name as user_name
FROM event_participants ep
JOIN events e ON ep.event_id = e.id
JOIN users u ON ep.user_id = u.id
ORDER BY e.title, u.display_name;

-- Step 13: Display messages
SELECT 'Chat Messages:' as info, e.title as event_title, u.display_name as from_user, em.message, em.created_at
FROM event_messages em
JOIN events e ON em.event_id = e.id
JOIN users u ON em.user_id = u.id
ORDER BY e.title, em.created_at;

SELECT '🎉 All done! Your app is ready!' as result,
       '📱 Press "r" in terminal to restart your app' as next_step,
       '🗺️ Open Map screen to see 5 events' as what_to_do,
       '💬 Tap Basketball Game to see chat with Hubo' as test_chat;
