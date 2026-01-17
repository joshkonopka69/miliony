-- Copy and paste this into the Supabase SQL Editor

-- Migration 021: Security Hardening (RLS & Data Protection)
-- ============================================

-- 0. PRE-REQUISITE: Ensure columns exist
DO $$
BEGIN
    -- users table columns
    ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS badges TEXT[] DEFAULT '{}';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS location_latitude FLOAT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS location_longitude FLOAT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active TIMESTAMP WITH TIME ZONE;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS favorite_sports TEXT[] DEFAULT '{}';


    -- notifications table columns (Ensure user_id exists!)
    -- If table does not exist, create it (simplified)
    CREATE TABLE IF NOT EXISTS public.notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        type TEXT DEFAULT 'general',
        data JSONB DEFAULT '{}'::jsonb,
        read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
    );

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'user_id') THEN
        ALTER TABLE notifications ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;


    -- event_messages table columns (Ensure user_id exists!)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'event_messages' AND column_name = 'user_id') THEN
        ALTER TABLE event_messages ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;

EXCEPTION
    WHEN duplicate_column THEN RAISE NOTICE 'Column already exists, skipping';
END $$;

-- 1. PROTECT USER DATA: Create public_profiles VIEW
CREATE OR REPLACE VIEW public_profiles AS
SELECT 
  id,
  display_name,
  avatar_url,
  bio,
  created_at,
  last_active,
  is_verified,
  badges,
  favorite_sports,
  location_latitude,
  location_longitude
FROM users
WHERE is_public = true;

GRANT SELECT ON public_profiles TO authenticated;
GRANT SELECT ON public_profiles TO anon;

-- 2. HARDEN USERS TABLE RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop ALL potential existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users are readable by everyone" ON users;
DROP POLICY IF EXISTS "users_select_all" ON users;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON users;
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "allow_read_all_profiles" ON users;
DROP POLICY IF EXISTS "Users can view own private data" ON users;
DROP POLICY IF EXISTS "Users can create own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

CREATE POLICY "Users can view own private data" 
ON users FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

CREATE POLICY "Users can create own profile" 
ON users FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON users FOR UPDATE 
TO authenticated 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 3. HARDEN EVENTS TABLE RLS
-- Drop ALL potential existing policies
DROP POLICY IF EXISTS "Allow all operations on events" ON events;
DROP POLICY IF EXISTS "Events are readable by everyone" ON events;
DROP POLICY IF EXISTS "Users can create events" ON events;
DROP POLICY IF EXISTS "Users can update own events" ON events;
DROP POLICY IF EXISTS "Users can delete own events" ON events;
DROP POLICY IF EXISTS "Creators can update own events" ON events;
DROP POLICY IF EXISTS "Creators can delete own events" ON events;

CREATE POLICY "Events are readable by everyone" 
ON events FOR SELECT 
USING (true);

CREATE POLICY "Users can create events" 
ON events FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can update own events" 
ON events FOR UPDATE 
TO authenticated 
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can delete own events" 
ON events FOR DELETE 
TO authenticated 
USING (auth.uid() = created_by);

-- 4. HARDEN MESSAGES TABLE RLS
ALTER TABLE event_messages ENABLE ROW LEVEL SECURITY;
-- Drop ALL potential existing policies
DROP POLICY IF EXISTS "Allow all operations on event_messages" ON event_messages;
DROP POLICY IF EXISTS "Event messages are readable by participants" ON event_messages;
DROP POLICY IF EXISTS "Users can send messages" ON event_messages;
DROP POLICY IF EXISTS "Users can send messages to events they joined" ON event_messages;
DROP POLICY IF EXISTS "Authenticated users can read messages" ON event_messages;
DROP POLICY IF EXISTS "Users can send messages as themselves" ON event_messages;
DROP POLICY IF EXISTS "Users can edit own messages" ON event_messages;
DROP POLICY IF EXISTS "Users can delete own messages" ON event_messages;

CREATE POLICY "Authenticated users can read messages" 
ON event_messages FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Users can send messages as themselves" 
ON event_messages FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can edit own messages" 
ON event_messages FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own messages" 
ON event_messages FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- 5. SECURE NOTIFICATIONS (RPC Only)
-- Drop ALL potential existing policies
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;

REVOKE INSERT ON notifications FROM authenticated;
REVOKE INSERT ON notifications FROM anon;

CREATE POLICY "Users can view own notifications" 
ON notifications FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" 
ON notifications FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION send_notification(
  recipient_id UUID,
  title TEXT,
  body TEXT,
  type TEXT DEFAULT 'general',
  payload JSONB DEFAULT '{}'::jsonb
) 
RETURNS UUID 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
DECLARE
  new_notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, title, body, type, data, read)
  VALUES (recipient_id, title, body, type, payload, false)
  RETURNING id INTO new_notification_id;

  RETURN new_notification_id;
END;
$$;
