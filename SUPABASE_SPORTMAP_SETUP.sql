-- SportMap Supabase Database Setup
-- Copy and paste this entire script into Supabase SQL Editor

-- =============================================
-- 1. CREATE TABLES
-- =======a======================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  friends UUID[] DEFAULT '{}',
  favorite_sports TEXT[] DEFAULT '{}',
  location_latitude DOUBLE PRECISION,
  location_longitude DOUBLE PRECISION,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Sports table
CREATE TABLE IF NOT EXISTS sports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  icon_url TEXT,
  category TEXT DEFAULT 'general'
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'live' CHECK (status IN ('live', 'past', 'cancelled')),
  participants_count INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Event participants (many-to-many relationship)
CREATE TABLE IF NOT EXISTS event_participants (
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (event_id, user_id)
);

-- User friendships
CREATE TABLE IF NOT EXISTS user_friendships (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, friend_id),
  CHECK (user_id != friend_id)
);

-- Event messages (for persistent chat history)
CREATE TABLE IF NOT EXISTS event_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'system')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- User preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  notification_settings JSONB DEFAULT '{"new_events": true, "nearby_events": true, "event_updates": true}',
  privacy_settings JSONB DEFAULT '{"show_location": true, "show_friends": true}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_activity ON events(activity);
CREATE INDEX IF NOT EXISTS idx_events_location ON events(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at);
CREATE INDEX IF NOT EXISTS idx_event_participants_event_id ON event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_user_id ON event_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_event_messages_event_id ON event_messages(event_id);
CREATE INDEX IF NOT EXISTS idx_event_messages_created_at ON event_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_user_friendships_user_id ON user_friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_user_friendships_friend_id ON user_friendships(friend_id);

-- =============================================
-- 3. ENABLE ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 4. CREATE RLS POLICIES
-- =============================================

-- Users policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view public profiles" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can create own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Events policies
CREATE POLICY "Events are viewable by everyone" ON events
  FOR SELECT USING (true);

CREATE POLICY "Users can create events" ON events
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Event creators can update events" ON events
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Event creators can delete events" ON events
  FOR DELETE USING (auth.uid() = created_by);

-- Sports policies
CREATE POLICY "Sports are viewable by everyone" ON sports
  FOR SELECT USING (true);

-- Event participants policies
CREATE POLICY "Event participants are viewable" ON event_participants
  FOR SELECT USING (true);

CREATE POLICY "Users can join events" ON event_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave events" ON event_participants
  FOR DELETE USING (auth.uid() = user_id);

-- Event messages policies
CREATE POLICY "Event messages are viewable by participants" ON event_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM event_participants ep 
      WHERE ep.event_id = event_messages.event_id 
      AND ep.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages to events" ON event_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM event_participants ep 
      WHERE ep.event_id = event_messages.event_id 
      AND ep.user_id = auth.uid()
    )
  );

-- User preferences policies
CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can create own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User friendships policies
CREATE POLICY "Users can view own friendships" ON user_friendships
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can create friendships" ON user_friendships
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own friendships" ON user_friendships
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- =============================================
-- 5. CREATE STORAGE BUCKETS
-- =============================================

INSERT INTO storage.buckets (id, name, public) VALUES 
  ('avatars', 'avatars', true),
  ('events', 'events', true),
  ('sports', 'sports', true)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- 6. CREATE STORAGE POLICIES
-- =============================================

-- Avatar storage policies
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Event images storage policies
CREATE POLICY "Event images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'events');

CREATE POLICY "Users can upload event images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'events');

-- Sports icons storage policies
CREATE POLICY "Sports icons are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'sports');

-- =============================================
-- 7. INSERT DEFAULT SPORTS DATA
-- =============================================

INSERT INTO sports (name, category) VALUES 
  ('Football', 'team'),
  ('Basketball', 'team'),
  ('Tennis', 'individual'),
  ('Swimming', 'individual'),
  ('Gym Workout', 'individual'),
  ('Yoga', 'individual'),
  ('Running', 'individual'),
  ('Cycling', 'individual'),
  ('Volleyball', 'team'),
  ('Badminton', 'individual'),
  ('Soccer', 'team'),
  ('Baseball', 'team'),
  ('Hockey', 'team'),
  ('Golf', 'individual'),
  ('Boxing', 'individual'),
  ('Martial Arts', 'individual'),
  ('Dancing', 'individual'),
  ('Climbing', 'individual'),
  ('Skating', 'individual'),
  ('Skiing', 'individual')
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- 8. CREATE USEFUL FUNCTIONS
-- =============================================

