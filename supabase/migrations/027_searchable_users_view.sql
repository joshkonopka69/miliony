-- ============================================================================
-- FIX: Create searchable_users view for friend search
-- ============================================================================
-- The public_profiles view only shows users with is_public = true, which is too
-- restrictive for friend search. This view shows all users with minimal info
-- (just enough for search results).

CREATE OR REPLACE VIEW searchable_users AS
SELECT 
  id,
  display_name,
  avatar_url,
  created_at
FROM users;

-- Grant access to authenticated users
GRANT SELECT ON searchable_users TO authenticated;

-- Also update the searchUsers queries to use this view
-- The app code has been updated to use public_profiles, 
-- but we're creating this as a backup option

-- OPTION 2: Make is_public default to TRUE so users appear in public_profiles
-- Run this to set existing users to public:
-- UPDATE users SET is_public = true WHERE is_public IS NULL OR is_public = false;

-- OPTION 3: Ensure new users default to is_public = true
-- ALTER TABLE users ALTER COLUMN is_public SET DEFAULT true;
