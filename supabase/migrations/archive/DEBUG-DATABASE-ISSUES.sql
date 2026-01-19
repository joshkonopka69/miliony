-- ============================================
-- DEBUG & FIX DATABASE ISSUES
-- ============================================

-- ISSUE 1: Check if avatar_url update is working
-- Run this AFTER uploading a photo to see if database has the URL:
SELECT id, display_name, avatar_url, LENGTH(avatar_url) as url_length
FROM public.users 
WHERE id = 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7';

-- ISSUE 2: Check RLS policies on users table
SELECT * FROM pg_policies WHERE tablename = 'users';

-- ISSUE 3: Fix user_friendships RLS policy
-- The issue is that auth.uid() returns UUID but user_id is TEXT
-- We need to cast properly

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own friendships" ON public.user_friendships;
DROP POLICY IF EXISTS "Users can create friendships" ON public.user_friendships;
DROP POLICY IF EXISTS "Users can update their own friendships" ON public.user_friendships;
DROP POLICY IF EXISTS "Users can delete their own friendships" ON public.user_friendships;

-- Create NEW policies with PERMISSIVE mode (for testing)
CREATE POLICY "Users can view their own friendships"
  ON public.user_friendships
  FOR SELECT
  USING (true); -- Temporarily permissive for debugging

CREATE POLICY "Users can create friendships"
  ON public.user_friendships
  FOR INSERT
  WITH CHECK (true); -- Temporarily permissive for debugging

CREATE POLICY "Users can update their own friendships"
  ON public.user_friendships
  FOR UPDATE
  USING (true); -- Temporarily permissive for debugging

CREATE POLICY "Users can delete their own friendships"
  ON public.user_friendships
  FOR DELETE
  USING (true); -- Temporarily permissive for debugging

-- ISSUE 4: Check if users table has RLS enabled and proper policies
-- Check RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('users', 'user_friendships');

-- If users table RLS is blocking updates, temporarily disable for testing:
-- ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
-- (Use only for debugging, re-enable after fixing!)

-- Or create/update users table policy for authenticated users:
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  USING (id::text = auth.uid()::text)
  WITH CHECK (id::text = auth.uid()::text);

-- ============================================
-- TESTING QUERIES
-- ============================================

-- Test 1: Try to update avatar_url manually
-- UPDATE public.users 
-- SET avatar_url = 'https://test-url.com/test.jpg'
-- WHERE id = 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7';

-- Test 2: Check if update worked
-- SELECT id, display_name, avatar_url FROM public.users 
-- WHERE id = 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7';

-- Test 3: Try to insert a friendship manually
-- INSERT INTO public.user_friendships (user_id, friend_id, status)
-- VALUES ('c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', 'ae31f8ef-e325-4e32-88b4-d7894f7dcd67', 'pending');

-- Test 4: Check if insert worked
-- SELECT * FROM public.user_friendships 
-- WHERE user_id = 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7';










