-- Check all policies on users table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'users';

-- Check all policies on user_friendships table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'user_friendships';

-- Check RLS status
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('users', 'user_friendships');

-- Check storage policies
SELECT * FROM storage.policies WHERE bucket_id = 'avatars';

