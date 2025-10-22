-- Fix events table - Drop foreign key constraint and add columns
-- This will resolve the foreign key constraint issue

-- First, drop the foreign key constraint
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_created_by_fkey;

-- Now add all the missing columns
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

  -- Add created_by column if it doesn't exist (without foreign key constraint)
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

-- Remove creator_id column if it exists (keep created_by)
ALTER TABLE events DROP COLUMN IF EXISTS creator_id CASCADE;

-- Create sample events for testing (using existing user IDs)
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
