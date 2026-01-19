-- TEMPORARY FIX FOR EVENT CREATION
-- Run this SQL in your Supabase dashboard to enable event creation today

-- Step 1: Temporarily disable RLS on events table
ALTER TABLE events DISABLE ROW LEVEL SECURITY;

-- Step 2: Create a test event to refresh schema cache
INSERT INTO events (latitude, longitude, created_by) VALUES 
(51.1079, 17.0385, 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7');

-- Step 3: Re-enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Step 4: Create proper RLS policies for events
DROP POLICY IF EXISTS "Users can create events" ON events;
CREATE POLICY "Users can create events" ON events
  FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can view events" ON events;
CREATE POLICY "Users can view events" ON events
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own events" ON events;
CREATE POLICY "Users can update own events" ON events
  FOR UPDATE USING (auth.uid() = created_by);

-- Step 5: Create proper RLS policies for event_participants
DROP POLICY IF EXISTS "Users can join events" ON event_participants;
CREATE POLICY "Users can join events" ON event_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Event participants are readable by participants" ON event_participants;
CREATE POLICY "Event participants are readable by participants" ON event_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM event_participants ep2
      WHERE ep2.event_id = event_participants.event_id
      AND ep2.user_id = auth.uid()
    )
  );

-- Step 6: Create proper RLS policies for event_messages
DROP POLICY IF EXISTS "Event messages are readable by participants" ON event_messages;
CREATE POLICY "Event messages are readable by participants" ON event_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM event_participants
      WHERE event_participants.event_id = event_messages.event_id
      AND event_participants.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can send messages to events they joined" ON event_messages;
CREATE POLICY "Users can send messages to events they joined" ON event_messages
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM event_participants
      WHERE event_participants.event_id = event_messages.event_id
      AND event_participants.user_id = auth.uid()
    )
  );

-- Step 7: Create sample events for testing
INSERT INTO events (title, sport_type, description, max_participants, latitude, longitude, location_name, created_by, scheduled_datetime, status) VALUES
('Basketball Game in Wrocław', 'Basketball', 'Fun basketball game in the city center. All skill levels welcome!', 10, 51.1079, 17.0385, 'Wrocław City Center', 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', NOW() + INTERVAL '1 day', 'active'),
('Football Match', 'Football', 'Casual football match for everyone', 22, 51.1089, 17.0395, 'Wrocław Stadium', 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', NOW() + INTERVAL '2 days', 'active'),
('Tennis Tournament', 'Tennis', 'Friendly tennis tournament', 8, 51.1099, 17.0405, 'Tennis Club Wrocław', 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', NOW() + INTERVAL '3 days', 'active');

-- Step 8: Add sample event participants
INSERT INTO event_participants (event_id, user_id)
SELECT e.id, 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7'
FROM events e
WHERE e.title IN ('Basketball Game in Wrocław', 'Football Match', 'Tennis Tournament');

-- Step 9: Add sample event messages
INSERT INTO event_messages (event_id, user_id, message)
SELECT e.id, 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', 'Welcome to the event! Looking forward to playing with everyone.'
FROM events e
WHERE e.title = 'Basketball Game in Wrocław';

INSERT INTO event_messages (event_id, user_id, message)
SELECT e.id, 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', 'Don''t forget to bring your football boots!'
FROM events e
WHERE e.title = 'Football Match';

-- Step 10: Verify everything works
SELECT 'Events created:' as status, COUNT(*) as count FROM events;
SELECT 'Event participants created:' as status, COUNT(*) as count FROM event_participants;
SELECT 'Event messages created:' as status, COUNT(*) as count FROM event_messages;

