-- Fix Database Issues for SportMap App
-- This script addresses the errors found in the terminal logs

-- 1. Create missing users table (referenced in error: "Could not find the table 'public.users'")
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255),
    full_name VARCHAR(255),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add missing participants_count column to events table
-- (Error: "column 'participants_count' does not exist")
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS participants_count INTEGER DEFAULT 0;

-- 3. Create function to update participants_count when participants change
CREATE OR REPLACE FUNCTION update_event_participants_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the participants_count for the affected event
    UPDATE public.events 
    SET participants_count = (
        SELECT COUNT(*) 
        FROM public.event_participants 
        WHERE event_id = COALESCE(NEW.event_id, OLD.event_id)
        AND status = 'joined'
    )
    WHERE id = COALESCE(NEW.event_id, OLD.event_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 4. Create trigger to automatically update participants_count
DROP TRIGGER IF EXISTS trigger_update_participants_count ON public.event_participants;
CREATE TRIGGER trigger_update_participants_count
    AFTER INSERT OR UPDATE OR DELETE ON public.event_participants
    FOR EACH ROW
    EXECUTE FUNCTION update_event_participants_count();

-- 5. Update existing events with current participants count
UPDATE public.events 
SET participants_count = (
    SELECT COUNT(*) 
    FROM public.event_participants 
    WHERE event_id = events.id 
    AND status = 'joined'
);

-- 6. Add missing columns to profiles table if they don't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS gender VARCHAR(50),
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS favorite_sports TEXT[] DEFAULT '{}';

-- 7. Create RLS policies for users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own data
CREATE POLICY "Users can read own data" ON public.users
    FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own data
CREATE POLICY "Users can update own data" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Allow users to insert their own data
CREATE POLICY "Users can insert own data" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 8. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_event_participants_event_id ON public.event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_user_id ON public.event_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_events_creator_id ON public.events(creator_id);
CREATE INDEX IF NOT EXISTS idx_events_scheduled_datetime ON public.events(scheduled_datetime);

-- 9. Fix the RPC function for joining events
CREATE OR REPLACE FUNCTION join_event(event_id_param UUID, user_id_param UUID)
RETURNS TABLE(
    id UUID,
    event_id UUID,
    user_id UUID,
    status TEXT,
    joined_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    -- Insert the participant
    INSERT INTO public.event_participants (event_id, user_id, status, joined_at)
    VALUES (event_id_param, user_id_param, 'joined', NOW())
    ON CONFLICT (event_id, user_id) 
    DO UPDATE SET 
        status = 'joined',
        joined_at = NOW()
    RETURNING *;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.event_participants TO authenticated;
GRANT ALL ON public.events TO authenticated;
GRANT ALL ON public.profiles TO authenticated;

-- Grant execute permission on the RPC function
GRANT EXECUTE ON FUNCTION join_event(UUID, UUID) TO authenticated;

-- 11. Create a view for event statistics
CREATE OR REPLACE VIEW event_stats AS
SELECT 
    e.id,
    e.title,
    e.sport_type,
    e.scheduled_datetime,
    e.participants_count,
    e.max_participants,
    CASE 
        WHEN e.participants_count >= e.max_participants THEN 'full'
        WHEN e.scheduled_datetime < NOW() THEN 'past'
        ELSE 'available'
    END as availability_status
FROM public.events e;

-- Grant access to the view
GRANT SELECT ON event_stats TO authenticated;

