-- ═══════════════════════════════════════════════════════════════════════════
-- 🔒 SETUP RLS POLICIES - SECURE WAY TO ENABLE EVENTS
-- ═══════════════════════════════════════════════════════════════════════════
-- This script creates proper RLS policies so events can be read securely
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Enable RLS on events table (if not already enabled)
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- 2. Create policy to allow reading all active events (public access)
CREATE POLICY "Allow reading active events" ON public.events
  FOR SELECT 
  USING (status = 'active');

-- 3. Create policy to allow reading all events for authenticated users
CREATE POLICY "Allow authenticated users to read events" ON public.events
  FOR SELECT 
  TO authenticated
  USING (true);

-- 4. Create policy to allow reading profiles (for authentication)
CREATE POLICY "Allow reading own profile" ON public.profiles
  FOR SELECT 
  USING (auth.uid() = id);

-- 5. Create policy to allow reading public profiles
CREATE POLICY "Allow reading public profiles" ON public.profiles
  FOR SELECT 
  USING (true);

-- 6. Test the policies work
SELECT 
  '✅ RLS POLICIES CREATED' as status,
  'Events should now be accessible' as message;

-- 7. Test query that should now work
SELECT 
  '🧪 TEST QUERY' as section,
  COUNT(*) as total_events,
  COUNT(*) FILTER (WHERE status = 'active') as active_events
FROM events;

-- 8. Show events that should be accessible
SELECT 
  '📊 ACCESSIBLE EVENTS' as section,
  id,
  title,
  status,
  latitude,
  longitude
FROM events 
WHERE status = 'active'
ORDER BY scheduled_datetime;
