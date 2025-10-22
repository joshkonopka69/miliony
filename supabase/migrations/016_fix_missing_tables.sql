-- Fix missing tables and schema cache issues
-- This migration creates all missing tables and fixes schema problems

-- ============================================
-- 1. CREATE MISSING TABLES
-- ============================================

-- Create group_members table
CREATE TABLE IF NOT EXISTS group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL,
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'banned')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- Create consent_settings table
CREATE TABLE IF NOT EXISTS consent_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL,
  analytics_consent BOOLEAN DEFAULT false,
  marketing_consent BOOLEAN DEFAULT false,
  location_consent BOOLEAN DEFAULT false,
  push_notifications_consent BOOLEAN DEFAULT false,
  data_sharing_consent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL,
  language TEXT DEFAULT 'en',
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
  notifications_enabled BOOLEAN DEFAULT true,
  location_sharing_enabled BOOLEAN DEFAULT true,
  profile_visibility TEXT DEFAULT 'public' CHECK (profile_visibility IN ('public', 'friends', 'private')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. ADD MISSING COLUMNS TO EXISTING TABLES
-- ============================================

-- Add missing columns to events table
DO $$
BEGIN
  -- Add title column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'events'
    AND column_name = 'title'
  ) THEN
    ALTER TABLE events ADD COLUMN title TEXT NOT NULL DEFAULT 'Untitled Event';
  END IF;

  -- Add sport_type column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'events'
    AND column_name = 'sport_type'
  ) THEN
    ALTER TABLE events ADD COLUMN sport_type TEXT NOT NULL DEFAULT 'General';
  END IF;

  -- Add description column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'events'
    AND column_name = 'description'
  ) THEN
    ALTER TABLE events ADD COLUMN description TEXT;
  END IF;

  -- Add location_name column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'events'
    AND column_name = 'location_name'
  ) THEN
    ALTER TABLE events ADD COLUMN location_name TEXT;
  END IF;

  -- Add location_address column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'events'
    AND column_name = 'location_address'
  ) THEN
    ALTER TABLE events ADD COLUMN location_address TEXT;
  END IF;

  -- Add latitude column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'events'
    AND column_name = 'latitude'
  ) THEN
    ALTER TABLE events ADD COLUMN latitude DOUBLE PRECISION NOT NULL DEFAULT 0.0;
  END IF;

  -- Add longitude column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'events'
    AND column_name = 'longitude'
  ) THEN
    ALTER TABLE events ADD COLUMN longitude DOUBLE PRECISION NOT NULL DEFAULT 0.0;
  END IF;

  -- Add max_participants column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'events'
    AND column_name = 'max_participants'
  ) THEN
    ALTER TABLE events ADD COLUMN max_participants INTEGER NOT NULL DEFAULT 10;
  END IF;

  -- Add participants_count column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'events'
    AND column_name = 'participants_count'
  ) THEN
    ALTER TABLE events ADD COLUMN participants_count INTEGER NOT NULL DEFAULT 1;
  END IF;

  -- Add status column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'events'
    AND column_name = 'status'
  ) THEN
    ALTER TABLE events ADD COLUMN status TEXT NOT NULL DEFAULT 'active';
  END IF;

  -- Add created_by column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'events'
    AND column_name = 'created_by'
  ) THEN
    ALTER TABLE events ADD COLUMN created_by UUID;
  END IF;

  -- Add scheduled_datetime column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'events'
    AND column_name = 'scheduled_datetime'
  ) THEN
    ALTER TABLE events ADD COLUMN scheduled_datetime TIMESTAMPTZ NOT NULL DEFAULT NOW();
  END IF;

  -- Add created_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'events'
    AND column_name = 'created_at'
  ) THEN
    ALTER TABLE events ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
  END IF;

  -- Add updated_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'events'
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE events ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- ============================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- Events indexes
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);
CREATE INDEX IF NOT EXISTS idx_events_location ON events(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_events_sport_type ON events(sport_type);
CREATE INDEX IF NOT EXISTS idx_events_scheduled_datetime ON events(scheduled_datetime);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at DESC);

-- Group members indexes
CREATE INDEX IF NOT EXISTS idx_group_members_group ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_status ON group_members(status);

-- Consent settings indexes
CREATE INDEX IF NOT EXISTS idx_consent_settings_user ON consent_settings(user_id);

-- User preferences indexes
CREATE INDEX IF NOT EXISTS idx_user_preferences_user ON user_preferences(user_id);

-- ============================================
-- 4. ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. CREATE RLS POLICIES
-- ============================================

-- Group members policies
CREATE POLICY "Group members are readable by everyone"
  ON group_members FOR SELECT
  USING (true);

CREATE POLICY "Users can join groups"
  ON group_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups"
  ON group_members FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Group admins can manage members"
  ON group_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = group_members.group_id
      AND gm.user_id = auth.uid()
      AND gm.role IN ('admin', 'moderator')
    )
  );

-- Consent settings policies
CREATE POLICY "Users can view their own consent settings"
  ON consent_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own consent settings"
  ON consent_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own consent settings"
  ON consent_settings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own consent settings"
  ON consent_settings FOR DELETE
  USING (auth.uid() = user_id);

-- User preferences policies
CREATE POLICY "Users can view their own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own preferences"
  ON user_preferences FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 6. CREATE HELPFUL FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. CREATE TRIGGERS
-- ============================================

-- Update timestamps triggers
CREATE TRIGGER update_group_members_updated_at
  BEFORE UPDATE ON group_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consent_settings_updated_at
  BEFORE UPDATE ON consent_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 8. GRANT PERMISSIONS
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
-- 9. CREATE SAMPLE DATA
-- ============================================

-- Create sample events for testing
INSERT INTO events (title, sport_type, description, max_participants, latitude, longitude, location_name, created_by, scheduled_datetime) VALUES
  ('Basketball Game in Wrocław', 'Basketball', 'Fun basketball game in the city center. All skill levels welcome!', 10, 51.1079, 17.0385, 'Wrocław City Center', 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', NOW() + INTERVAL '2 days'),
  ('Football Match', 'Football', 'Football match at the stadium. Bring your cleats!', 22, 51.1408, 16.9426, 'Stadion Wrocław', 'f6385377-f738-4486-8692-853dd25b08d8', NOW() + INTERVAL '3 days'),
  ('Tennis Tournament', 'Tennis', 'Tennis tournament for all levels. Prizes for winners!', 8, 51.0970, 17.0340, 'Tennis Club Wrocław', 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', NOW() + INTERVAL '5 days')
ON CONFLICT DO NOTHING;

-- Create sample participants
INSERT INTO event_participants (event_id, user_id)
SELECT e.id, 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7'
FROM events e
WHERE e.title = 'Basketball Game in Wrocław'
ON CONFLICT DO NOTHING;

INSERT INTO event_participants (event_id, user_id)
SELECT e.id, 'f6385377-f738-4486-8692-853dd25b08d8'
FROM events e
WHERE e.title = 'Football Match'
ON CONFLICT DO NOTHING;

-- Create sample messages
INSERT INTO event_messages (event_id, user_id, message)
SELECT e.id, 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', 'Welcome to the first SportMap event! 🎉'
FROM events e
WHERE e.title = 'Basketball Game in Wrocław'
ON CONFLICT DO NOTHING;

INSERT INTO event_messages (event_id, user_id, message)
SELECT e.id, 'f6385377-f738-4486-8692-853dd25b08d8', 'Looking forward to the match! ⚽'
FROM events e
WHERE e.title = 'Football Match'
ON CONFLICT DO NOTHING;
