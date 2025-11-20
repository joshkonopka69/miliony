-- ============================================
-- FINAL FIX FOR FRIENDSHIPS - Allow Both Directions
-- ============================================

-- The issue: When user A sends a request to user B,
-- the row has user_id = A and friend_id = B
-- But our policy only checks if user_id = auth.uid()
-- We need to allow BOTH scenarios

-- Drop existing friendship policies
DROP POLICY IF EXISTS "allow_create_friendships" ON user_friendships;
DROP POLICY IF EXISTS "allow_read_own_friendships" ON user_friendships;
DROP POLICY IF EXISTS "allow_update_own_friendships" ON user_friendships;
DROP POLICY IF EXISTS "allow_delete_own_friendships" ON user_friendships;

-- READ: Users can see friendships where they are EITHER user_id OR friend_id
CREATE POLICY "users_read_own_friendships"
ON user_friendships
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR friend_id = auth.uid()
);

-- INSERT: Users can create friendships where they are the user_id
-- OR where they are the friend_id (for accepting requests)
CREATE POLICY "users_create_friendships"
ON user_friendships
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() OR friend_id = auth.uid()
);

-- UPDATE: Users can update friendships where they are involved
CREATE POLICY "users_update_own_friendships"
ON user_friendships
FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid() OR friend_id = auth.uid()
)
WITH CHECK (
  user_id = auth.uid() OR friend_id = auth.uid()
);

-- DELETE: Users can delete friendships where they are involved
CREATE POLICY "users_delete_own_friendships"
ON user_friendships
FOR DELETE
TO authenticated
USING (
  user_id = auth.uid() OR friend_id = auth.uid()
);

-- Verify
SELECT '✅ FRIENDSHIP POLICIES UPDATED!' as status;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'user_friendships';

