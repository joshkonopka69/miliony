-- ============================================================================
-- DEBUG DATABASE STATE - Profile Photo & Friend Requests
-- ============================================================================
-- This script helps you verify what's actually in the database
-- Run these queries in the Supabase SQL Editor to debug issues
-- ============================================================================

-- ============================================================================
-- 1. CHECK USER DATA - Verify avatar_url is actually stored
-- ============================================================================
-- Replace 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7' with your actual user ID

SELECT 
    id,
    display_name,
    email,
    avatar_url,
    length(avatar_url) as avatar_url_length,
    created_at,
    updated_at
FROM users
WHERE id = 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7';

-- ============================================================================
-- 2. CHECK ALL USERS - See all users in the system
-- ============================================================================

SELECT 
    id,
    display_name,
    email,
    CASE 
        WHEN avatar_url IS NULL THEN '(NULL)'
        WHEN avatar_url = '' THEN '(EMPTY STRING)'
        ELSE substring(avatar_url, 1, 50) || '...'
    END as avatar_url_preview,
    length(avatar_url) as url_length
FROM users
ORDER BY created_at DESC
LIMIT 10;

-- ============================================================================
-- 3. CHECK COLUMN DATA TYPES - Verify table structure
-- ============================================================================

-- Check users table columns
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name IN ('id', 'avatar_url')
ORDER BY ordinal_position;

-- Check user_friendships table columns
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'user_friendships'
AND column_name IN ('user_id', 'friend_id', 'status')
ORDER BY ordinal_position;

-- ============================================================================
-- 4. CHECK RLS POLICIES - Verify current policies
-- ============================================================================

-- Users table policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as command,
    qual as using_expression,
    with_check as with_check_expression
FROM pg_policies
WHERE tablename = 'users'
ORDER BY cmd, policyname;

-- User_friendships table policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as command,
    qual as using_expression,
    with_check as with_check_expression
FROM pg_policies
WHERE tablename = 'user_friendships'
ORDER BY cmd, policyname;

-- ============================================================================
-- 5. CHECK FRIENDSHIPS DATA
-- ============================================================================

-- All friendships for user 'josh' (c46dec97-bfd3-4d30-9cc8-178b1a2b66a7)
SELECT 
    uf.*,
    u1.display_name as user_name,
    u2.display_name as friend_name
FROM user_friendships uf
LEFT JOIN users u1 ON uf.user_id = u1.id
LEFT JOIN users u2 ON uf.friend_id = u2.id
WHERE uf.user_id = 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7'
   OR uf.friend_id = 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7'
ORDER BY uf.created_at DESC;

-- ============================================================================
-- 6. TEST MANUAL UPDATE - Try updating avatar_url directly
-- ============================================================================
-- UNCOMMENT AND RUN THIS TO TEST (replace with your user ID):

-- UPDATE users 
-- SET 
--     avatar_url = 'https://ujfeqshqhlplmolfrlvc.supabase.co/storage/v1/object/public/avatars/test.jpg',
--     updated_at = NOW()
-- WHERE id = 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7';

-- Then verify:
-- SELECT id, display_name, avatar_url FROM users WHERE id = 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7';

-- ============================================================================
-- 7. CHECK STORAGE BUCKET - Verify avatars bucket exists and is accessible
-- ============================================================================

-- Check if avatars bucket exists
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets
WHERE name = 'avatars';

-- Check files in avatars bucket for your user
SELECT 
    name,
    bucket_id,
    owner,
    created_at,
    updated_at,
    metadata->>'size' as file_size
FROM storage.objects
WHERE bucket_id = 'avatars'
AND name LIKE 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7/%'
ORDER BY created_at DESC
LIMIT 10;

-- ============================================================================
-- 8. CHECK AUTHENTICATION - Verify auth.uid() works correctly
-- ============================================================================
-- This query shows you what auth.uid() returns when you're logged in
-- Run this while authenticated to see your current auth UID

SELECT 
    auth.uid() as my_auth_uid,
    auth.uid()::text as my_auth_uid_as_text,
    current_user as current_database_user,
    current_setting('request.jwt.claims', true)::json->>'sub' as jwt_sub;

-- ============================================================================
-- TROUBLESHOOTING TIPS:
-- ============================================================================
-- 
-- If avatar_url is NULL or empty after upload:
--   1. Check if the Storage policies allow uploads
--   2. Check if the users table RLS policy allows updates
--   3. Verify the file actually exists in storage (query 7)
--   4. Try the manual update (query 6) to rule out app code issues
--
-- If friend requests fail with RLS error:
--   1. Check if user_friendships table exists
--   2. Verify column types match (text vs uuid)
--   3. Check if RLS policies allow INSERT where user_id = auth.uid()
--   4. Verify auth.uid()::text cast matches your id column type
--
-- ============================================================================