-- Function to get events near a location
CREATE OR REPLACE FUNCTION get_events_near_location(
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  radius_km DOUBLE PRECISION DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  activity TEXT,
  description TEXT,
  max_participants INT,
  participants_count INT,
  location_name TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  place_id TEXT,
  created_by UUID,
  status TEXT,
  created_at TIMESTAMP,
  distance_km DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.name,
    e.activity,
    e.description,
    e.max_participants,
    e.participants_count,
    e.location_name,
    e.latitude,
    e.longitude,
    e.place_id,
    e.created_by,
    e.status,
    e.created_at,
    -- Calculate distance using Haversine formula
    (6371 * acos(
      cos(radians(user_lat)) * 
      cos(radians(e.latitude)) * 
      cos(radians(e.longitude) - radians(user_lng)) + 
      sin(radians(user_lat)) * 
      sin(radians(e.latitude))
    )) AS distance_km
  FROM events e
  WHERE e.status = 'live'
    AND (6371 * acos(
      cos(radians(user_lat)) * 
      cos(radians(e.latitude)) * 
      cos(radians(e.longitude) - radians(user_lng)) + 
      sin(radians(user_lat)) * 
      sin(radians(e.latitude))
    )) <= radius_km
  ORDER BY distance_km;
END;
$$ LANGUAGE plpgsql;

-- Function to join an event
CREATE OR REPLACE FUNCTION join_event(
  event_uuid UUID,
  user_uuid UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  current_participants INT;
  max_participants INT;
BEGIN
  -- Get current participant count and max participants
  SELECT participants_count, max_participants 
  INTO current_participants, max_participants
  FROM events 
  WHERE id = event_uuid AND status = 'live';
  
  -- Check if event exists and has space
  IF current_participants IS NULL THEN
    RETURN FALSE; -- Event doesn't exist
  END IF;
  
  IF current_participants >= max_participants THEN
    RETURN FALSE; -- Event is full
  END IF;
  
  -- Try to insert participant
  INSERT INTO event_participants (event_id, user_id)
  VALUES (event_uuid, user_uuid)
  ON CONFLICT (event_id, user_id) DO NOTHING;
  
  -- Update participant count
  UPDATE events 
  SET participants_count = participants_count + 1,
      updated_at = NOW()
  WHERE id = event_uuid;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to leave an event
CREATE OR REPLACE FUNCTION leave_event(
  event_uuid UUID,
  user_uuid UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Delete participant
  DELETE FROM event_participants 
  WHERE event_id = event_uuid AND user_id = user_uuid;
  
  -- Update participant count
  UPDATE events 
  SET participants_count = GREATEST(participants_count - 1, 0),
      updated_at = NOW()
  WHERE id = event_uuid;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's events (created and joined)
CREATE OR REPLACE FUNCTION get_user_events(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  activity TEXT,
  description TEXT,
  max_participants INT,
  participants_count INT,
  location_name TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_by UUID,
  status TEXT,
  created_at TIMESTAMP,
  user_role TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.name,
    e.activity,
    e.description,
    e.max_participants,
    e.participants_count,
    e.location_name,
    e.latitude,
    e.longitude,
    e.created_by,
    e.status,
    e.created_at,
    CASE 
      WHEN e.created_by = user_uuid THEN 'creator'
      ELSE 'participant'
    END as user_role
  FROM events e
  WHERE e.created_by = user_uuid 
     OR EXISTS (
       SELECT 1 FROM event_participants ep 
       WHERE ep.event_id = e.id AND ep.user_id = user_uuid
     )
  ORDER BY e.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 9. CREATE TRIGGERS FOR AUTOMATIC UPDATES
-- =============================================

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to users table
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to events table
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to user_preferences table
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 10. CREATE SAMPLE DATA (OPTIONAL)
-- =============================================

-- Insert sample users (you can remove this in production)
INSERT INTO users (id, email, display_name, favorite_sports, location_latitude, location_longitude) VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'john@sportmap.com', 'John Doe', ARRAY['Football', 'Basketball'], 51.1079, 17.0385),
  ('550e8400-e29b-41d4-a716-446655440001', 'jane@sportmap.com', 'Jane Smith', ARRAY['Tennis', 'Yoga'], 51.1079, 17.0385),
  ('550e8400-e29b-41d4-a716-446655440002', 'mike@sportmap.com', 'Mike Johnson', ARRAY['Gym Workout', 'Running'], 51.1079, 17.0385)
ON CONFLICT (email) DO NOTHING;

-- Insert sample events
INSERT INTO events (name, activity, description, max_participants, location_name, latitude, longitude, created_by, status) VALUES 
  ('Morning Football Game', 'Football', 'Weekly football game at the park', 10, 'Central Park', 51.1079, 17.0385, '550e8400-e29b-41d4-a716-446655440000', 'live'),
  ('Yoga Session', 'Yoga', 'Relaxing yoga session for all levels', 15, 'Zen Studio', 51.1080, 17.0386, '550e8400-e29b-41d4-a716-446655440001', 'live'),
  ('Gym Workout', 'Gym Workout', 'Intensive gym session', 8, 'Fitness World', 51.1081, 17.0387, '550e8400-e29b-41d4-a716-446655440002', 'live')
ON CONFLICT DO NOTHING;

-- =============================================
-- SETUP COMPLETE!
-- =============================================

-- Display success message
DO $$
BEGIN
  RAISE NOTICE '🎉 SportMap database setup completed successfully!';
  RAISE NOTICE '📊 Tables created: users, events, sports, event_participants, user_friendships, event_messages, user_preferences';
  RAISE NOTICE '🔒 Row Level Security enabled with appropriate policies';
  RAISE NOTICE '📦 Storage buckets created: avatars, events, sports';
  RAISE NOTICE '⚡ Functions created: get_events_near_location, join_event, leave_event, get_user_events';
  RAISE NOTICE '🏃‍♂️ Sample data inserted for testing';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Your SportMap database is ready!';
  RAISE NOTICE 'Next: Update your .env file with Supabase credentials';
END $$;
