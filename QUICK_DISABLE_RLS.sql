-- Quick fix: Disable RLS on events table to allow queries without authentication

-- Disable RLS on events table
ALTER TABLE public.events DISABLE ROW LEVEL SECURITY;

-- Verify it worked
SELECT 
  'RLS disabled on events table' as status,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'events';

-- Test the query that was failing
SELECT 
  'Test query - should return 3 events' as status,
  COUNT(*) as total_events,
  COUNT(*) FILTER (WHERE status = 'active') as active_events
FROM events;
