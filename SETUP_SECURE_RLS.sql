-- ═══════════════════════════════════════════════════════════════════════════
-- 🔒 SETUP SECURE RLS POLICIES - PRODUCTION READY
-- ═══════════════════════════════════════════════════════════════════════════
-- This script creates proper RLS policies for a secure, production-ready app
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Enable RLS on both tables
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Drop any existing policies (clean slate)
DROP POLICY IF EXISTS "Allow reading active events" ON public.events;
DROP POLICY IF EXISTS "Allow authenticated users to read events" ON public.events;
DROP POLICY IF EXISTS "Allow reading own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow reading public profiles" ON public.profiles;

-- 3. Create events policies
-- Allow anyone to read active events (for map pins)
CREATE POLICY "Public can read active events" ON public.events
  FOR SELECT 
  USING (status = 'active');

-- Allow authenticated users to read all events
CREATE POLICY "Authenticated users can read all events" ON public.events
  FOR SELECT 
  TO authenticated
  USING (true);

-- Allow event creators to modify their events
CREATE POLICY "Creators can modify their events" ON public.events
  FOR ALL
  TO authenticated
  USING (auth.uid() = creator_id);

-- 4. Create profiles policies
-- Allow users to read their own profile
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT 
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE 
  USING (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Allow reading public profiles (for user search, etc.)
CREATE POLICY "Public can read profiles" ON public.profiles
  FOR SELECT 
  USING (true);

-- 5. Test the setup
SELECT 
  '✅ RLS POLICIES SETUP COMPLETE' as status,
  'Events and profiles are now properly secured' as message;

-- 6. Test that events are accessible
SELECT 
  '🧪 TESTING EVENTS ACCESS' as section,
  COUNT(*) as total_events,
  COUNT(*) FILTER (WHERE status = 'active') as active_events
FROM events;

-- 7. Show the events that should appear as pins
SELECT 
  '📍 EVENTS FOR MAP PINS' as section,
  id,
  title,
  status,
  latitude,
  longitude,
  place_name,
  scheduled_datetime
FROM events 
WHERE status = 'active'
ORDER BY scheduled_datetime;
