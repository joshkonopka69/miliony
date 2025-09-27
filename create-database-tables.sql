-- Create all necessary tables for SportMap
-- Run this in your Supabase SQL Editor

-- 1. Create users table
CREATE TABLE IF NOT EXISTS users (
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

-- 2. Create events table
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  activity TEXT NOT NULL,
  description TEXT,
  min_participants INT DEFAULT 1,
  max_participants INT NOT NULL,
  media_url TEXT,
  location_name TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  place_id TEXT,
  created_by TEXT REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'live' CHECK (status IN ('live', 'past', 'cancelled')),
  participants_count INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Create sports table
CREATE TABLE IF NOT EXISTS sports (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  icon_url TEXT,
  category TEXT DEFAULT 'general'
);

-- 4. Create event_participants table
CREATE TABLE IF NOT EXISTS event_participants (
  event_id TEXT REFERENCES events(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (event_id, user_id)
);

-- 5. Create event_messages table
CREATE TABLE IF NOT EXISTS event_messages (
  id TEXT PRIMARY KEY,
  event_id TEXT REFERENCES events(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 6. Create user_friendships table
CREATE TABLE IF NOT EXISTS user_friendships (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  friend_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- 7. Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  preference_key TEXT NOT NULL,
  preference_value TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, preference_key)
);

-- 8. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_event_participants_user_id ON event_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_event_id ON event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_messages_event_id ON event_messages(event_id);
CREATE INDEX IF NOT EXISTS idx_user_friendships_user_id ON user_friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_user_friendships_friend_id ON user_friendships(friend_id);

-- 9. Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_messages ENABLE ROW LEVEL SECURITY;

-- 10. Create permissive RLS policies
CREATE POLICY "Allow all operations on users" ON users
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on events" ON events
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on event_participants" ON event_participants
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on sports" ON sports
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on user_friendships" ON user_friendships
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on user_preferences" ON user_preferences
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on event_messages" ON event_messages
  FOR ALL USING (true) WITH CHECK (true);

-- 11. Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- 12. Create function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Create trigger for automatic user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 14. Grant execute permission
GRANT EXECUTE ON FUNCTION handle_new_user TO anon, authenticated;
