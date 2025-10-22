// Check actual database structure
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ujfeqshqhlplmolfrlvc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqZmVxc2hxaGxwbG1vbGZybHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MzI0NDQsImV4cCI6MjA3NTQwODQ0NH0.vUEi4gl7qsl7fU518CMV79TJG9j3MWgwBQHEzbfuwIA';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('🔍 Checking actual database structure...');

// Check what columns actually exist in events table
supabase.rpc('get_table_columns', { table_name: 'events' }).then(({ data, error }) => {
  if (error) {
    console.log('❌ RPC error:', error.message);
    
    // Alternative: Try to get table info using direct query
    console.log('🔄 Trying direct query approach...');
    supabase.from('events').select('*').limit(0).then(({ data, error }) => {
      if (error) {
        console.log('❌ Direct query error:', error.message);
      } else {
        console.log('✅ Direct query successful');
      }
    });
  } else {
    console.log('✅ Table columns:', data);
  }
});

// Try to get sample data to see actual structure
console.log('📋 Getting sample event data...');
supabase.from('events').select('*').limit(1).then(({ data, error }) => {
  if (error) {
    console.log('❌ Sample data error:', error.message);
  } else {
    console.log('✅ Sample data:', data);
    if (data && data.length > 0) {
      console.log('📊 Actual columns:', Object.keys(data[0]));
    }
  }
});
