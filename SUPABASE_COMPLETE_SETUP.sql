-- Complete Supabase Database Setup for SportMap
-- Run these SQL commands in your Supabase SQL Editor

-- 1. Users table (you already have this)
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

-- 2. Events table (you already have this)
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

-- 3. Sports table (you already have this)
CREATE TABLE IF NOT EXISTS sports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  icon_url TEXT,
  category TEXT DEFAULT 'general'
);

-- 4. Event Participants (Many-to-Many relationship)
CREATE TABLE IF NOT EXISTS event_participants (
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (event_id, user_id)
);

-- 5. User Friendships (Many-to-Many relationship)
CREATE TABLE IF NOT EXISTS user_friendships (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, friend_id),
  CHECK (user_id != friend_id)
);

-- 6. Event Messages (for persistent chat history)
CREATE TABLE IF NOT EXISTS event_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'system')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 7. User Preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  notification_settings JSONB DEFAULT '{"new_events": true, "nearby_events": true, "event_updates": true}',
  privacy_settings JSONB DEFAULT '{"show_location": true, "show_friends": true}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_activity ON events(activity);
CREATE INDEX IF NOT EXISTS idx_events_location ON events(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);
CREATE INDEX IF NOT EXISTS idx_event_participants_event_id ON event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_user_id ON event_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_event_messages_event_id ON event_messages(event_id);
CREATE INDEX IF NOT EXISTS idx_event_messages_created_at ON event_messages(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can view their own profile and public info of others
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view public profiles" ON users
  FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Events are public to read
CREATE POLICY "Events are viewable by everyone" ON events
  FOR SELECT USING (true);

-- Users can create events
CREATE POLICY "Users can create events" ON events
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Event creators can update their events
CREATE POLICY "Event creators can update events" ON events
  FOR UPDATE USING (auth.uid() = created_by);

-- Sports are public
CREATE POLICY "Sports are viewable by everyone" ON sports
  FOR SELECT USING (true);

-- Event participants can view participant list
CREATE POLICY "Event participants are viewable" ON event_participants
  FOR SELECT USING (true);

-- Users can join events
CREATE POLICY "Users can join events" ON event_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can leave events
CREATE POLICY "Users can leave events" ON event_participants
  FOR DELETE USING (auth.uid() = user_id);

-- Event messages are viewable by participants
CREATE POLICY "Event messages are viewable by participants" ON event_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM event_participants ep 
      WHERE ep.event_id = event_messages.event_id 
      AND ep.user_id = auth.uid()
    )
  );

-- Users can send messages to events they're in
CREATE POLICY "Users can send messages to events" ON event_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM event_participants ep 
      WHERE ep.event_id = event_messages.event_id 
      AND ep.user_id = auth.uid()
    )
  );

-- User preferences are private
CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can create own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User friendships
CREATE POLICY "Users can view own friendships" ON user_friendships
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can create friendships" ON user_friendships
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own friendships" ON user_friendships
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('avatars', 'avatars', true),
  ('events', 'events', true),
  ('sports', 'sports', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
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

CREATE POLICY "Event images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'events');

CREATE POLICY "Users can upload event images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'events');

CREATE POLICY "Sports icons are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'sports');

-- Insert some default sports
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
  ('Boxing', 'individual')
ON CONFLICT (name) DO NOTHING;

-- Create functions for common operations

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
