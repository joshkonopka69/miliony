-- ============================================================================
-- FIX STORAGE BUCKET POLICIES FOR AVATARS
-- ============================================================================
-- This script ensures the 'avatars' bucket has correct RLS policies
-- for uploading, viewing, and deleting profile photos
-- ============================================================================

-- ============================================================================
-- 1. ENSURE AVATARS BUCKET EXISTS
-- ============================================================================

-- Create avatars bucket if it doesn't exist (this will error if it exists, that's OK)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- ============================================================================
-- 2. DROP EXISTING STORAGE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Public avatar access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can manage their avatars" ON storage.objects;

-- ============================================================================
-- 3. CREATE NEW STORAGE POLICIES FOR AVATARS BUCKET
-- ============================================================================

-- Policy 1: Allow public read access to all avatars
-- (So profile photos can be viewed by everyone)
CREATE POLICY "Public can view avatars"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Policy 2: Allow authenticated users to upload to their own folder
-- (Folder structure: avatars/USER_ID/filename.jpg)
CREATE POLICY "Users can upload their own avatars"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 3: Allow users to update/replace their own avatars
CREATE POLICY "Users can update their own avatars"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 4: Allow users to delete their own avatars
CREATE POLICY "Users can delete their own avatars"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================================================
-- 4. VERIFY STORAGE POLICIES
-- ============================================================================

-- Check bucket configuration
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets
WHERE name = 'avatars';

-- Check storage policies
SELECT 
    policyname,
    roles,
    cmd as command,
    qual as using_expression,
    with_check as with_check_expression
FROM pg_policies
WHERE schemaname = 'storage'
AND tablename = 'objects'
AND (
    policyname LIKE '%avatar%' OR
    policyname LIKE '%public%'
)
ORDER BY cmd, policyname;

-- ============================================================================
-- IMPORTANT NOTES:
-- ============================================================================
-- 1. File path structure must be: avatars/USER_ID/filename.jpg
--    - This allows the policy to match (storage.foldername(name))[1]
--    - The app code already uses this structure: ${userId}/${timestamp}.${fileExt}
--
-- 2. The bucket is set to PUBLIC so anyone can view profile photos
--    - This is normal for profile pictures
--    - Upload/update/delete are still restricted to the owner
--
-- 3. If uploads still fail:
--    - Check if file size limit is set (default 50MB should be enough)
--    - Verify allowed_mime_types includes image types
--    - Check browser console for CORS errors
--
-- 4. Testing:
--    - Try uploading through the app
--    - Check storage.objects table to see if file was created
--    - Try accessing the public URL directly in browser
-- ============================================================================

