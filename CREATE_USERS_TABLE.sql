-- ═══════════════════════════════════════════════════════════════════════════
-- 👤 CREATE USERS TABLE - FIX AUTHENTICATION ISSUE
-- ═══════════════════════════════════════════════════════════════════════════
-- This script creates the missing users table that's causing the PGRST205 error
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  date_of_birth DATE,
  location_latitude DECIMAL(10, 8),
  location_longitude DECIMAL(11, 8),
  location_name TEXT,
  sport_preferences TEXT[],
  skill_levels JSONB,
  is_public BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  is_online BOOLEAN DEFAULT false,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_display_name ON public.users(display_name);
CREATE INDEX IF NOT EXISTS idx_users_location ON public.users(location_latitude, location_longitude);
CREATE INDEX IF NOT EXISTS idx_users_last_active ON public.users(last_active);

-- 3. Enable RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies
-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Policy: Users can read public profiles
CREATE POLICY "Users can read public profiles" ON public.users
  FOR SELECT USING (is_public = true);

-- 5. Create a test user for development
INSERT INTO public.users (
  id,
  email,
  display_name,
  is_public,
  is_verified,
  location_latitude,
  location_longitude,
  location_name
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'test@example.com',
  'Test User',
  true,
  true,
  51.1079,
  17.0385,
  'Wrocław, Poland'
) ON CONFLICT (id) DO NOTHING;

-- 6. Verify the table was created
SELECT 
  '✅ USERS TABLE CREATED' as status,
  COUNT(*) as user_count
FROM public.users;
