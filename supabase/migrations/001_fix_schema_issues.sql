-- ====================================================================
-- MIGRATION: Fix Schema Issues
-- Description: Creates missing tables and columns for the application
-- ====================================================================

-- 1. Add scheduled_datetime column to events table (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'events' 
    AND column_name = 'scheduled_datetime'
  ) THEN
    ALTER TABLE public.events ADD COLUMN scheduled_datetime TIMESTAMPTZ;
    
    -- Set default value to created_at for existing rows
    UPDATE public.events 
    SET scheduled_datetime = created_at 
    WHERE scheduled_datetime IS NULL;
  END IF;
END $$;

-- 2. Create updated_at trigger function (needed for all tables)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create groups table first (if not exists)
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  sport TEXT,
  avatar_url TEXT,
  is_public BOOLEAN DEFAULT true,
  max_members INTEGER DEFAULT 100,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for groups
CREATE INDEX IF NOT EXISTS idx_groups_created_by ON public.groups(created_by);
CREATE INDEX IF NOT EXISTS idx_groups_sport ON public.groups(sport);

-- Enable RLS on groups
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

-- RLS Policies for groups
DROP POLICY IF EXISTS "Public groups are viewable by everyone" ON public.groups;
CREATE POLICY "Public groups are viewable by everyone"
  ON public.groups FOR SELECT
  USING (is_public = true OR created_by = auth.uid());

DROP POLICY IF EXISTS "Users can create groups" ON public.groups;
CREATE POLICY "Users can create groups"
  ON public.groups FOR INSERT
  WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "Group creators can update their groups" ON public.groups;
CREATE POLICY "Group creators can update their groups"
  ON public.groups FOR UPDATE
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "Group creators can delete their groups" ON public.groups;
CREATE POLICY "Group creators can delete their groups"
  ON public.groups FOR DELETE
  USING (created_by = auth.uid());

-- Add trigger to groups
DROP TRIGGER IF EXISTS update_groups_updated_at ON public.groups;
CREATE TRIGGER update_groups_updated_at
  BEFORE UPDATE ON public.groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 4. Create group_members table (if not exists)
CREATE TABLE IF NOT EXISTS public.group_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  invited_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- Index for group_members
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON public.group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON public.group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_role ON public.group_members(role);

-- Enable RLS on group_members
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for group_members
DROP POLICY IF EXISTS "Users can view group members of their groups" ON public.group_members;
CREATE POLICY "Users can view group members of their groups"
  ON public.group_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = group_members.group_id
      AND gm.user_id = auth.uid()
      AND gm.is_active = true
    )
  );

DROP POLICY IF EXISTS "Group admins can insert members" ON public.group_members;
CREATE POLICY "Group admins can insert members"
  ON public.group_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = group_id
      AND gm.user_id = auth.uid()
      AND gm.role = 'admin'
      AND gm.is_active = true
    )
  );

DROP POLICY IF EXISTS "Group admins can update members" ON public.group_members;
CREATE POLICY "Group admins can update members"
  ON public.group_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = group_members.group_id
      AND gm.user_id = auth.uid()
      AND gm.role = 'admin'
      AND gm.is_active = true
    )
  );

DROP POLICY IF EXISTS "Users can leave groups" ON public.group_members;
CREATE POLICY "Users can leave groups"
  ON public.group_members FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Group admins can delete members" ON public.group_members;
CREATE POLICY "Group admins can delete members"
  ON public.group_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = group_members.group_id
      AND gm.user_id = auth.uid()
      AND gm.role = 'admin'
      AND gm.is_active = true
    )
  );

-- 5. Create consent_settings table (if not exists)
CREATE TABLE IF NOT EXISTS public.consent_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  
  -- Consent flags
  terms_of_service BOOLEAN DEFAULT false,
  privacy_policy BOOLEAN DEFAULT false,
  data_processing BOOLEAN DEFAULT false,
  marketing_emails BOOLEAN DEFAULT false,
  analytics_tracking BOOLEAN DEFAULT true,
  
  -- Consent timestamps
  terms_accepted_at TIMESTAMPTZ,
  privacy_accepted_at TIMESTAMPTZ,
  data_processing_accepted_at TIMESTAMPTZ,
  
  -- Metadata
  ip_address INET,
  user_agent TEXT,
  consent_version TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for consent_settings
CREATE INDEX IF NOT EXISTS idx_consent_settings_user_id ON public.consent_settings(user_id);

-- Enable RLS on consent_settings
ALTER TABLE public.consent_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for consent_settings
DROP POLICY IF EXISTS "Users can view their own consent settings" ON public.consent_settings;
CREATE POLICY "Users can view their own consent settings"
  ON public.consent_settings FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own consent settings" ON public.consent_settings;
CREATE POLICY "Users can insert their own consent settings"
  ON public.consent_settings FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own consent settings" ON public.consent_settings;
CREATE POLICY "Users can update their own consent settings"
  ON public.consent_settings FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 6. Add updated_at triggers to remaining tables
-- (function already created in section 2)

-- Add trigger to group_members
DROP TRIGGER IF EXISTS update_group_members_updated_at ON public.group_members;
CREATE TRIGGER update_group_members_updated_at
  BEFORE UPDATE ON public.group_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add trigger to consent_settings
DROP TRIGGER IF EXISTS update_consent_settings_updated_at ON public.consent_settings;
CREATE TRIGGER update_consent_settings_updated_at
  BEFORE UPDATE ON public.consent_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 7. Create view for user preferences (fallback)
CREATE OR REPLACE VIEW public.user_preferences_view AS
SELECT 
  u.id as user_id,
  u.display_name,
  u.email,
  u.avatar_url,
  u.favorite_sports,
  COALESCE(cs.marketing_emails, false) as marketing_emails,
  COALESCE(cs.analytics_tracking, true) as analytics_tracking
FROM public.users u
LEFT JOIN public.consent_settings cs ON u.id = cs.user_id;

-- 8. Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.groups TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.group_members TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.consent_settings TO authenticated;
GRANT SELECT ON public.user_preferences_view TO authenticated;

-- ====================================================================
-- END MIGRATION
-- ====================================================================

