-- Check the actual data types of ID columns
SELECT 
  'users.id' as column_info,
  data_type,
  udt_name
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'id'

UNION ALL

SELECT 
  'user_friendships.user_id',
  data_type,
  udt_name
FROM information_schema.columns
WHERE table_name = 'user_friendships' AND column_name = 'user_id'

UNION ALL

SELECT 
  'user_friendships.friend_id',
  data_type,
  udt_name
FROM information_schema.columns
WHERE table_name = 'user_friendships' AND column_name = 'friend_id';

