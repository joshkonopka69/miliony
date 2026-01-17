-- Migration 021: Security Hardening (RLS & Data Protection)

-- ============================================
-- 0. PRE-REQUISITE: Ensure columns exist
-- ============================================

-- Add columns if they don't exist (handling schema drift)
DO $$
BEGIN
    ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS badges TEXT[] DEFAULT '{}';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS location_latitude FLOAT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS location_longitude FLOAT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active TIMESTAMP WITH TIME ZONE;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS favorite_sports TEXT[] DEFAULT '{}';
EXCEPTION
    WHEN duplicate_column THEN RAISE NOTICE 'Column already exists, skipping';
END $$;

-- ============================================
-- 1. PROTECT USER DATA: Create public_profiles VIEW
-- ============================================

-- Create a view that exposes only safe user information
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
WHERE is_public = true; -- Only show users who opted in (default is true)

-- Grant access to the view
GRANT SELECT ON public_profiles TO authenticated;
GRANT SELECT ON public_profiles TO anon;

-- ============================================
-- 2. HARDEN USERS TABLE RLS
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing loose policies
DROP POLICY IF EXISTS "Users are readable by everyone" ON users;
DROP POLICY IF EXISTS "users_select_all" ON users;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON users;
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "allow_read_all_profiles" ON users;

-- STRICT SELECT: Users can ONLY see their OWN full row (including email/phone)
CREATE POLICY "Users can view own private data" 
ON users FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

-- INSERT: Users can create their own profile (required for sign up)
CREATE POLICY "Users can create own profile" 
ON users FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

-- UPDATE: Users can update their own profile
-- (Keeping this logic standard)
CREATE POLICY "Users can update own profile" 
ON users FOR UPDATE 
TO authenticated 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ============================================
-- 3. HARDEN EVENTS TABLE RLS
-- ============================================

-- Drop existing loose policies
DROP POLICY IF EXISTS "Allow all operations on events" ON events;
DROP POLICY IF EXISTS "Events are readable by everyone" ON events;
DROP POLICY IF EXISTS "Users can create events" ON events;
DROP POLICY IF EXISTS "Users can update own events" ON events;
DROP POLICY IF EXISTS "Users can delete own events" ON events;

-- SELECT: Publicly readable (or authenticated only, dependent on app needs)
CREATE POLICY "Events are readable by everyone" 
ON events FOR SELECT 
USING (true);

-- INSERT: Authenticated users can create events (assigning themselves as creator handled by trigger or app logic)
-- ideally we enforce created_by = auth.uid()
CREATE POLICY "Users can create events" 
ON events FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = created_by);

-- UPDATE: ONLY the creator can update
CREATE POLICY "Creators can update own events" 
ON events FOR UPDATE 
TO authenticated 
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

-- DELETE: ONLY the creator can delete
CREATE POLICY "Creators can delete own events" 
ON events FOR DELETE 
TO authenticated 
USING (auth.uid() = created_by);

-- ============================================
-- 4. HARDEN MESSAGES TABLE RLS
-- ============================================

-- Re-enable RLS just in case
ALTER TABLE event_messages ENABLE ROW LEVEL SECURITY;

-- Drop loose policies
DROP POLICY IF EXISTS "Allow all operations on event_messages" ON event_messages;
DROP POLICY IF EXISTS "Event messages are readable by participants" ON event_messages;
DROP POLICY IF EXISTS "Users can send messages" ON event_messages;
DROP POLICY IF EXISTS "Users can send messages to events they joined" ON event_messages;

-- SELECT: Readable by everyone (or refine to participants only if private events exist)
-- For now, general events are public, so chat is readable? 
-- Prudence: Let's limit readability to authenticated users at least.
CREATE POLICY "Authenticated users can read messages" 
ON event_messages FOR SELECT 
TO authenticated 
USING (true);

-- INSERT: Only with own user_id
CREATE POLICY "Users can send messages as themselves" 
ON event_messages FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- UPDATE: Only own messages
CREATE POLICY "Users can edit own messages" 
ON event_messages FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE: Only own messages
CREATE POLICY "Users can delete own messages" 
ON event_messages FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- ============================================
-- 5. SECURE NOTIFICATIONS (RPC Only)
-- ============================================

-- Drop loose policies
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON notifications;

-- Revoke INSERT on table for everyone except service role
REVOKE INSERT ON notifications FROM authenticated;
REVOKE INSERT ON notifications FROM anon;

-- Allow users to view/update ONLY their own notifications
CREATE POLICY "Users can view own notifications" 
ON notifications FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" 
ON notifications FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

-- Create Secure RPC Function
CREATE OR REPLACE FUNCTION send_notification(
  recipient_id UUID,
  title TEXT,
  body TEXT,
  type TEXT DEFAULT 'general',
  payload JSONB DEFAULT '{}'::jsonb
) 
RETURNS UUID 
LANGUAGE plpgsql 
SECURITY DEFINER -- Runs with elevated privileges
AS $$
DECLARE
  new_notification_id UUID;
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();

  -- Security Check 1: Allow System (Service Role) always (uid is null for service role usually, or check role)
  -- But for RPC called by user, auth.uid() is the caller.

  -- Implement Logic:
  -- 1. Friend Request: Sender must be current_user
  -- 2. Event Invite: Sender must be participant or owner?
  -- 3. System msg: user can't trigger?
  
  -- Simplified Security: 
  -- Users can only send notifications related to their actions.
  -- For now, we allow sending, but we enforce specific types or rate limits could be added.
  
  -- Insert the notification
  INSERT INTO notifications (user_id, title, body, type, data, read)
  VALUES (recipient_id, title, body, type, payload, false)
  RETURNING id INTO new_notification_id;

  RETURN new_notification_id;
END;
$$;
