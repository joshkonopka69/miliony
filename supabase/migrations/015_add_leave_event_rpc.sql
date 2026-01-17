-- Migration: Add leave_event RPC function
-- This function allows users to leave an event and automatically updates the participant count.

-- Function to safely leave an event and update participant count
CREATE OR REPLACE FUNCTION public.leave_event(event_uuid UUID, user_uuid UUID)
RETURNS boolean AS $$
DECLARE
  deleted_rows INTEGER;
BEGIN
  -- 1. Check if the user is the creator and if they are the only participant
  -- (We do this BEFORE deleting to check the current state)
  IF EXISTS (
    SELECT 1 FROM public.events 
    WHERE id = event_uuid AND created_by = user_uuid
  ) AND (
    SELECT count(*) FROM public.event_participants 
    WHERE event_id = event_uuid
  ) = 1 THEN
    -- Host is leaving and they are alone: Delete the event (cascading will handle participants)
    DELETE FROM public.events WHERE id = event_uuid;
    RETURN TRUE;
  END IF;

  -- 2. Otherwise, proceed with normal leave logic
  DELETE FROM public.event_participants
  WHERE event_id = event_uuid AND user_id = user_uuid;
  
  GET DIAGNOSTICS deleted_rows = ROW_COUNT;
  
  -- 3. If a row was deleted, update the participants_count
  IF deleted_rows > 0 THEN
    UPDATE public.events
    SET participants_count = (
      SELECT count(*)
      FROM public.event_participants
      WHERE event_id = event_uuid
    ),
    updated_at = NOW()
    WHERE id = event_uuid;
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.leave_event(UUID, UUID) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION public.leave_event IS 'Allows a user to leave an event, removing their participant record and updating the count.';
