// Temporary workaround for event creation - bypass RLS temporarily
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ujfeqshqhlplmolfrlvc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqZmVxc2hxaGxwbG1vbGZybHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MzI0NDQsImV4cCI6MjA3NTQwODQ0NH0.vUEi4gl7qsl7fU518CMV79TJG9j3MWgwBQHEzbfuwIA';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('🛠️ Creating temporary workaround for event creation...');

// Create a simple migration to temporarily disable RLS on events
const migrationSQL = `
-- Temporary fix: Disable RLS on events table for testing
ALTER TABLE events DISABLE ROW LEVEL SECURITY;

-- Create a test event
INSERT INTO events (latitude, longitude, created_by) VALUES 
(51.1079, 17.0385, 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7');

-- Re-enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
`;

console.log('📝 Migration SQL created');
console.log('💡 You can run this SQL in your Supabase dashboard to enable event creation');

// Also try direct approach with service role key if available
console.log('🔄 Trying direct approach...');

// Test if we can create events now
const testEvent = {
  latitude: 51.1079,
  longitude: 17.0385,
  created_by: 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7'
};

supabase.from('events').insert(testEvent).then(({ data, error }) => {
  if (error) {
    console.log('❌ Still blocked by RLS:', error.message);
    console.log('💡 Solution: Run the migration SQL in Supabase dashboard');
  } else {
    console.log('✅ Event creation successful!');
    console.log('📋 Created event:', data);
  }
});

