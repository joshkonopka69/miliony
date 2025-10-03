-- CREATE TEST USER - FIXED VERSION
-- This matches your actual users table structure

-- STEP 1: Go to Supabase Dashboard
-- https://qqxpvrbdcyedescyxesu.supabase.co

-- STEP 2: Authentication > Users > "Add User"
-- Email: test@sportmap.com
-- Password: Test123456
-- ✅ Check "Auto Confirm User"
-- Click "Create User"

-- STEP 3: Copy the User ID (UUID)
-- Then run this SQL in SQL Editor (replace the UUID):

INSERT INTO public.users (
  id,
  email,
  display_name,
  avatar_url,
  friends,
  favorite_sports,
  location_latitude,
  location_longitude,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000'::uuid,  -- REPLACE WITH YOUR USER ID
  'test@sportmap.com',
  'Test User',
  NULL,
  ARRAY[]::uuid[],
  ARRAY['Football', 'Basketball', 'Tennis'],
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  display_name = EXCLUDED.display_name,
  favorite_sports = EXCLUDED.favorite_sports,
  updated_at = NOW();

-- STEP 4: Verify
SELECT id, email, display_name, favorite_sports 
FROM public.users 
WHERE email = 'test@sportmap.com';

-- STEP 5: Log in to your app with:
-- Email: test@sportmap.com
-- Password: Test123456
