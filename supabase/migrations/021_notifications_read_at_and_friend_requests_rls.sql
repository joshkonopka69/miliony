-- Migration 021: Fix Notification read_at and Friend Request RLS/Indexes

-- 1. Fix Notifications Table (PGRST204 error)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'read_at') THEN
    ALTER TABLE public.notifications ADD COLUMN read_at TIMESTAMPTZ;
  END IF;
END $$;

-- 2. Performance Indexes for Friend Requests
CREATE INDEX IF NOT EXISTS idx_friend_requests_sender_v2 ON public.friend_requests(sender_id, status);
CREATE INDEX IF NOT EXISTS idx_friend_requests_receiver_v2 ON public.friend_requests(receiver_id, status);

-- 3. Robust RLS for Friend Requests (Ensure both sides can see the request)
DROP POLICY IF EXISTS "Users can view own friend requests" ON public.friend_requests;
CREATE POLICY "Users can view own friend requests"
  ON public.friend_requests
  FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- 4. Robust RLS for User Friendships
DROP POLICY IF EXISTS "Users can view own friendships" ON public.user_friendships;
CREATE POLICY "Users can view own friendships"
  ON public.user_friendships
  FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- 5. Grant Permissions (Standardize)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.friend_requests TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_friendships TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;

-- 6. Update Notification constraints if they exist
DO $$
BEGIN
  ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
  ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check 
    CHECK (type IN ('event_invite', 'friend_request', 'group_invite', 'chat_message', 'event_update', 'event_reminder', 'event_cancelled', 'event_updated', 'general', 'friend_request_accepted'));
EXCEPTION
  WHEN undefined_table THEN
    -- Table might not exist in some environments, ignore
END $$;
