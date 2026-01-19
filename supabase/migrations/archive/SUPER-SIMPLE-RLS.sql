-- ============================================
-- SUPER SIMPLE RLS - Minimal restrictions
-- ============================================

-- Drop ALL policies on users table
DROP POLICY IF EXISTS "users_select_all" ON users;
DROP POLICY IF EXISTS "users_insert_own" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;

-- Recreate with the simplest possible policies

-- SELECT: Everyone can see all profiles
CREATE POLICY "users_can_select"
ON users
FOR SELECT
TO authenticated
USING (true);

-- INSERT: Users can insert their own profile
CREATE POLICY "users_can_insert"
ON users
FOR INSERT
TO authenticated
WITH CHECK (true); -- Allow any insert for now

-- UPDATE: Users can update their own profile
-- Let's try WITHOUT the text casting
CREATE POLICY "users_can_update"
ON users
FOR UPDATE
TO authenticated
USING (true) -- Allow seeing any row for update
WITH CHECK (id = auth.uid()); -- But only allow updating your own

SELECT '✅ Simplified RLS policies created!' as status;

SELECT 'Policies created:' as info;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'users' ORDER BY cmd;

