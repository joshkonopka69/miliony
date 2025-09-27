-- Quick fix for registration to work
-- Run this in your Supabase SQL Editor

-- 1. Temporarily disable RLS for testing
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants DISABLE ROW LEVEL SECURITY;

-- 2. Update the users table to accept TEXT IDs (Firebase UIDs)
ALTER TABLE users ALTER COLUMN id TYPE TEXT;

-- 3. Update related tables
ALTER TABLE events ALTER COLUMN created_by TYPE TEXT;
ALTER TABLE event_participants ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE event_participants ALTER COLUMN event_id TYPE TEXT;

-- 4. Re-add primary key
ALTER TABLE users ADD CONSTRAINT users_pkey PRIMARY KEY (id);

-- 5. Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- 6. Create a simple function to handle user creation
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

-- 7. Grant execute permission
GRANT EXECUTE ON FUNCTION create_user_profile TO anon, authenticated;
