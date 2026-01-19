-- ============================================
-- SUPABASE STORAGE SETUP FOR PROFILE PHOTOS
-- ============================================

-- Step 1: Create the avatars bucket (Do this in Supabase Dashboard UI)
-- Go to Storage → New Bucket → Name: "avatars" → Set as Public → Create

-- Step 2: Run these RLS policies in Supabase SQL Editor

-- Policy 1: Allow users to upload their own avatar
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 2: Allow users to update their own avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 3: Allow users to delete their own avatar
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 4: Allow everyone to view avatars (CRITICAL - makes photos publicly accessible)
CREATE POLICY "Avatars are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Step 3: Verify users table has avatar_url column
-- Check if column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'avatar_url';

-- If not exists, add it:
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Done! Profile photo upload should now work.



