-- FINAL FIX FOR FOREIGN KEY RELATIONSHIPS AND SCHEMA CACHE
-- This creates all missing foreign key relationships

-- ============================================
-- 1. CREATE FOREIGN KEY RELATIONSHIPS
-- ============================================

-- Add foreign key from events to users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'events_created_by_fkey'
    AND table_name = 'events'
  ) THEN
    ALTER TABLE events ADD CONSTRAINT events_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add foreign key from group_members to groups
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'group_members_group_id_fkey'
    AND table_name = 'group_members'
  ) THEN
    ALTER TABLE group_members ADD CONSTRAINT group_members_group_id_fkey 
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add foreign key from group_members to users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'group_members_user_id_fkey'
    AND table_name = 'group_members'
  ) THEN
    ALTER TABLE group_members ADD CONSTRAINT group_members_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add foreign key from groups to users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'groups_created_by_fkey'
    AND table_name = 'groups'
  ) THEN
    ALTER TABLE groups ADD CONSTRAINT groups_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add foreign key from event_participants to events
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'event_participants_event_id_fkey'
    AND table_name = 'event_participants'
  ) THEN
    ALTER TABLE event_participants ADD CONSTRAINT event_participants_event_id_fkey 
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add foreign key from event_participants to users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'event_participants_user_id_fkey'
    AND table_name = 'event_participants'
  ) THEN
    ALTER TABLE event_participants ADD CONSTRAINT event_participants_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add foreign key from event_messages to events
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'event_messages_event_id_fkey'
    AND table_name = 'event_messages'
  ) THEN
    ALTER TABLE event_messages ADD CONSTRAINT event_messages_event_id_fkey 
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add foreign key from event_messages to users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'event_messages_user_id_fkey'
    AND table_name = 'event_messages'
  ) THEN
    ALTER TABLE event_messages ADD CONSTRAINT event_messages_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add foreign key from notifications to users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'notifications_user_id_fkey'
    AND table_name = 'notifications'
  ) THEN
    ALTER TABLE notifications ADD CONSTRAINT notifications_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add foreign key from privacy_settings to users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'privacy_settings_user_id_fkey'
    AND table_name = 'privacy_settings'
  ) THEN
    ALTER TABLE privacy_settings ADD CONSTRAINT privacy_settings_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add foreign key from consent_settings to users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'consent_settings_user_id_fkey'
    AND table_name = 'consent_settings'
  ) THEN
    ALTER TABLE consent_settings ADD CONSTRAINT consent_settings_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add foreign key from user_preferences to users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'user_preferences_user_id_fkey'
    AND table_name = 'user_preferences'
  ) THEN
    ALTER TABLE user_preferences ADD CONSTRAINT user_preferences_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ============================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- Foreign key indexes
CREATE INDEX IF NOT EXISTS idx_events_created_by_fkey ON events(created_by);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id_fkey ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id_fkey ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_groups_created_by_fkey ON groups(created_by);
CREATE INDEX IF NOT EXISTS idx_event_participants_event_id_fkey ON event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_user_id_fkey ON event_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_event_messages_event_id_fkey ON event_messages(event_id);
CREATE INDEX IF NOT EXISTS idx_event_messages_user_id_fkey ON event_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_fkey ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_privacy_settings_user_id_fkey ON privacy_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_consent_settings_user_id_fkey ON consent_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id_fkey ON user_preferences(user_id);

-- ============================================
-- 3. GRANT PERMISSIONS
-- ============================================

GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- ============================================
-- 4. CREATE SAMPLE DATA WITH PROPER RELATIONSHIPS
-- ============================================

-- Create sample groups first
INSERT INTO groups (name, description, created_by, is_public, max_members) VALUES
  ('Basketball Enthusiasts', 'Group for basketball lovers in Wrocław', 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', true, 20),
  ('Football Players', 'Local football team and fans', 'f6385377-f738-4486-8692-853dd25b08d8', true, 25)
ON CONFLICT DO NOTHING;

-- Create sample events
INSERT INTO events (title, sport_type, description, max_participants, latitude, longitude, location_name, created_by, scheduled_datetime) VALUES
  ('Basketball Game in Wrocław', 'Basketball', 'Fun basketball game in the city center. All skill levels welcome!', 10, 51.1079, 17.0385, 'Wrocław City Center', 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', NOW() + INTERVAL '2 days'),
  ('Football Match', 'Football', 'Football match at the stadium. Bring your cleats!', 22, 51.1408, 16.9426, 'Stadion Wrocław', 'f6385377-f738-4486-8692-853dd25b08d8', NOW() + INTERVAL '3 days'),
  ('Tennis Tournament', 'Tennis', 'Tennis tournament for all levels. Prizes for winners!', 8, 51.0970, 17.0340, 'Tennis Club Wrocław', 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', NOW() + INTERVAL '5 days')
ON CONFLICT DO NOTHING;

-- Create sample group members
INSERT INTO group_members (group_id, user_id, role)
SELECT groups.id, 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', 'admin'
FROM groups
WHERE groups.name = 'Basketball Enthusiasts'
ON CONFLICT DO NOTHING;

INSERT INTO group_members (group_id, user_id, role)
SELECT groups.id, 'f6385377-f738-4486-8692-853dd25b08d8', 'admin'
FROM groups
WHERE groups.name = 'Football Players'
ON CONFLICT DO NOTHING;

-- Create sample event participants
INSERT INTO event_participants (event_id, user_id)
SELECT events.id, 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7'
FROM events
WHERE events.title = 'Basketball Game in Wrocław'
ON CONFLICT DO NOTHING;

INSERT INTO event_participants (event_id, user_id)
SELECT events.id, 'f6385377-f738-4486-8692-853dd25b08d8'
FROM events
WHERE events.title = 'Football Match'
ON CONFLICT DO NOTHING;

-- Create sample messages
INSERT INTO event_messages (event_id, user_id, message)
SELECT events.id, 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', 'Welcome to the first SportMap event! 🎉'
FROM events
WHERE events.title = 'Basketball Game in Wrocław'
ON CONFLICT DO NOTHING;

INSERT INTO event_messages (event_id, user_id, message)
SELECT events.id, 'f6385377-f738-4486-8692-853dd25b08d8', 'Looking forward to the match! ⚽'
FROM events
WHERE events.title = 'Football Match'
ON CONFLICT DO NOTHING;

