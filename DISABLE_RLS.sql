-- SIMPLE RLS DISABLE - Run this first if you just want to disable RLS temporarily

-- Disable RLS on all tables
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE event_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE privacy_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE group_members DISABLE ROW LEVEL SECURITY;

-- Create a test event to verify it works
INSERT INTO events (title, sport_type, description, max_participants, latitude, longitude, location_name, created_by, scheduled_datetime, status) VALUES
('Test Event - RLS Disabled', 'Basketball', 'Test event with RLS disabled', 10, 51.1079, 17.0385, 'Test Location', 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', NOW() + INTERVAL '1 day', 'active');

SELECT 'RLS disabled and test event created!' as result;
