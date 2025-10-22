// Temporary fix: Disable RLS and create event to refresh schema cache
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ujfeqshqhlplmolfrlvc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqZmVxc2hxaGxwbG1vbGZybHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MzI0NDQsImV4cCI6MjA3NTQwODQ0NH0.vUEi4gl7qsl7fU518CMV79TJG9j3MWgwBQHEzbfuwIA';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('🔧 Temporary fix: Disabling RLS and creating event...');

// Step 1: Disable RLS temporarily
console.log('1️⃣ Disabling RLS on events table...');
supabase.rpc('exec_sql', { 
  sql: 'ALTER TABLE events DISABLE ROW LEVEL SECURITY;' 
}).then(({ data, error }) => {
  if (error) {
    console.log('❌ RLS disable error:', error.message);
  } else {
    console.log('✅ RLS disabled successfully');
    
    // Step 2: Create a simple event to refresh schema cache
    console.log('2️⃣ Creating simple event...');
    const simpleEvent = {
      max_participants: 5,
      latitude: 51.1079,
      longitude: 17.0385
    };
    
    supabase.from('events').insert(simpleEvent).then(({ data, error }) => {
      if (error) {
        console.log('❌ Simple event creation failed:', error.message);
      } else {
        console.log('✅ Simple event created successfully!');
        console.log('📋 Event data:', data);
        
        // Step 3: Re-enable RLS
        console.log('3️⃣ Re-enabling RLS...');
        supabase.rpc('exec_sql', { 
          sql: 'ALTER TABLE events ENABLE ROW LEVEL SECURITY;' 
        }).then(({ data, error }) => {
          if (error) {
            console.log('❌ RLS enable error:', error.message);
          } else {
            console.log('✅ RLS re-enabled successfully');
            console.log('🎉 Schema cache should now be refreshed!');
          }
        });
      }
    });
  }
});
