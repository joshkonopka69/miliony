// Test event creation functionality
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ujfeqshqhlplmolfrlvc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqZmVxc2hxaGxwbG1vbGZybHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MzI0NDQsImV4cCI6MjA3NTQwODQ0NH0.vUEi4gl7qsl7fU518CMV79TJG9j3MWgwBQHEzbfuwIA';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('🎯 Testing Event Creation...');

// Test 1: Check events table structure
console.log('📊 Checking events table...');
supabase.from('events').select('*').limit(1).then(({ data, error }) => {
  if (error) {
    console.log('❌ Events table error:', error.message);
  } else {
    console.log('✅ Events table accessible');
    console.log('📋 Sample event:', data[0] ? 'Found' : 'None');
  }
});

// Test 2: Try to create a test event
console.log('➕ Testing event creation...');
const testEvent = {
  title: 'Test Basketball Game',
  sport_type: 'Basketball',
  description: 'Test event for functionality verification',
  max_participants: 10,
  latitude: 51.1079,
  longitude: 17.0385,
  location_name: 'Test Location',
  created_by: 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7',
  scheduled_datetime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  status: 'active'
};

supabase.from('events').insert(testEvent).then(({ data, error }) => {
  if (error) {
    console.log('❌ Event creation error:', error.message);
    console.log('🔍 Error details:', error);
  } else {
    console.log('✅ Event created successfully!');
    console.log('📋 Created event:', data);
  }
});

// Test 3: Check event_participants table
console.log('👥 Checking event_participants table...');
supabase.from('event_participants').select('*').limit(1).then(({ data, error }) => {
  if (error) {
    console.log('❌ Event participants table error:', error.message);
  } else {
    console.log('✅ Event participants table accessible');
  }
});

// Test 4: Check event_messages table
console.log('💬 Checking event_messages table...');
supabase.from('event_messages').select('*').limit(1).then(({ data, error }) => {
  if (error) {
    console.log('❌ Event messages table error:', error.message);
  } else {
    console.log('✅ Event messages table accessible');
  }
});

