-- QUICK FIX FOR MISSING TABLES AND RELATIONSHIPS
-- This creates the missing groups table and fixes relationships

-- ============================================
-- 1. CREATE MISSING GROUPS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL,
  is_public BOOLEAN DEFAULT true,
  max_members INTEGER DEFAULT 50,
  members_count INTEGER DEFAULT 1,
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
-- 3. CREATE INDEXES
-- ============================================

-- Groups indexes
CREATE INDEX IF NOT EXISTS idx_groups_created_by ON groups(created_by);
CREATE INDEX IF NOT EXISTS idx_groups_is_public ON groups(is_public);
CREATE INDEX IF NOT EXISTS idx_groups_created_at ON groups(created_at DESC);

-- Events indexes
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);
CREATE INDEX IF NOT EXISTS idx_events_location ON events(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_events_sport_type ON events(sport_type);
CREATE INDEX IF NOT EXISTS idx_events_scheduled_datetime ON events(scheduled_datetime);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at DESC);

-- ============================================
-- 4. ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. CREATE RLS POLICIES
-- ============================================

-- Groups policies
CREATE POLICY "Groups are readable by everyone"
  ON groups FOR SELECT
  USING (true);

CREATE POLICY "Users can create groups"
  ON groups FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group creators can update their groups"
  ON groups FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Group creators can delete their groups"
  ON groups FOR DELETE
  USING (auth.uid() = created_by);

-- ============================================
-- 6. GRANT PERMISSIONS
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
-- 7. CREATE SAMPLE DATA
-- ============================================

-- Create sample groups
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
