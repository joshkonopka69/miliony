-- ============================================
-- DEBUG: Check auth.uid() vs table IDs
-- ============================================

-- Check what auth.uid() returns (will be NULL in SQL editor, but we can see the type)
SELECT 
  'auth.uid() info:' as info,
  pg_typeof(auth.uid()) as auth_uid_type,
  auth.uid() as auth_uid_value;

-- Check users table ID column type
SELECT 
  'users.id column info:' as info,
  data_type,
  udt_name,
  column_default
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'id';

-- Check an actual user ID from the table
SELECT 
  'Sample user ID:' as info,
  id,
  pg_typeof(id) as id_type,
  display_name
FROM users
LIMIT 1;

-- Check user_friendships columns
SELECT 
  'user_friendships columns:' as info,
  column_name,
  data_type,
  udt_name
FROM information_schema.columns
WHERE table_name = 'user_friendships' 
  AND column_name IN ('user_id', 'friend_id')
ORDER BY column_name;

-- Try the comparison that's failing
SELECT 
  'Testing UUID comparison:' as info,
  id,
  id = 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7'::uuid as direct_comparison,
  id::text = 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7' as text_comparison
FROM users
WHERE id = 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7'::uuid;

