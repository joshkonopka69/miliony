-- ============================================
-- FRIENDS & FRIENDSHIPS TABLE SETUP
-- ============================================

-- 1. Create user_friendships table (if not exists)
CREATE TABLE IF NOT EXISTS public.user_friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  friend_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate friendships
  UNIQUE(user_id, friend_id),
  
  -- Prevent self-friending
  CHECK (user_id != friend_id)
);

-- 2. Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_friendships_user_id ON public.user_friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_user_friendships_friend_id ON public.user_friendships(friend_id);
CREATE INDEX IF NOT EXISTS idx_user_friendships_status ON public.user_friendships(status);

-- 3. Create function to count mutual friends
CREATE OR REPLACE FUNCTION count_mutual_friends(user_id_a TEXT, user_id_b TEXT)
RETURNS INTEGER AS $$
DECLARE
  mutual_count INTEGER;
BEGIN
  SELECT COUNT(DISTINCT f1.friend_id) INTO mutual_count
  FROM public.user_friendships f1
  INNER JOIN public.user_friendships f2 
    ON f1.friend_id = f2.friend_id
  WHERE f1.user_id = user_id_a
    AND f2.user_id = user_id_b
    AND f1.status = 'accepted'
    AND f2.status = 'accepted';
    
  RETURN COALESCE(mutual_count, 0);
END;
$$ LANGUAGE plpgsql STABLE;

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.user_friendships ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own friendships" ON public.user_friendships;
DROP POLICY IF EXISTS "Users can view friendships where they are the friend" ON public.user_friendships;
DROP POLICY IF EXISTS "Users can create friendships" ON public.user_friendships;
DROP POLICY IF EXISTS "Users can update their own friendships" ON public.user_friendships;
DROP POLICY IF EXISTS "Users can delete their own friendships" ON public.user_friendships;

-- 6. Create RLS policies
-- Users can view friendships where they are involved
CREATE POLICY "Users can view their own friendships"
  ON public.user_friendships
  FOR SELECT
  USING (user_id::text = auth.uid()::text OR friend_id::text = auth.uid()::text);

-- Users can create friendships (send friend requests)
CREATE POLICY "Users can create friendships"
  ON public.user_friendships
  FOR INSERT
  WITH CHECK (user_id::text = auth.uid()::text);

-- Users can update friendships (accept/reject requests)
CREATE POLICY "Users can update their own friendships"
  ON public.user_friendships
  FOR UPDATE
  USING (friend_id::text = auth.uid()::text OR user_id::text = auth.uid()::text);

-- Users can delete friendships (unfriend)
CREATE POLICY "Users can delete their own friendships"
  ON public.user_friendships
  FOR DELETE
  USING (user_id::text = auth.uid()::text OR friend_id::text = auth.uid()::text);

-- 7. Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_friendships TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- ============================================
-- TESTING QUERIES
-- ============================================

-- Test 1: Check if table was created
SELECT * FROM public.user_friendships LIMIT 1;

-- Test 2: Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'user_friendships';

-- Test 3: Test mutual friends function
-- SELECT count_mutual_friends('user_id_1', 'user_id_2');

-- ============================================
-- EXAMPLE USAGE
-- ============================================

-- Send friend request:
-- INSERT INTO public.user_friendships (user_id, friend_id, status)
-- VALUES ('current_user_id', 'friend_user_id', 'pending');

-- Accept friend request:
-- UPDATE public.user_friendships
-- SET status = 'accepted', updated_at = NOW()
-- WHERE user_id = 'sender_id' AND friend_id = 'current_user_id';

-- Get all friends:
-- SELECT u.* FROM public.users u
-- INNER JOIN public.user_friendships f ON f.friend_id = u.id
-- WHERE f.user_id = 'current_user_id' AND f.status = 'accepted';

-- Search users (not friends):
-- SELECT u.* FROM public.users u
-- WHERE u.display_name ILIKE '%search_query%'
--   AND u.id NOT IN (
--     SELECT friend_id FROM public.user_friendships 
--     WHERE user_id = 'current_user_id'
--   );

