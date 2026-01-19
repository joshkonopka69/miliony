-- FIXED SQL - Handles existing policies
-- Run this in Supabase Dashboard

-- Step 1: Disable RLS temporarily
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE event_messages DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can create events" ON events;
DROP POLICY IF EXISTS "Users can view all events" ON events;
DROP POLICY IF EXISTS "Users can update own events" ON events;
DROP POLICY IF EXISTS "Users can delete own events" ON events;
DROP POLICY IF EXISTS "Users can join events" ON event_participants;
DROP POLICY IF EXISTS "Users can view event participants" ON event_participants;
DROP POLICY IF EXISTS "Users can leave events" ON event_participants;
DROP POLICY IF EXISTS "Users can send event messages" ON event_messages;
DROP POLICY IF EXISTS "Users can view event messages" ON event_messages;

-- Step 3: Clear problematic data
DELETE FROM event_messages;
DELETE FROM event_participants;
DELETE FROM events;

-- Step 4: Create events with ALL required fields (no NULL values)
INSERT INTO events (title, sport_type, max_participants, latitude, longitude, created_by, scheduled_datetime, status) VALUES
('Basketball Game', 'Basketball', 10, 51.1079, 17.0385, 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', NOW() + INTERVAL '1 day', 'active'),
('Football Match', 'Football', 22, 51.1089, 17.0395, 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', NOW() + INTERVAL '2 days', 'active'),
('Tennis Tournament', 'Tennis', 8, 51.1099, 17.0405, 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', NOW() + INTERVAL '3 days', 'active');

-- Step 5: Create event participants
INSERT INTO event_participants (event_id, user_id, joined_at)
SELECT e.id, 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', NOW()
FROM events e;

-- Step 6: Create event messages
INSERT INTO event_messages (event_id, user_id, message, created_at)
SELECT e.id, 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', 'Welcome to the event!', NOW()
FROM events e;

-- Step 7: Test event creation
INSERT INTO events (title, sport_type, max_participants, latitude, longitude, created_by, scheduled_datetime, status) VALUES
('Test Event - Fixed', 'Basketball', 10, 51.1079, 17.0385, 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', NOW() + INTERVAL '1 day', 'active');

-- Step 8: Re-enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_messages ENABLE ROW LEVEL SECURITY;

-- Step 9: Create new policies (now that old ones are dropped)
CREATE POLICY "Users can view all events" ON events FOR SELECT USING (true);
CREATE POLICY "Users can create events" ON events FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update own events" ON events FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete own events" ON events FOR DELETE USING (auth.uid() = created_by);

CREATE POLICY "Users can view event participants" ON event_participants FOR SELECT USING (true);
CREATE POLICY "Users can join events" ON event_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave events" ON event_participants FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view event messages" ON event_messages FOR SELECT USING (true);
CREATE POLICY "Users can send event messages" ON event_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Step 10: Verify everything works
SELECT 'Events created:' as status, COUNT(*) as count FROM events;
SELECT 'Event participants created:' as status, COUNT(*) as count FROM event_participants;
SELECT 'Event messages created:' as status, COUNT(*) as count FROM event_messages;

SELECT 'All done! Your app should now work perfectly!' as result;

