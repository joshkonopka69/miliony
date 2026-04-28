-- ============================================================================
-- ULTIMATE SECURITY AND SCHEMA CONSOLIDATION FIX
-- ============================================================================
-- This script:
-- 1. Creates all missing auxiliary tables (Security, Moderation, Social, Sports)
-- 2. Enables Row Level Security (RLS) on ALL tables
-- 3. Sets strict, granular RLS policies matching the SportMap service layer
-- ============================================================================

-- ============================================
-- 0. EXTENSIONS & PREREQUISITES
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. CORE & SOCIAL TABLES
-- ============================================

-- Create user_blocks table
CREATE TABLE IF NOT EXISTS user_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, blocked_user_id)
);

-- Create user_reports table
CREATE TABLE IF NOT EXISTS user_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reported_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_activities table
CREATE TABLE IF NOT EXISTS user_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  activity_data JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create sports table
CREATE TABLE IF NOT EXISTS sports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  icon_url TEXT,
  category TEXT DEFAULT 'General',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. SECURITY & THREAT DETECTION TABLES
-- ============================================

-- Create security_threats table
CREATE TABLE IF NOT EXISTS security_threats (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  source TEXT NOT NULL,
  target TEXT NOT NULL,
  description TEXT NOT NULL,
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'investigating', 'resolved', 'false_positive')),
  mitigation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create security_events table
CREATE TABLE IF NOT EXISTS security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address TEXT NOT NULL,
  user_agent TEXT,
  event_type TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  details JSONB DEFAULT '{}'::jsonb,
  location JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create security_rules table
CREATE TABLE IF NOT EXISTS security_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  conditions JSONB DEFAULT '{}'::jsonb,
  action TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create security_alerts table
CREATE TABLE IF NOT EXISTS security_alerts (
  id TEXT PRIMARY KEY,
  rule_id TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved', 'dismissed')),
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolution TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create rate_limits table
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL,
  action TEXT NOT NULL,
  count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create blocked_ips table
CREATE TABLE IF NOT EXISTS blocked_ips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL UNIQUE,
  reason TEXT,
  duration INTEGER, -- In minutes
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create security_config table
CREATE TABLE IF NOT EXISTS security_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB,
  description TEXT,
  category TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. MODERATION & REPORTING TABLES
-- ============================================

-- Create report_categories table
CREATE TABLE IF NOT EXISTS report_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  auto_action TEXT DEFAULT 'none',
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create report_templates table
CREATE TABLE IF NOT EXISTS report_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category_id UUID REFERENCES report_categories(id) ON DELETE CASCADE,
  description TEXT,
  required_fields TEXT[],
  optional_fields TEXT[],
  auto_assign BOOLEAN DEFAULT false,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create report_submissions table
CREATE TABLE IF NOT EXISTS report_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES report_templates(id),
  content_id TEXT NOT NULL,
  content_type TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'under_review', 'resolved', 'rejected')),
  assigned_moderator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolution TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create content_moderation table
CREATE TABLE IF NOT EXISTS content_moderation (
  id TEXT PRIMARY KEY,
  content_id TEXT NOT NULL,
  content_type TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'flagged')),
  flagged_reasons TEXT[],
  auto_moderation_score FLOAT,
  manual_review_required BOOLEAN DEFAULT false,
  moderator_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create moderation_queue table
CREATE TABLE IF NOT EXISTS moderation_queue (
  id TEXT PRIMARY KEY,
  content_id TEXT NOT NULL,
  content_type TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'resolved')),
  auto_score FLOAT,
  manual_review_required BOOLEAN DEFAULT true,
  assigned_moderator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create moderation_actions table
CREATE TABLE IF NOT EXISTS moderation_actions (
  id TEXT PRIMARY KEY,
  moderator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content_id TEXT NOT NULL,
  content_type TEXT NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('remove', 'warn', 'suspend', 'ban', 'approve', 'flag')),
  reason TEXT NOT NULL,
  duration INTEGER, -- In hours
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_moderation_status table
CREATE TABLE IF NOT EXISTS user_moderation_status (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'warned', 'suspended', 'banned', 'restricted')),
  warnings INTEGER DEFAULT 0,
  violations INTEGER DEFAULT 0,
  last_violation TIMESTAMPTZ,
  restrictions TEXT[],
  appeal_status TEXT DEFAULT 'none' CHECK (appeal_status IN ('none', 'pending', 'approved', 'denied')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create appeal_requests table
CREATE TABLE IF NOT EXISTS appeal_requests (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  evidence TEXT[], -- URLs
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'denied')),
  moderator_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. ENABLE RLS & GRANTS
-- ============================================

-- List of all new tables to enable RLS on
DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND (tablename LIKE 'security_%' 
             OR tablename LIKE 'report_%' 
             OR tablename LIKE 'moderation_%'
             OR tablename IN ('user_blocks', 'user_reports', 'user_activities', 'sports', 'blocked_ips', 'rate_limits', 'content_moderation', 'user_moderation_status', 'appeal_requests'))
    LOOP
        EXECUTE 'ALTER TABLE ' || t || ' ENABLE ROW LEVEL SECURITY;';
        EXECUTE 'GRANT ALL ON ' || t || ' TO authenticated;';
        EXECUTE 'GRANT SELECT ON ' || t || ' TO anon;';
    END LOOP;
END $$;

-- ============================================
-- 5. GRANULAR RLS POLICIES
-- ============================================

-- user_blocks
DROP POLICY IF EXISTS "Users can view their own blocks" ON user_blocks;
DROP POLICY IF EXISTS "Users can create their own blocks" ON user_blocks;
DROP POLICY IF EXISTS "Users can delete their own blocks" ON user_blocks;

CREATE POLICY "Users can view their own blocks" ON user_blocks FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own blocks" ON user_blocks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own blocks" ON user_blocks FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- user_reports / user_activities
CREATE POLICY "Users can create their own reports" ON user_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Users can view their own reports" ON user_reports FOR SELECT TO authenticated USING (auth.uid() = reporter_id);

CREATE POLICY "Users can create their own activity logs" ON user_activities FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own activity logs" ON user_activities FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- sports
CREATE POLICY "Sports are readable by everyone" ON sports FOR SELECT USING (true);

-- user_preferences (Ensure RLS covered)
ALTER TABLE IF EXISTS user_preferences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can handle own preferences" ON user_preferences;
CREATE POLICY "Users can handle own preferences" ON user_preferences 
FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- security_threats / events / alerts (Moderator only access usually, but for app logic we allow insertion)
CREATE POLICY "App can insert threat data" ON security_threats FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "App can insert security events" ON security_events FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can view own security alerts" ON security_alerts FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- report_submissions
CREATE POLICY "Users can submit reports" ON report_submissions FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Users can view their submitted reports" ON report_submissions FOR SELECT TO authenticated USING (auth.uid() = reporter_id);

-- user_moderation_status
CREATE POLICY "Users can view their own moderation status" ON user_moderation_status FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- appeal_requests
CREATE POLICY "Users can submit appeals" ON appeal_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own appeals" ON appeal_requests FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ============================================
-- 6. VERIFICATION QUERIES
-- ============================================
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
-- SELECT * FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename;
