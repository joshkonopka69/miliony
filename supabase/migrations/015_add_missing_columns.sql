-- Add missing columns to events table
-- This migration adds the columns that should exist but aren't being recognized

-- First, drop any existing policies that might conflict
DROP POLICY IF EXISTS "Users can send messages" ON event_messages;
DROP POLICY IF EXISTS "Event messages are readable by participants" ON event_messages;
DROP POLICY IF EXISTS "Users can send messages to events they joined" ON event_messages;

-- Add title column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'events'
    AND column_name = 'title'
  ) THEN
    ALTER TABLE events ADD COLUMN title TEXT NOT NULL DEFAULT 'Untitled Event';
  END IF;
END $$;

-- Add sport_type column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'events'
    AND column_name = 'sport_type'
  ) THEN
    ALTER TABLE events ADD COLUMN sport_type TEXT NOT NULL DEFAULT 'General';
  END IF;
END $$;

-- Add description column if it doesn't exist
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

-- Add location_name column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'events'
    AND column_name = 'location_name'
  ) THEN
    ALTER TABLE events ADD COLUMN location_name TEXT;
  END IF;
END $$;

-- Add location_address column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'events'
    AND column_name = 'location_address'
  ) THEN
    ALTER TABLE events ADD COLUMN location_address TEXT;
  END IF;
END $$;

-- Add latitude column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'events'
    AND column_name = 'latitude'
  ) THEN
    ALTER TABLE events ADD COLUMN latitude DOUBLE PRECISION NOT NULL DEFAULT 0.0;
  END IF;
END $$;

-- Add longitude column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'events'
    AND column_name = 'longitude'
  ) THEN
    ALTER TABLE events ADD COLUMN longitude DOUBLE PRECISION NOT NULL DEFAULT 0.0;
  END IF;
END $$;

-- Add max_participants column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'events'
    AND column_name = 'max_participants'
  ) THEN
    ALTER TABLE events ADD COLUMN max_participants INTEGER NOT NULL DEFAULT 10;
  END IF;
END $$;

-- Add participants_count column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'events'
    AND column_name = 'participants_count'
  ) THEN
    ALTER TABLE events ADD COLUMN participants_count INTEGER NOT NULL DEFAULT 1;
  END IF;
END $$;

-- Add status column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'events'
    AND column_name = 'status'
  ) THEN
    ALTER TABLE events ADD COLUMN status TEXT NOT NULL DEFAULT 'active';
  END IF;
END $$;

-- Add created_by column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'events'
    AND column_name = 'created_by'
  ) THEN
    ALTER TABLE events ADD COLUMN created_by UUID;
  END IF;
END $$;

-- Add scheduled_datetime column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'events'
    AND column_name = 'scheduled_datetime'
  ) THEN
    ALTER TABLE events ADD COLUMN scheduled_datetime TIMESTAMPTZ NOT NULL DEFAULT NOW();
  END IF;
END $$;

-- Add created_at column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'events'
    AND column_name = 'created_at'
  ) THEN
    ALTER TABLE events ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Add updated_at column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'events'
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE events ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Recreate the policies for event_messages
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

-- Create sample event to test
INSERT INTO events (title, sport_type, description, max_participants, latitude, longitude, location_name, created_by, scheduled_datetime) VALUES
  ('Test Basketball Game', 'Basketball', 'Test event to verify database structure', 10, 51.1079, 17.0385, 'Test Location', 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', NOW() + INTERVAL '1 day')
ON CONFLICT DO NOTHING;
