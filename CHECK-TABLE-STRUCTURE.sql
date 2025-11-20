-- Check users table structure and data types
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- Check user_friendships table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_friendships'
ORDER BY ordinal_position;

-- Check if avatars bucket exists
SELECT * FROM storage.buckets WHERE id = 'avatars';

-- Test auth.uid() function
SELECT auth.uid();

