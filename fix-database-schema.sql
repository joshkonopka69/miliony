-- Fix database schema to work with Firebase UIDs
-- Run this in your Supabase SQL Editor

-- 1. Drop existing constraints that might conflict
ALTER TABLE IF EXISTS users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS events DROP CONSTRAINT IF EXISTS events_created_by_fkey;
ALTER TABLE IF EXISTS event_participants DROP CONSTRAINT IF EXISTS event_participants_user_id_fkey;
ALTER TABLE IF EXISTS event_participants DROP CONSTRAINT IF EXISTS event_participants_event_id_fkey;

-- 2. Update users table to use TEXT for ID (Firebase UIDs are strings)
ALTER TABLE IF EXISTS users ALTER COLUMN id TYPE TEXT;
ALTER TABLE IF EXISTS users ALTER COLUMN friends TYPE TEXT[];

-- 3. Update events table to use TEXT for created_by
ALTER TABLE IF EXISTS events ALTER COLUMN created_by TYPE TEXT;

-- 4. Update event_participants table to use TEXT for user_id and event_id
ALTER TABLE IF EXISTS event_participants ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE IF EXISTS event_participants ALTER COLUMN event_id TYPE TEXT;

-- 5. Re-add primary key constraints
ALTER TABLE users ADD CONSTRAINT users_pkey PRIMARY KEY (id);
ALTER TABLE events ADD CONSTRAINT events_pkey PRIMARY KEY (id);

-- 6. Re-add foreign key constraints
ALTER TABLE events ADD CONSTRAINT events_created_by_fkey 
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE event_participants ADD CONSTRAINT event_participants_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE event_participants ADD CONSTRAINT event_participants_event_id_fkey 
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;

-- 7. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_event_participants_user_id ON event_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_event_id ON event_participants(event_id);

-- 8. Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;

-- 9. Create RLS policies for users
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid()::text = id);

CREATE POLICY "Users can insert their own data" ON users
  FOR INSERT WITH CHECK (auth.uid()::text = id);

-- 10. Create RLS policies for events
CREATE POLICY "Users can view all events" ON events
  FOR SELECT USING (true);

CREATE POLICY "Users can create events" ON events
  FOR INSERT WITH CHECK (auth.uid()::text = created_by);

CREATE POLICY "Users can update their own events" ON events
  FOR UPDATE USING (auth.uid()::text = created_by);

-- 11. Create RLS policies for event participants
CREATE POLICY "Users can view event participants" ON event_participants
  FOR SELECT USING (true);

CREATE POLICY "Users can join events" ON event_participants
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can leave events" ON event_participants
  FOR DELETE USING (auth.uid()::text = user_id);

-- 12. Create a function to handle user creation from Firebase
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

-- 14. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
