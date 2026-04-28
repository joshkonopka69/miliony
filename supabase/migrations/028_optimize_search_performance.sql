-- ============================================================================
-- OPTIMIZE SEARCH PERFORMANCE
-- ============================================================================

-- 1. Add index on display_name for faster ILIKE queries
CREATE INDEX IF NOT EXISTS idx_users_display_name_lower 
ON users (LOWER(display_name));

-- 2. Add trigram index for even faster LIKE/ILIKE searches (requires pg_trgm extension)
-- First enable the extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Then create the trigram index
CREATE INDEX IF NOT EXISTS idx_users_display_name_trgm 
ON users USING gin (display_name gin_trgm_ops);

-- 3. Make all users searchable (if not already)
UPDATE users SET is_public = true WHERE is_public IS NULL OR is_public = false;

-- 4. Set default for new users
ALTER TABLE users ALTER COLUMN is_public SET DEFAULT true;

-- 5. IMPORTANT: Analyze table after creating indexes
ANALYZE users;
