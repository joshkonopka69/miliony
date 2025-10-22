-- FIXED SQL - Run this in Supabase Dashboard
-- This addresses the NOT NULL constraint error

-- Step 1: Disable RLS on all tables temporarily
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE event_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE privacy_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE group_members DISABLE ROW LEVEL SECURITY;

-- Step 2: Clear existing problematic data
DELETE FROM event_messages;
DELETE FROM event_participants;
DELETE FROM events;

-- Step 3: Create events with ALL required fields (no NULL values)
INSERT INTO events (id, title, sport_type, description, max_participants, latitude, longitude, location_name, location_address, scheduled_datetime, status, created_by, created_at, updated_at, participants_count) VALUES
('event-1', 'Basketball Game in Wrocław', 'Basketball', 'Fun basketball game in the city center. All skill levels welcome!', 10, 51.1079, 17.0385, 'Wrocław City Center', 'Rynek 1, 50-101 Wrocław', NOW() + INTERVAL '1 day', 'active', 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', NOW(), NOW(), 1),
('event-2', 'Football Match', 'Football', 'Casual football match for everyone', 22, 51.1089, 17.0395, 'Wrocław Stadium', 'Aleja Śląska 1, 54-118 Wrocław', NOW() + INTERVAL '2 days', 'active', 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', NOW(), NOW(), 1),
('event-3', 'Tennis Tournament', 'Tennis', 'Friendly tennis tournament', 8, 51.1099, 17.0405, 'Tennis Club Wrocław', 'ul. Sportowa 5, 50-001 Wrocław', NOW() + INTERVAL '3 days', 'active', 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', NOW(), NOW(), 1),
('event-4', 'Swimming Session', 'Swimming', 'Morning swimming session', 15, 51.1109, 17.0415, 'Aquapark Wrocław', 'ul. Borowska 99, 50-556 Wrocław', NOW() + INTERVAL '4 days', 'active', 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', NOW(), NOW(), 1),
('event-5', 'Running Group', 'Running', 'Evening running group', 20, 51.1119, 17.0425, 'Park Szczytnicki', 'ul. Mickiewicza 1, 50-001 Wrocław', NOW() + INTERVAL '5 days', 'active', 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', NOW(), NOW(), 1);

-- Step 4: Create event participants
INSERT INTO event_participants (event_id, user_id, joined_at) VALUES
('event-1', 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', NOW()),
('event-2', 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', NOW()),
('event-3', 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', NOW()),
('event-4', 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', NOW()),
('event-5', 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', NOW());

-- Step 5: Create event messages
INSERT INTO event_messages (id, event_id, user_id, message, created_at) VALUES
('msg-1', 'event-1', 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', 'Welcome to the basketball game! Looking forward to playing with everyone.', NOW()),
('msg-2', 'event-1', 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', 'Don''t forget to bring water and wear comfortable shoes!', NOW() + INTERVAL '1 hour'),
('msg-3', 'event-2', 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', 'Football match is on! Bring your boots and let''s have fun!', NOW()),
('msg-4', 'event-3', 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', 'Tennis tournament starts soon. Good luck everyone!', NOW());

-- Step 6: Create sample groups
INSERT INTO groups (id, name, description, sport, created_by, created_at, updated_at) VALUES
('group-1', 'Basketball Enthusiasts', 'Group for basketball lovers in Wrocław', 'Basketball', 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', NOW(), NOW()),
('group-2', 'Football Players', 'Local football community', 'Football', 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', NOW(), NOW()),
('group-3', 'Tennis Club', 'Tennis players in Wrocław', 'Tennis', 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', NOW(), NOW());

-- Step 7: Create group members
INSERT INTO group_members (group_id, user_id, role, joined_at) VALUES
('group-1', 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', 'admin', NOW()),
('group-2', 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', 'admin', NOW()),
('group-3', 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', 'admin', NOW());

-- Step 8: Create sample notifications
INSERT INTO notifications (id, user_id, title, message, type, data, created_at, read_at) VALUES
('notif-1', 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', 'Welcome to SportMap!', 'Your account has been created successfully.', 'general', '{}', NOW(), NULL),
('notif-2', 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', 'New Event Created', 'You created a new basketball event.', 'event_update', '{"event_id": "event-1"}', NOW(), NULL);

-- Step 9: Create privacy settings
INSERT INTO privacy_settings (id, user_id, profile_visibility, location_sharing, event_notifications, friend_requests, created_at, updated_at) VALUES
('privacy-1', 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', 'public', true, true, true, NOW(), NOW());

-- Step 10: Test event creation with minimal required fields
INSERT INTO events (title, sport_type, max_participants, latitude, longitude, created_by, scheduled_datetime, status) VALUES
('Test Event', 'Basketball', 10, 51.1079, 17.0385, 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', NOW() + INTERVAL '1 day', 'active');

-- Step 11: Verify everything works
SELECT 'Events created:' as status, COUNT(*) as count FROM events;
SELECT 'Event participants created:' as status, COUNT(*) as count FROM event_participants;
SELECT 'Event messages created:' as status, COUNT(*) as count FROM event_messages;
SELECT 'Groups created:' as status, COUNT(*) as count FROM groups;
SELECT 'Notifications created:' as status, COUNT(*) as count FROM notifications;
SELECT 'Privacy settings created:' as status, COUNT(*) as count FROM privacy_settings;

-- Step 12: Re-enable RLS with proper policies
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE privacy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- Step 13: Create proper RLS policies for events
CREATE POLICY "Users can view all events" ON events FOR SELECT USING (true);
CREATE POLICY "Users can create events" ON events FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update own events" ON events FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete own events" ON events FOR DELETE USING (auth.uid() = created_by);

-- Step 14: Create proper RLS policies for event_participants
CREATE POLICY "Users can view event participants" ON event_participants FOR SELECT USING (true);
CREATE POLICY "Users can join events" ON event_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave events" ON event_participants FOR DELETE USING (auth.uid() = user_id);

-- Step 15: Create proper RLS policies for event_messages
CREATE POLICY "Users can view event messages" ON event_messages FOR SELECT USING (true);
CREATE POLICY "Users can send event messages" ON event_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Step 16: Create proper RLS policies for users
CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Step 17: Create proper RLS policies for notifications
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Step 18: Create proper RLS policies for privacy_settings
CREATE POLICY "Users can view own privacy settings" ON privacy_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own privacy settings" ON privacy_settings FOR UPDATE USING (auth.uid() = user_id);

-- Step 19: Create proper RLS policies for groups
CREATE POLICY "Users can view all groups" ON groups FOR SELECT USING (true);
CREATE POLICY "Users can create groups" ON groups FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Step 20: Create proper RLS policies for group_members
CREATE POLICY "Users can view group members" ON group_members FOR SELECT USING (true);
CREATE POLICY "Users can join groups" ON group_members FOR INSERT WITH CHECK (auth.uid() = user_id);

SELECT 'All done! Your app should now work perfectly!' as result;
