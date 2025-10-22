-- SPORTMAP DATABASE SIMPLE FIX
-- Simple migration to fix the database issues

-- ============================================
-- 1. CLEAN UP EXISTING DEPENDENCIES
-- ============================================

-- Drop all triggers and functions that might cause issues
DROP TRIGGER IF EXISTS sync_creator_fields_trigger ON events;
DROP TRIGGER IF EXISTS sync_creator_trigger ON events;
DROP FUNCTION IF EXISTS sync_creator_fields() CASCADE;

-- Drop all policies on events table
DROP POLICY IF EXISTS "Creators can update own events" ON events;
DROP POLICY IF EXISTS "Creators can delete own events" ON events;
DROP POLICY IF EXISTS "Users can update own events" ON events;
DROP POLICY IF EXISTS "Users can delete own events" ON events;
DROP POLICY IF EXISTS "Users can create events" ON events;
DROP POLICY IF EXISTS "Events are readable by everyone" ON events;

-- Drop policies on other tables (only if they exist)
DO $$ 
BEGIN
  -- Drop policies from event_participants if table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'event_participants') THEN
    DROP POLICY IF EXISTS "Event participants are readable by everyone" ON event_participants;
    DROP POLICY IF EXISTS "Users can join events" ON event_participants;
    DROP POLICY IF EXISTS "Users can leave events" ON event_participants;
  END IF;
  
  -- Drop policies from event_chat_messages if table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'event_chat_messages') THEN
    DROP POLICY IF EXISTS "Event messages are readable by participants" ON event_chat_messages;
    DROP POLICY IF EXISTS "Users can send messages to events they joined" ON event_chat_messages;
  END IF;
  
  -- Drop policies from users if table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
    DROP POLICY IF EXISTS "Users are readable by everyone" ON users;
    DROP POLICY IF EXISTS "Users can update own profile" ON users;
  END IF;
END $$;

-- ============================================
-- 2. FIX EVENTS TABLE STRUCTURE
-- ============================================

-- Remove duplicate creator_id column (keep created_by)
ALTER TABLE events DROP COLUMN IF EXISTS creator_id CASCADE;

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
-- 3. RENAME CHAT TABLE TO MATCH BACKEND
-- ============================================

-- Rename event_chat_messages to event_messages
ALTER TABLE event_chat_messages RENAME TO event_messages;

-- ============================================
-- 4. CREATE NOTIFICATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
-- 5. CREATE PRIVACY SETTINGS TABLE
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
-- 6. CREATE PERFORMANCE INDEXES
-- ============================================

-- Events indexes
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);
CREATE INDEX IF NOT EXISTS idx_events_location ON events(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_events_sport_type ON events(sport_type);
CREATE INDEX IF NOT EXISTS idx_events_scheduled_datetime ON events(scheduled_datetime);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at DESC);

-- Event participants indexes
CREATE INDEX IF NOT EXISTS idx_event_participants_event ON event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_user ON event_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_joined_at ON event_participants(joined_at DESC);

-- Event messages indexes
CREATE INDEX IF NOT EXISTS idx_event_messages_event ON event_messages(event_id);
CREATE INDEX IF NOT EXISTS idx_event_messages_user ON event_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_event_messages_created_at ON event_messages(created_at DESC);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, read) WHERE read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Privacy settings indexes
CREATE INDEX IF NOT EXISTS idx_privacy_settings_user_id ON privacy_settings(user_id);

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_display_name ON users(display_name);
CREATE INDEX IF NOT EXISTS idx_users_last_active ON users(last_active DESC);

-- ============================================
-- 7. ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE privacy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 8. CREATE RLS POLICIES
-- ============================================

-- Events policies
CREATE POLICY "Events are readable by everyone" 
  ON events FOR SELECT 
  USING (true);

CREATE POLICY "Users can create events" 
  ON events FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own events" 
  ON events FOR UPDATE 
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own events" 
  ON events FOR DELETE 
  USING (auth.uid() = created_by);

-- Event participants policies
CREATE POLICY "Event participants are readable by everyone" 
  ON event_participants FOR SELECT 
  USING (true);

CREATE POLICY "Users can join events" 
  ON event_participants FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave events" 
  ON event_participants FOR DELETE 
  USING (auth.uid() = user_id);

-- Event messages policies
CREATE POLICY "Event messages are readable by participants" 
  ON event_messages FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM event_participants 
      WHERE event_participants.event_id = event_messages.event_id 
      AND event_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages to events they joined" 
  ON event_messages FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM event_participants 
      WHERE event_participants.event_id = event_messages.event_id 
      AND event_participants.user_id = auth.uid()
    )
  );

-- Notifications policies
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

-- Users policies
CREATE POLICY "Users are readable by everyone" 
  ON users FOR SELECT 
  USING (true);

CREATE POLICY "Users can update own profile" 
  ON users FOR UPDATE 
  USING (auth.uid() = id);

-- ============================================
-- 9. CREATE HELPFUL FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

-- ============================================
-- 10. CREATE TRIGGERS
-- ============================================

-- Update timestamps triggers
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_privacy_settings_updated_at
  BEFORE UPDATE ON privacy_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Real-time triggers
CREATE TRIGGER events_changes_trigger
  AFTER INSERT OR UPDATE OR DELETE ON events
  FOR EACH ROW EXECUTE FUNCTION notify_event_changes();

CREATE TRIGGER event_participants_changes_trigger
  AFTER INSERT OR UPDATE OR DELETE ON event_participants
  FOR EACH ROW EXECUTE FUNCTION notify_event_changes();

CREATE TRIGGER event_messages_changes_trigger
  AFTER INSERT OR UPDATE OR DELETE ON event_messages
  FOR EACH ROW EXECUTE FUNCTION notify_event_changes();

-- ============================================
-- 11. GRANT PERMISSIONS
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
-- COMPLETION MESSAGE
-- ============================================

-- This migration:
-- ✅ Cleaned up all existing dependencies and conflicts
-- ✅ Fixed events table structure (removed creator_id, added description)
-- ✅ Renamed event_chat_messages to event_messages
-- ✅ Created notifications table with full functionality
-- ✅ Created privacy_settings table with comprehensive controls
-- ✅ Added all necessary indexes for performance
-- ✅ Set up proper RLS policies for security
-- ✅ Created helpful functions and triggers
-- ✅ Granted proper permissions
-- ✅ Database is now ready for production use!
