-- Enable Real-Time for Chat and Events
-- Run this in Supabase Dashboard

-- Step 1: Enable real-time for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE events;
ALTER PUBLICATION supabase_realtime ADD TABLE event_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE event_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE users;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE groups;
ALTER PUBLICATION supabase_realtime ADD TABLE group_members;

-- Step 2: Create functions for real-time updates
CREATE OR REPLACE FUNCTION notify_event_change()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify('event_changes', json_build_object(
    'table', TG_TABLE_NAME,
    'action', TG_OP,
    'old', row_to_json(OLD),
    'new', row_to_json(NEW)
  )::text);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION notify_message_change()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify('message_changes', json_build_object(
    'table', TG_TABLE_NAME,
    'action', TG_OP,
    'old', row_to_json(OLD),
    'new', row_to_json(NEW)
  )::text);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Step 3: Create triggers for real-time updates
DROP TRIGGER IF EXISTS event_change_trigger ON events;
CREATE TRIGGER event_change_trigger
  AFTER INSERT OR UPDATE OR DELETE ON events
  FOR EACH ROW EXECUTE FUNCTION notify_event_change();

DROP TRIGGER IF EXISTS message_change_trigger ON event_messages;
CREATE TRIGGER message_change_trigger
  AFTER INSERT OR UPDATE OR DELETE ON event_messages
  FOR EACH ROW EXECUTE FUNCTION notify_message_change();

-- Step 4: Create sample events for testing
INSERT INTO events (title, sport_type, description, max_participants, latitude, longitude, location_name, created_by, scheduled_datetime, status) VALUES
('Live Basketball Game', 'Basketball', 'Real-time test basketball game', 10, 51.1079, 17.0385, 'Wrocław Center', 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', NOW() + INTERVAL '1 hour', 'active'),
('Football Match Live', 'Football', 'Live football match for testing', 22, 51.1089, 17.0395, 'Wrocław Stadium', 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', NOW() + INTERVAL '2 hours', 'active');

-- Step 5: Add participants to test events
INSERT INTO event_participants (event_id, user_id, joined_at)
SELECT e.id, 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', NOW()
FROM events e
WHERE e.title IN ('Live Basketball Game', 'Football Match Live');

-- Step 6: Create test messages for chat
INSERT INTO event_messages (event_id, user_id, message, created_at)
SELECT e.id, 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', 'Welcome to the live event! Chat is working!', NOW()
FROM events e
WHERE e.title = 'Live Basketball Game';

INSERT INTO event_messages (event_id, user_id, message, created_at)
SELECT e.id, 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', 'This is a test message for real-time chat functionality.', NOW() + INTERVAL '1 minute'
FROM events e
WHERE e.title = 'Live Basketball Game';

-- Step 7: Create a second user for testing with friends
INSERT INTO users (id, email, display_name, favorite_sports, created_at, updated_at) VALUES
('test-user-2', 'friend@example.com', 'Test Friend', '["Basketball", "Football"]', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  favorite_sports = EXCLUDED.favorite_sports,
  updated_at = NOW();

-- Step 8: Add second user as participant
INSERT INTO event_participants (event_id, user_id, joined_at)
SELECT e.id, 'test-user-2', NOW()
FROM events e
WHERE e.title = 'Live Basketball Game'
ON CONFLICT (event_id, user_id) DO NOTHING;

-- Step 9: Create messages from second user
INSERT INTO event_messages (event_id, user_id, message, created_at)
SELECT e.id, 'test-user-2', 'Hello from friend! Chat is working perfectly!', NOW() + INTERVAL '2 minutes'
FROM events e
WHERE e.title = 'Live Basketball Game';

-- Step 10: Verify everything is set up
SELECT 'Real-time enabled for:' as status, 
       CASE WHEN EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'events') 
            THEN 'Events ✅' ELSE 'Events ❌' END as events,
       CASE WHEN EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'event_messages') 
            THEN 'Messages ✅' ELSE 'Messages ❌' END as messages;

SELECT 'Test data created:' as status, 
       (SELECT COUNT(*) FROM events WHERE title LIKE '%Live%') as live_events,
       (SELECT COUNT(*) FROM event_participants) as participants,
       (SELECT COUNT(*) FROM event_messages) as messages,
       (SELECT COUNT(*) FROM users) as users;

SELECT 'Real-time setup complete! Your chat should now work!' as result;

