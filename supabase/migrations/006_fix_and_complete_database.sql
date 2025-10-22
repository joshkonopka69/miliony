-- SPORTMAP DATABASE FIXES AND COMPLETION
-- Fixes issues and adds missing functionality

-- ============================================
-- 1. FIX EVENTS TABLE ISSUES
-- ============================================

-- First, drop existing policies that depend on creator_id
DROP POLICY IF EXISTS "Creators can update own events" ON events;
DROP POLICY IF EXISTS "Creators can delete own events" ON events;
DROP POLICY IF EXISTS "Users can update own events" ON events;
DROP POLICY IF EXISTS "Users can delete own events" ON events;
DROP POLICY IF EXISTS "Users can create events" ON events;
DROP POLICY IF EXISTS "Events are readable by everyone" ON events;

-- Drop any triggers that might depend on creator_id
DROP TRIGGER IF EXISTS sync_creator_fields_trigger ON events;
DROP TRIGGER IF EXISTS sync_creator_trigger ON events;

-- Drop the sync function if it exists (with CASCADE to handle dependencies)
DROP FUNCTION IF EXISTS sync_creator_fields() CASCADE;

-- Remove duplicate creator_id column (keep created_by)
ALTER TABLE events DROP COLUMN IF EXISTS creator_id;

-- Add missing description column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'events' 
    AND column_name = 'description'
  ) THEN
    ALTER TABLE events ADD COLUMN description TEXT;
  END IF;
END $$;

-- ============================================
-- 2. RENAME CHAT TABLE TO MATCH BACKEND
-- ============================================

-- Rename event_chat_messages to event_messages
ALTER TABLE event_chat_messages RENAME TO event_messages;

-- ============================================
-- 3. ADD MISSING NOTIFICATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'general',
  data JSONB DEFAULT '{}'::jsonb,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  CONSTRAINT notifications_type_check CHECK (type IN ('event_invite', 'friend_request', 'event_update', 'event_reminder', 'event_cancelled', 'event_updated', 'general'))
);

-- ============================================
-- 4. ADD MISSING PRIVACY SETTINGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS privacy_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  
  -- Basic Privacy Settings
  profile_visibility TEXT DEFAULT 'public' CHECK (profile_visibility IN ('public', 'friends', 'private')),
  show_location BOOLEAN DEFAULT true,
  show_activity BOOLEAN DEFAULT true,
  show_friends BOOLEAN DEFAULT true,
  show_online_status BOOLEAN DEFAULT true,
  
  -- Interaction Settings
  allow_friend_requests BOOLEAN DEFAULT true,
  allow_event_invites BOOLEAN DEFAULT true,
  allow_messages BOOLEAN DEFAULT true,
  
  -- Personal Info Settings
  show_birthday BOOLEAN DEFAULT false,
  show_phone BOOLEAN DEFAULT false,
  show_email BOOLEAN DEFAULT false,
  
  -- Data Sharing Settings (JSON)
  data_sharing JSONB DEFAULT '{
    "analytics": true,
    "marketing": false,
    "third_party": false,
    "location_tracking": true
  }'::jsonb,
  
  -- Search Visibility Settings (JSON)
  search_visibility JSONB DEFAULT '{
    "searchable_by_name": true,
    "searchable_by_email": false,
    "searchable_by_phone": false,
    "appear_in_suggestions": true
  }'::jsonb,
  
  -- Activity Privacy Settings (JSON)
  activity_privacy JSONB DEFAULT '{
    "show_events_created": true,
    "show_events_joined": true,
    "show_friend_activity": true,
    "show_profile_views": false
  }'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 5. CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- Events indexes
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);
CREATE INDEX IF NOT EXISTS idx_events_location ON events(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_events_sport_type ON events(sport_type);
CREATE INDEX IF NOT EXISTS idx_events_scheduled_datetime ON events(scheduled_datetime);

-- Event participants indexes
CREATE INDEX IF NOT EXISTS idx_event_participants_event ON event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_user ON event_participants(user_id);

-- Event messages indexes
CREATE INDEX IF NOT EXISTS idx_event_messages_event ON event_messages(event_id);
CREATE INDEX IF NOT EXISTS idx_event_messages_user ON event_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_event_messages_created_at ON event_messages(created_at);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, read) WHERE read = FALSE;

-- Privacy settings indexes
CREATE INDEX IF NOT EXISTS idx_privacy_settings_user_id ON privacy_settings(user_id);

-- ============================================
-- 6. ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE privacy_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 7. CREATE RLS POLICIES
-- ============================================

