-- ============================================
-- CHECK: What's actually in the database?
-- ============================================

-- Check the avatar_url for your user
SELECT 
  id,
  display_name,
  avatar_url,
  updated_at
FROM users
WHERE id = 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7';

-- This will show us if the database has the NEW photo URL
-- or if it's stuck on the old one

