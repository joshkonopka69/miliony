-- SPORTMAP DATABASE SCHEMA UPDATE
-- Add event management and chat functionality

-- 1. Create events table (if not exists)
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  sport_type VARCHAR(100) NOT NULL,
  description TEXT,
  max_participants INTEGER DEFAULT 10,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  location_name VARCHAR(255),
  location_address TEXT,
  scheduled_datetime TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'active',
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create event_participants table (if not exists)
CREATE TABLE IF NOT EXISTS event_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- 3. Create event_messages table (if not exists)
CREATE TABLE IF NOT EXISTS event_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_creator ON events(creator_id);
CREATE INDEX IF NOT EXISTS idx_events_location ON events(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_events_sport_type ON events(sport_type);
CREATE INDEX IF NOT EXISTS idx_event_participants_event ON event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_user ON event_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_event_messages_event ON event_messages(event_id);
CREATE INDEX IF NOT EXISTS idx_event_messages_user ON event_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_event_messages_created_at ON event_messages(created_at);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_messages ENABLE ROW LEVEL SECURITY;

-- 6. Drop existing policies if they exist
DROP POLICY IF EXISTS "Events are readable by everyone" ON events;
DROP POLICY IF EXISTS "Users can create events" ON events;
DROP POLICY IF EXISTS "Users can update own events" ON events;
DROP POLICY IF EXISTS "Users can delete own events" ON events;

DROP POLICY IF EXISTS "Event participants are readable by everyone" ON event_participants;
DROP POLICY IF EXISTS "Users can join events" ON event_participants;
DROP POLICY IF EXISTS "Users can leave events" ON event_participants;

DROP POLICY IF EXISTS "Event messages are readable by everyone" ON event_messages;
DROP POLICY IF EXISTS "Users can send messages" ON event_messages;
DROP POLICY IF EXISTS "Users can delete own messages" ON event_messages;

-- 7. Create RLS policies for events
CREATE POLICY "Events are readable by everyone" ON events FOR SELECT USING (true);
CREATE POLICY "Users can create events" ON events FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Users can update own events" ON events FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "Users can delete own events" ON events FOR DELETE USING (auth.uid() = creator_id);

-- 8. Create RLS policies for event_participants
CREATE POLICY "Event participants are readable by everyone" ON event_participants FOR SELECT USING (true);
CREATE POLICY "Users can join events" ON event_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave events" ON event_participants FOR DELETE USING (auth.uid() = user_id);

-- 9. Create RLS policies for event_messages
CREATE POLICY "Event messages are readable by everyone" ON event_messages FOR SELECT USING (true);
CREATE POLICY "Users can send messages" ON event_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own messages" ON event_messages FOR DELETE USING (auth.uid() = user_id);

-- 10. Create functions for real-time updates
CREATE OR REPLACE FUNCTION notify_event_changes()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify('event_changes', json_build_object(
    'table', TG_TABLE_NAME,
    'action', TG_OP,
    'id', COALESCE(NEW.id, OLD.id)
  )::text);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 11. Create triggers for real-time updates
DROP TRIGGER IF EXISTS events_changes_trigger ON events;
CREATE TRIGGER events_changes_trigger
  AFTER INSERT OR UPDATE OR DELETE ON events
  FOR EACH ROW EXECUTE FUNCTION notify_event_changes();

DROP TRIGGER IF EXISTS event_participants_changes_trigger ON event_participants;
CREATE TRIGGER event_participants_changes_trigger
  AFTER INSERT OR UPDATE OR DELETE ON event_participants
  FOR EACH ROW EXECUTE FUNCTION notify_event_changes();

DROP TRIGGER IF EXISTS event_messages_changes_trigger ON event_messages;
CREATE TRIGGER event_messages_changes_trigger
  AFTER INSERT OR UPDATE OR DELETE ON event_messages
  FOR EACH ROW EXECUTE FUNCTION notify_event_changes();

-- 12. Create a view for event details with participant count
CREATE OR REPLACE VIEW event_details AS
SELECT 
  e.*,
  COUNT(ep.user_id) as participant_count,
  array_agg(ep.user_id) as participant_ids
FROM events e
LEFT JOIN event_participants ep ON e.id = ep.event_id
GROUP BY e.id;

-- 13. Create a function to get nearby events
CREATE OR REPLACE FUNCTION get_nearby_events(
  user_lat DECIMAL(10, 8),
  user_lng DECIMAL(11, 8),
  radius_km INTEGER DEFAULT 10,
  limit_count INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  title VARCHAR(255),
  sport_type VARCHAR(100),
  description TEXT,
  max_participants INTEGER,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  location_name VARCHAR(255),
  location_address TEXT,
  scheduled_datetime TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20),
  creator_id UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  distance_km DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.*,
    (6371 * acos(
      cos(radians(user_lat)) * 
      cos(radians(e.latitude)) * 
      cos(radians(e.longitude) - radians(user_lng)) + 
      sin(radians(user_lat)) * 
      sin(radians(e.latitude))
    )) as distance_km
  FROM events e
  WHERE e.status = 'active'
    AND (6371 * acos(
      cos(radians(user_lat)) * 
      cos(radians(e.latitude)) * 
      cos(radians(e.longitude) - radians(user_lng)) + 
      sin(radians(user_lat)) * 
      sin(radians(e.latitude))
    )) <= radius_km
  ORDER BY distance_km
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- 14. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 15. Insert sample events for testing (Wrocław coordinates)
INSERT INTO events (title, sport_type, description, max_participants, latitude, longitude, location_name, creator_id) VALUES
  ('Basketball Game in Wrocław', 'Basketball', 'Fun basketball game in the city center', 10, 51.1079, 17.0385, 'Wrocław City Center', '00000000-0000-0000-0000-000000000001'),
  ('Football Match', 'Football', 'Football match at the stadium', 22, 51.1408, 16.9426, 'Stadion Wrocław', '00000000-0000-0000-0000-000000000002'),
  ('Tennis Tournament', 'Tennis', 'Tennis tournament for all levels', 8, 51.0970, 17.0340, 'Tennis Club Wrocław', '00000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

-- 16. Add some sample participants
INSERT INTO event_participants (event_id, user_id) 
SELECT e.id, '00000000-0000-0000-0000-000000000001'
FROM events e 
WHERE e.title = 'Basketball Game in Wrocław'
ON CONFLICT DO NOTHING;

-- 17. Add some sample messages
INSERT INTO event_messages (event_id, user_id, message)
SELECT e.id, '00000000-0000-0000-0000-000000000001', 'Welcome to the first SportMap event! 🎉'
FROM events e 
WHERE e.title = 'Basketball Game in Wrocław'
ON CONFLICT DO NOTHING;
