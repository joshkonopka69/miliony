-- Add missing notifications table to SportMap database
-- Run this in Supabase SQL Editor

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT DEFAULT 'general' CHECK (type IN ('event', 'friend', 'group', 'system', 'general')),
  data JSONB DEFAULT '{}',
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON notifications(read_at);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- Insert some sample notifications
INSERT INTO notifications (user_id, title, body, type, data) VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'Welcome to SportMap!', 'Start exploring sports events near you', 'system', '{"action": "welcome"}'),
  ('550e8400-e29b-41d4-a716-446655440001', 'New Event Nearby', 'A new football game is starting near you', 'event', '{"event_id": "550e8400-e29b-41d4-a716-446655440010"}'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Friend Request', 'John Doe wants to be your friend', 'friend', '{"friend_id": "550e8400-e29b-41d4-a716-446655440000"}')
ON CONFLICT DO NOTHING;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ notifications table created successfully!';
  RAISE NOTICE '📊 Added table: notifications';
  RAISE NOTICE '🔒 RLS policies created for notification access';
  RAISE NOTICE '📱 Sample notifications added';
END $$;

