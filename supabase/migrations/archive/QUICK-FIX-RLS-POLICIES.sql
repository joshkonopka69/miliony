-- ============================================
-- QUICK FIX: RLS POLICIES FOR TESTING
-- ============================================
-- Run this in Supabase SQL Editor to fix both issues

-- ============================================
-- FIX 1: USER_FRIENDSHIPS TABLE
-- ============================================

-- Enable RLS
ALTER TABLE public.user_friendships ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view their own friendships" ON public.user_friendships;
DROP POLICY IF EXISTS "Users can create friendships" ON public.user_friendships;
DROP POLICY IF EXISTS "Users can update their own friendships" ON public.user_friendships;
DROP POLICY IF EXISTS "Users can delete their own friendships" ON public.user_friendships;

-- Create PERMISSIVE policies (for testing - tighten later)
CREATE POLICY "Users can view their own friendships"
  ON public.user_friendships
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create friendships"
  ON public.user_friendships
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own friendships"
  ON public.user_friendships
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete their own friendships"
  ON public.user_friendships
  FOR DELETE
  TO authenticated
  USING (true);

-- Grant permissions
GRANT ALL ON public.user_friendships TO authenticated;

-- ============================================
-- FIX 2: USERS TABLE (for avatar_url updates)
-- ============================================

-- Enable RLS if not already
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing update policy if it exists
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.users;

-- Create policy to allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (id::text = auth.uid()::text)
  WITH CHECK (id::text = auth.uid()::text);

-- Grant UPDATE permission
GRANT UPDATE ON public.users TO authenticated;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE tablename IN ('users', 'user_friendships')
ORDER BY tablename, policyname;

-- Check RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('users', 'user_friendships');

-- ============================================
-- DONE! Now test the app:
-- 1. Upload profile photo
-- 2. Add friend
-- Both should work now!
-- ============================================

