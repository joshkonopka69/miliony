-- ========================================
-- CREATE TEST USER - COPY & PASTE THIS!
-- ========================================

-- EASIEST METHOD: Let Supabase create both at once!

-- Go to: Supabase Dashboard > Authentication > Users
-- Click: "Add User" (top right button)
-- Enter:
--   Email: test@sportmap.com
--   Password: Test123456
--   ✅ CHECK "Auto Confirm User"
-- Click: "Create User"

-- After user is created, Supabase will show you the User ID
-- COPY that ID (looks like: 002318cb-0909-4949-8ba5-d33c8650380c)

-- Then come back here and run this SQL:
-- (Replace the UUID below with the one you copied)

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
)
VALUES (
  '002318cb-0909-4949-8ba5-d33c8650380c',  -- ← PASTE YOUR USER ID HERE
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

-- Verify it worked:
SELECT id, email, display_name, favorite_sports 
FROM public.users 
WHERE email = 'test@sportmap.com';

-- ========================================
-- ALTERNATIVE: Use existing user
-- ========================================

-- I can see you already have users in your database!
-- If you want to use one of these instead:

-- Option 1: Use hubi@pl user
-- UPDATE public.users 
-- SET display_name = 'Hubi Test',
--     favorite_sports = ARRAY['Football', 'Basketball']
-- WHERE email = 'hubi@pl';

-- Then log in with:
-- Email: hubi@pl
-- Password: (whatever password that user has)

-- ========================================
-- TROUBLESHOOTING
-- ========================================

-- If you get "user already exists" error:
-- Just update the existing user:
UPDATE public.users 
SET display_name = 'Test User',
    favorite_sports = ARRAY['Football', 'Basketball', 'Tennis'],
    updated_at = NOW()
WHERE email = 'test@sportmap.com';

-- ========================================
-- NEXT STEPS
-- ========================================

-- 1. Disable email confirmation:
--    Supabase > Authentication > Providers > Email
--    Uncheck "Confirm email" checkbox
--    Click Save

-- 2. Try to log in to your app:
--    Email: test@sportmap.com
--    Password: Test123456

-- 3. If login works → You're done! 🎉

