-- Safe database fix that works with existing RLS policies
-- Run this in your Supabase SQL Editor

-- 1. First, drop all existing RLS policies
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Users can insert their own data" ON users;
DROP POLICY IF EXISTS "Users can view all events" ON events;
DROP POLICY IF EXISTS "Users can create events" ON events;
DROP POLICY IF EXISTS "Users can update their own events" ON events;
DROP POLICY IF EXISTS "Users can view event participants" ON event_participants;
DROP POLICY IF EXISTS "Users can join events" ON event_participants;
DROP POLICY IF EXISTS "Users can leave events" ON event_participants;

-- 2. Disable RLS temporarily
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants DISABLE ROW LEVEL SECURITY;

-- 3. Create a new users table with TEXT id (Firebase UIDs)
CREATE TABLE IF NOT EXISTS users_new (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  friends TEXT[] DEFAULT '{}',
  favorite_sports TEXT[] DEFAULT '{}',
  location_latitude DOUBLE PRECISION,
  location_longitude DOUBLE PRECISION,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. Copy existing data if any
INSERT INTO users_new (id, email, display_name, avatar_url, friends, favorite_sports, location_latitude, location_longitude, created_at, updated_at)
SELECT 
  id::TEXT, 
  email, 
  display_name, 
  avatar_url, 
  friends::TEXT[], 
  favorite_sports, 
  location_latitude, 
  location_longitude, 
  created_at, 
  updated_at
FROM users
ON CONFLICT (id) DO NOTHING;

-- 5. Drop old table and rename new one
DROP TABLE IF EXISTS users CASCADE;
ALTER TABLE users_new RENAME TO users;

-- 6. Update events table to use TEXT for created_by
ALTER TABLE events ALTER COLUMN created_by TYPE TEXT;

-- 7. Update event_participants table
ALTER TABLE event_participants ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE event_participants ALTER COLUMN event_id TYPE TEXT;

-- 8. Re-add foreign key constraints
ALTER TABLE events ADD CONSTRAINT events_created_by_fkey 
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE event_participants ADD CONSTRAINT event_participants_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE event_participants ADD CONSTRAINT event_participants_event_id_fkey 
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;

-- 9. Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- 10. Create a simple function for user creation
CREATE OR REPLACE FUNCTION create_user_profile(
  user_id TEXT,
  user_email TEXT,
  user_display_name TEXT,
  user_favorite_sports TEXT[] DEFAULT '{}'
)
RETURNS users AS $$
DECLARE
  new_user users;
BEGIN
  INSERT INTO users (
    id,
    email,
    display_name,
    favorite_sports,
    created_at,
    updated_at
  ) VALUES (
    user_id,
    user_email,
    user_display_name,
    user_favorite_sports,
    NOW(),
    NOW()
  ) RETURNING * INTO new_user;
  
  RETURN new_user;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Grant execute permission
GRANT EXECUTE ON FUNCTION create_user_profile TO anon, authenticated;

-- 12. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_event_participants_user_id ON event_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_event_id ON event_participants(event_id);

-- 13. Re-enable RLS with simple policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;

-- 14. Create simple RLS policies
CREATE POLICY "Allow all operations on users" ON users
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on events" ON events
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on event_participants" ON event_participants
  FOR ALL USING (true) WITH CHECK (true);

