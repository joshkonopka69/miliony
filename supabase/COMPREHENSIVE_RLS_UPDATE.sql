-- ============================================================================
-- COMPREHENSIVE RLS SECURITY UPDATE
-- ============================================================================
-- This script ensures ALL tables have proper Row Level Security policies
-- Last updated: 2026-01-21
-- ============================================================================

-- ============================================================================
-- 1. USERS TABLE (Already hardened in 021_security_hardening.sql)
-- ============================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own private data" ON users;
DROP POLICY IF EXISTS "Users can create own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

CREATE POLICY "Users can view own private data" 
ON users FOR SELECT TO authenticated 
USING (auth.uid() = id);

CREATE POLICY "Users can create own profile" 
ON users FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON users FOR UPDATE TO authenticated 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ============================================================================
-- 2. EVENTS TABLE (Already hardened)
-- ============================================================================
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Events are readable by everyone" ON events;
DROP POLICY IF EXISTS "Users can create events" ON events;
DROP POLICY IF EXISTS "Creators can update own events" ON events;
DROP POLICY IF EXISTS "Creators can delete own events" ON events;

CREATE POLICY "Events are readable by everyone" 
ON events FOR SELECT USING (true);

CREATE POLICY "Users can create events" 
ON events FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can update own events" 
ON events FOR UPDATE TO authenticated 
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can delete own events" 
ON events FOR DELETE TO authenticated 
USING (auth.uid() = created_by);

-- ============================================================================
-- 3. EVENT_PARTICIPANTS TABLE (Needs hardening!)
-- ============================================================================
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all operations on event_participants" ON event_participants;
DROP POLICY IF EXISTS "Event participants are readable by everyone" ON event_participants;
DROP POLICY IF EXISTS "Users can join events" ON event_participants;
DROP POLICY IF EXISTS "Users can leave events" ON event_participants;

-- SELECT: Everyone can see who joined events
CREATE POLICY "Event participants are readable by everyone" 
ON event_participants FOR SELECT USING (true);

-- INSERT: Users can only join as themselves
CREATE POLICY "Users can join events" 
ON event_participants FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can only leave events they joined
CREATE POLICY "Users can leave events" 
ON event_participants FOR DELETE TO authenticated 
USING (auth.uid() = user_id);

-- ============================================================================
-- 4. EVENT_MESSAGES TABLE (Already hardened)
-- ============================================================================
ALTER TABLE event_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read messages" ON event_messages;
DROP POLICY IF EXISTS "Users can send messages as themselves" ON event_messages;
DROP POLICY IF EXISTS "Users can edit own messages" ON event_messages;
DROP POLICY IF EXISTS "Users can delete own messages" ON event_messages;

CREATE POLICY "Authenticated users can read messages" 
ON event_messages FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can send messages as themselves" 
ON event_messages FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can edit own messages" 
ON event_messages FOR UPDATE TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own messages" 
ON event_messages FOR DELETE TO authenticated 
USING (auth.uid() = user_id);

-- ============================================================================
-- 5. NOTIFICATIONS TABLE (Already hardened - RPC only for insert)
-- ============================================================================
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;

REVOKE INSERT ON notifications FROM authenticated;
REVOKE INSERT ON notifications FROM anon;

CREATE POLICY "Users can view own notifications" 
ON notifications FOR SELECT TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" 
ON notifications FOR UPDATE TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications" 
ON notifications FOR DELETE TO authenticated 
USING (auth.uid() = user_id);

-- ============================================================================
-- 6. FRIEND_REQUESTS TABLE
-- ============================================================================
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own friend requests" ON friend_requests;
DROP POLICY IF EXISTS "Users can send friend requests" ON friend_requests;
DROP POLICY IF EXISTS "Users can update own friend requests" ON friend_requests;
DROP POLICY IF EXISTS "Users can delete own friend requests" ON friend_requests;

-- SELECT: Users can see requests they sent OR received
CREATE POLICY "Users can view own friend requests" 
ON friend_requests FOR SELECT TO authenticated 
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- INSERT: Users can only send requests as themselves
CREATE POLICY "Users can send friend requests" 
ON friend_requests FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = sender_id);

-- UPDATE: Receiver can accept/decline, sender can cancel
CREATE POLICY "Users can update own friend requests" 
ON friend_requests FOR UPDATE TO authenticated 
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- DELETE: Sender can cancel their request
CREATE POLICY "Users can delete own friend requests" 
ON friend_requests FOR DELETE TO authenticated 
USING (auth.uid() = sender_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON friend_requests TO authenticated;

-- ============================================================================
-- 7. GROUPS TABLE
-- ============================================================================
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public groups are viewable by everyone" ON groups;
DROP POLICY IF EXISTS "Users can create groups" ON groups;
DROP POLICY IF EXISTS "Group creators can update their groups" ON groups;
DROP POLICY IF EXISTS "Group creators can delete their groups" ON groups;

CREATE POLICY "Public groups are viewable by everyone" 
ON groups FOR SELECT USING (true);

CREATE POLICY "Users can create groups" 
ON groups FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group creators can update their groups" 
ON groups FOR UPDATE TO authenticated 
USING (auth.uid() = created_by);

CREATE POLICY "Group creators can delete their groups" 
ON groups FOR DELETE TO authenticated 
USING (auth.uid() = created_by);

-- ============================================================================
-- 8. GROUP_MEMBERS TABLE
-- ============================================================================
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view group members" ON group_members;
DROP POLICY IF EXISTS "Users can join groups" ON group_members;
DROP POLICY IF EXISTS "Users can leave groups" ON group_members;
DROP POLICY IF EXISTS "Admins can manage members" ON group_members;

-- SELECT: Everyone can see group members
CREATE POLICY "Users can view group members" 
ON group_members FOR SELECT USING (true);

-- INSERT: Users can join groups as themselves
CREATE POLICY "Users can join groups" 
ON group_members FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can leave groups (remove themselves)
CREATE POLICY "Users can leave groups" 
ON group_members FOR DELETE TO authenticated 
USING (auth.uid() = user_id);

-- ============================================================================
-- 9. PRIVACY_SETTINGS TABLE
-- ============================================================================
ALTER TABLE privacy_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own privacy settings" ON privacy_settings;
DROP POLICY IF EXISTS "Users can insert their own privacy settings" ON privacy_settings;
DROP POLICY IF EXISTS "Users can update their own privacy settings" ON privacy_settings;

CREATE POLICY "Users can view their own privacy settings" 
ON privacy_settings FOR SELECT TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own privacy settings" 
ON privacy_settings FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own privacy settings" 
ON privacy_settings FOR UPDATE TO authenticated 
USING (auth.uid() = user_id);

-- ============================================================================
-- 10. STORAGE BUCKET POLICIES (AVATARS)
-- ============================================================================

-- Ensure avatars bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing storage policies
DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;

-- SELECT: Anyone can view avatars (public profile photos)
CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'avatars');

-- INSERT: Users can upload to their own folder (avatars/USER_ID/filename)
CREATE POLICY "Users can upload their own avatars"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- UPDATE: Users can replace their own avatars
CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- DELETE: Users can delete their own avatars
CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================================================
-- 11. PUBLIC_PROFILES VIEW (Recreate to ensure it exists)
-- ============================================================================
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

-- ============================================================================
-- 12. SEND_NOTIFICATION RPC (Recreate to ensure it exists)
-- ============================================================================
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

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these to verify RLS is enabled on all tables:

SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check all policies:
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd as operation
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
