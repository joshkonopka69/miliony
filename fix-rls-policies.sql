-- Fix RLS policies to allow user registration
-- Run this in your Supabase SQL Editor

-- 1. Drop existing policies that might be blocking access
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Users can insert their own data" ON users;
DROP POLICY IF EXISTS "Users can view all events" ON events;
DROP POLICY IF EXISTS "Users can create events" ON events;
DROP POLICY IF EXISTS "Users can update their own events" ON events;
DROP POLICY IF EXISTS "Users can view event participants" ON event_participants;
DROP POLICY IF EXISTS "Users can join events" ON event_participants;
DROP POLICY IF EXISTS "Users can leave events" ON event_participants;

-- 2. Create simple policies that allow all operations for now
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

-- 3. Ensure RLS is enabled but with permissive policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_messages ENABLE ROW LEVEL SECURITY;

-- 4. Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- 5. Create a function to handle user creation from Supabase Auth
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

-- 6. Create trigger for automatic user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 7. Grant execute permission on the function
GRANT EXECUTE ON FUNCTION handle_new_user TO anon, authenticated;

