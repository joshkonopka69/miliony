-- ============================================================================
-- EMERGENCY FIX - Bypass RLS for Testing
-- ============================================================================
-- This temporarily disables RLS to verify if that's the issue
-- ONLY USE THIS FOR TESTING! Re-enable RLS after confirming it works!
-- ============================================================================

-- Step 1: Temporarily disable RLS to test if policies are the problem
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_friendships DISABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Step 2: Test your app now
-- Try uploading a photo and adding a friend
-- If it works, RLS policies are definitely the problem

-- Step 3: Check the actual data types
SELECT 
    table_name,
    column_name,
    data_type,
    udt_name
FROM information_schema.columns
WHERE table_name IN ('users', 'user_friendships')
AND column_name IN ('id', 'user_id', 'friend_id')
ORDER BY table_name, column_name;

-- Step 4: Check what auth.uid() returns
SELECT 
    auth.uid() as auth_uuid,
    auth.uid()::text as auth_text,
    pg_typeof(auth.uid()) as auth_type;

-- ============================================================================
-- AFTER TESTING - RE-ENABLE RLS AND CREATE CORRECT POLICIES
-- ============================================================================

-- If disabling RLS fixed the issues, the problem is with the policies
-- Now we need to create policies that match your actual data types

-- First, let's see what type your ID columns actually are:
DO $$
DECLARE
    users_id_type text;
    friendships_user_id_type text;
BEGIN
    SELECT data_type INTO users_id_type
    FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'id';
    
    SELECT data_type INTO friendships_user_id_type
    FROM information_schema.columns
    WHERE table_name = 'user_friendships' AND column_name = 'user_id';
    
    RAISE NOTICE 'users.id type: %', users_id_type;
    RAISE NOTICE 'user_friendships.user_id type: %', friendships_user_id_type;
    
    -- If types are UUID, we don't need ::text cast
    -- If types are TEXT/VARCHAR, we DO need ::text cast
    
    IF users_id_type = 'uuid' THEN
        RAISE NOTICE '✅ Your ID columns are UUID - policies should NOT use ::text cast';
    ELSE
        RAISE NOTICE '✅ Your ID columns are TEXT - policies SHOULD use ::text cast';
    END IF;
END $$;

-- ============================================================================
-- OPTION A: If your IDs are UUID type (NO ::text cast needed)
-- ============================================================================

-- Uncomment these if the check above shows UUID:

-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_friendships ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- DROP POLICY IF EXISTS "Users can update own profile" ON users;
-- CREATE POLICY "Users can update own profile"
-- ON users FOR UPDATE TO authenticated
-- USING (auth.uid() = id::uuid)
-- WITH CHECK (auth.uid() = id::uuid);

-- DROP POLICY IF EXISTS "Users can create friend requests" ON user_friendships;
-- CREATE POLICY "Users can create friend requests"
-- ON user_friendships FOR INSERT TO authenticated
-- WITH CHECK (auth.uid() = user_id::uuid);

-- ============================================================================
-- OPTION B: If your IDs are TEXT type (::text cast needed)
-- ============================================================================

-- Uncomment these if the check above shows TEXT/VARCHAR:

-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_friendships ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- DROP POLICY IF EXISTS "Users can update own profile" ON users;
-- CREATE POLICY "Users can update own profile"
-- ON users FOR UPDATE TO authenticated
-- USING (auth.uid()::text = id)
-- WITH CHECK (auth.uid()::text = id);

-- DROP POLICY IF EXISTS "Users can create friend requests" ON user_friendships;
-- CREATE POLICY "Users can create friend requests"
-- ON user_friendships FOR INSERT TO authenticated
-- WITH CHECK (auth.uid()::text = user_id);

-- ============================================================================
-- IMPORTANT: Don't leave RLS disabled!
-- ============================================================================
-- After testing and confirming the correct policy format:
-- 1. Uncomment the appropriate OPTION A or OPTION B above
-- 2. Run that section to re-enable RLS with correct policies
-- 3. Test again to make sure everything works
-- ============================================================================






