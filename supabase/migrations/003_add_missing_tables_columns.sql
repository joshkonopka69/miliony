-- ====================================================================
-- MIGRATION: Add Missing Tables and Columns
-- Description: Adds privacy_settings table and status column to group_members
-- ====================================================================

-- ====================================================================
-- 1. CREATE PRIVACY_SETTINGS TABLE
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.privacy_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  
  -- Basic Privacy Settings
  profile_visibility TEXT DEFAULT 'public' CHECK (profile_visibility IN ('public', 'friends', 'private')),
  show_location BOOLEAN DEFAULT true,
  show_activity BOOLEAN DEFAULT true,
  show_friends BOOLEAN DEFAULT true,
  show_online_status BOOLEAN DEFAULT true,
  
  -- Interaction Settings
  allow_friend_requests BOOLEAN DEFAULT true,
  allow_event_invites BOOLEAN DEFAULT true,
  allow_messages BOOLEAN DEFAULT true,
  
  -- Personal Info Settings
  show_birthday BOOLEAN DEFAULT false,
  show_phone BOOLEAN DEFAULT false,
  show_email BOOLEAN DEFAULT false,
  
  -- Data Sharing Settings (JSON)
  data_sharing JSONB DEFAULT '{
    "analytics": true,
    "marketing": false,
    "third_party": false,
    "location_tracking": true
  }'::jsonb,
  
  -- Search Visibility Settings (JSON)
  search_visibility JSONB DEFAULT '{
    "searchable_by_name": true,
    "searchable_by_email": false,
    "searchable_by_phone": false,
    "appear_in_suggestions": true
  }'::jsonb,
  
  -- Activity Privacy Settings (JSON)
  activity_privacy JSONB DEFAULT '{
    "show_events_created": true,
    "show_events_joined": true,
    "show_friend_activity": true,
    "show_profile_views": false
  }'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_privacy_settings_user_id ON public.privacy_settings(user_id);

-- ====================================================================
-- 2. ADD STATUS COLUMN TO GROUP_MEMBERS
-- ====================================================================

-- Add status column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'group_members' 
    AND column_name = 'status'
  ) THEN
    ALTER TABLE public.group_members 
    ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'banned'));
    
    -- Create index for faster filtering
    CREATE INDEX idx_group_members_status ON public.group_members(status);
  END IF;
END $$;

-- ====================================================================
-- 3. ENABLE RLS ON PRIVACY_SETTINGS
-- ====================================================================

ALTER TABLE public.privacy_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own privacy settings" ON public.privacy_settings;
DROP POLICY IF EXISTS "Users can insert their own privacy settings" ON public.privacy_settings;
DROP POLICY IF EXISTS "Users can update their own privacy settings" ON public.privacy_settings;
DROP POLICY IF EXISTS "Users can delete their own privacy settings" ON public.privacy_settings;

-- Create RLS Policies for privacy_settings
CREATE POLICY "Users can view their own privacy settings"
  ON public.privacy_settings FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own privacy settings"
  ON public.privacy_settings FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own privacy settings"
  ON public.privacy_settings FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own privacy settings"
  ON public.privacy_settings FOR DELETE
  USING (user_id = auth.uid());

-- ====================================================================
-- 4. CREATE TRIGGER FOR UPDATED_AT
-- ====================================================================

-- Create trigger for privacy_settings
DROP TRIGGER IF EXISTS update_privacy_settings_updated_at ON public.privacy_settings;

CREATE TRIGGER update_privacy_settings_updated_at
  BEFORE UPDATE ON public.privacy_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ====================================================================
-- 5. CREATE DEFAULT PRIVACY SETTINGS FOR EXISTING USERS
-- ====================================================================

-- Insert default privacy settings for users who don't have them
INSERT INTO public.privacy_settings (user_id)
SELECT u.id
FROM public.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.privacy_settings ps
  WHERE ps.user_id = u.id
)
ON CONFLICT (user_id) DO NOTHING;

-- ====================================================================
-- END MIGRATION
-- ====================================================================

