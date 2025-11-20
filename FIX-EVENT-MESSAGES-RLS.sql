-- FIX EVENT MESSAGES RLS - Run this in Supabase SQL Editor

-- 1) Make sure RLS is enabled on event_messages
ALTER TABLE event_messages ENABLE ROW LEVEL SECURITY;

-- 2) Drop ALL existing policies on event_messages to avoid conflicts
DROP POLICY IF EXISTS "Allow all operations on event_messages" ON event_messages;
DROP POLICY IF EXISTS "Users can send event messages" ON event_messages;
DROP POLICY IF EXISTS "Users can view event messages" ON event_messages;
DROP POLICY IF EXISTS "event_messages_all_access" ON event_messages;

-- 3) Create a super-simple policy that allows everything for all roles
--    (RLS stays enabled, but does not block anything)
CREATE POLICY "event_messages_all_access"
ON event_messages
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- 4) Show the active policies so you can confirm it worked
SELECT
  tablename,
  policyname,
  cmd as command,
  roles
FROM pg_policies
WHERE tablename = 'event_messages';


