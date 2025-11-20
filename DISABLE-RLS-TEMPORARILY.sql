-- ============================================
-- TEMPORARY: DISABLE RLS TO TEST
-- ============================================
-- This will help us confirm it's an RLS issue
-- DO NOT leave this in production!

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_friendships DISABLE ROW LEVEL SECURITY;

SELECT '⚠️ RLS DISABLED FOR TESTING' as warning;
SELECT 'Test your app now:' as instruction_1;
SELECT '1. Upload a photo' as instruction_2;
SELECT '2. Add a friend' as instruction_3;
SELECT '3. If both work, the problem IS the RLS policies' as instruction_4;
SELECT '4. If they still don''t work, the problem is something else' as instruction_5;