-- Notifications policies
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- Privacy settings policies
DROP POLICY IF EXISTS "Users can view their own privacy settings" ON privacy_settings;
DROP POLICY IF EXISTS "Users can insert their own privacy settings" ON privacy_settings;
DROP POLICY IF EXISTS "Users can update their own privacy settings" ON privacy_settings;
DROP POLICY IF EXISTS "Users can delete their own privacy settings" ON privacy_settings;

CREATE POLICY "Users can view their own privacy settings"
  ON privacy_settings FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own privacy settings"
  ON privacy_settings FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own privacy settings"
  ON privacy_settings FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own privacy settings"
  ON privacy_settings FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- 8. CREATE RLS POLICIES FOR EVENTS
-- ============================================

-- Create policies for events (using created_by)
CREATE POLICY "Events are readable by everyone" ON events FOR SELECT USING (true);
CREATE POLICY "Users can create events" ON events FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update own events" ON events FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete own events" ON events FOR DELETE USING (auth.uid() = created_by);

-- ============================================
-- 9. CREATE TRIGGERS FOR REAL-TIME UPDATES
-- ============================================

-- Function for real-time notifications
CREATE OR REPLACE FUNCTION notify_event_changes()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify('event_changes', json_build_object(
    'table', TG_TABLE_NAME,
    'action', TG_OP,
    'id', COALESCE(NEW.id, OLD.id)
  )::text);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers for real-time updates
DROP TRIGGER IF EXISTS events_changes_trigger ON events;
CREATE TRIGGER events_changes_trigger
  AFTER INSERT OR UPDATE OR DELETE ON events
  FOR EACH ROW EXECUTE FUNCTION notify_event_changes();

DROP TRIGGER IF EXISTS event_participants_changes_trigger ON event_participants;
CREATE TRIGGER event_participants_changes_trigger
  AFTER INSERT OR UPDATE OR DELETE ON event_participants
  FOR EACH ROW EXECUTE FUNCTION notify_event_changes();

DROP TRIGGER IF EXISTS event_messages_changes_trigger ON event_messages;
CREATE TRIGGER event_messages_changes_trigger
  AFTER INSERT OR UPDATE OR DELETE ON event_messages
  FOR EACH ROW EXECUTE FUNCTION notify_event_changes();

-- ============================================
-- 10. CREATE HELPFUL VIEWS
-- ============================================

-- Event details with participant count
CREATE OR REPLACE VIEW event_details AS
SELECT 
  e.*,
  COUNT(ep.user_id) as actual_participants_count,
  array_agg(ep.user_id) as participant_ids
FROM events e
LEFT JOIN event_participants ep ON e.id = ep.event_id
GROUP BY e.id;

-- ============================================
-- 11. GRANT PERMISSIONS
-- ============================================

GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================
-- 12. INSERT SAMPLE DATA FOR TESTING
-- ============================================

-- Sample events (Wrocław coordinates)
INSERT INTO events (title, sport_type, description, max_participants, latitude, longitude, location_name, created_by) VALUES
  ('Basketball Game in Wrocław', 'Basketball', 'Fun basketball game in the city center', 10, 51.1079, 17.0385, 'Wrocław City Center', '00000000-0000-0000-0000-000000000001'),
  ('Football Match', 'Football', 'Football match at the stadium', 22, 51.1408, 16.9426, 'Stadion Wrocław', '00000000-0000-0000-0000-000000000002'),
  ('Tennis Tournament', 'Tennis', 'Tennis tournament for all levels', 8, 51.0970, 17.0340, 'Tennis Club Wrocław', '00000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

-- Sample participants
INSERT INTO event_participants (event_id, user_id) 
SELECT e.id, '00000000-0000-0000-0000-000000000001'
FROM events e 
WHERE e.title = 'Basketball Game in Wrocław'
ON CONFLICT DO NOTHING;

-- Sample messages
INSERT INTO event_messages (event_id, user_id, message)
SELECT e.id, '00000000-0000-0000-0000-000000000001', 'Welcome to the first SportMap event! 🎉'
FROM events e 
WHERE e.title = 'Basketball Game in Wrocław'
ON CONFLICT DO NOTHING;

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

-- This migration:
-- ✅ Fixed duplicate creator columns in events table
-- ✅ Added missing description column
-- ✅ Renamed event_chat_messages to event_messages
-- ✅ Added notifications table
-- ✅ Added privacy_settings table
-- ✅ Created all necessary indexes
-- ✅ Set up RLS policies
-- ✅ Added real-time triggers
-- ✅ Created helpful views
-- ✅ Added sample data for testing
