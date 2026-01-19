// Force Supabase schema cache refresh
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ujfeqshqhlplmolfrlvc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqZmVxc2hxaGxwbG1vbGZybHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MzI0NDQsImV4cCI6MjA3NTQwODQ0NH0.vUEi4gl7qsl7fU518CMV79TJG9j3MWgwBQHEzbfuwIA';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('🔄 Forcing Supabase schema cache refresh...');

// Method 1: Query all tables to refresh cache
async function refreshSchemaCache() {
  console.log('📊 Refreshing schema cache...');
  
  try {
    // Query all major tables to refresh their schema cache
    const tables = ['users', 'events', 'event_participants', 'event_messages', 'notifications', 'privacy_settings', 'groups', 'group_members'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) {
          console.log(`⚠️ Table ${table}: ${error.message}`);
        } else {
          console.log(`✅ Table ${table}: Schema refreshed`);
        }
      } catch (err) {
        console.log(`❌ Table ${table}: ${err.message}`);
      }
    }
    
    // Method 2: Try to create a simple event with minimal fields
    console.log('➕ Testing minimal event creation...');
    const minimalEvent = {
      title: 'Cache Test Event',
      max_participants: 5,
      latitude: 51.1079,
      longitude: 17.0385,
      created_by: 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7'
    };
    
    const { data, error } = await supabase.from('events').insert(minimalEvent);
    if (error) {
      console.log('❌ Minimal event creation failed:', error.message);
      
      // Method 3: Try with different column names
      console.log('🔄 Trying alternative column names...');
      const altEvent = {
        name: 'Cache Test Event Alt',
        max_participants: 5,
        latitude: 51.1079,
        longitude: 17.0385,
        created_by: 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7'
      };
      
      const { data: altData, error: altError } = await supabase.from('events').insert(altEvent);
      if (altError) {
        console.log('❌ Alternative event creation failed:', altError.message);
      } else {
        console.log('✅ Alternative event creation successful!');
      }
    } else {
      console.log('✅ Minimal event creation successful!');
    }
    
  } catch (err) {
    console.log('❌ Schema refresh error:', err.message);
  }
}

refreshSchemaCache();

