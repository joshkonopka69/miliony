-- ============================================================================
-- CHECK COLUMN TYPES - Run this first to diagnose the issue
-- ============================================================================

-- 1. Check the data type of ID columns
SELECT 
    table_name,
    column_name,
    data_type,
    udt_name,
    CASE 
        WHEN data_type = 'uuid' THEN '✅ UUID type - Do NOT use ::text cast'
        WHEN data_type IN ('character varying', 'text', 'character') THEN '✅ TEXT type - DO use ::text cast'
        ELSE '⚠️ Unknown type: ' || data_type
    END as recommendation
FROM information_schema.columns
WHERE table_name IN ('users', 'user_friendships')
AND column_name IN ('id', 'user_id', 'friend_id')
ORDER BY table_name, column_name;

-- 2. Check what auth.uid() returns
SELECT 
    auth.uid() as auth_uuid_value,
    pg_typeof(auth.uid()) as auth_type,
    auth.uid()::text as auth_as_text,
    CASE 
        WHEN pg_typeof(auth.uid())::text = 'uuid' THEN '✅ auth.uid() returns UUID'
        ELSE '⚠️ auth.uid() returns: ' || pg_typeof(auth.uid())::text
    END as info;

-- 3. Check if you can compare them (this will show the issue)
SELECT 
    'Your user ID: ' || auth.uid()::text as message;

-- 4. Show sample user IDs to see format
SELECT 
    id,
    display_name,
    pg_typeof(id) as id_type,
    length(id::text) as id_length
FROM users
LIMIT 3;






