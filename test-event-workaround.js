// Temporary workaround for event creation
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ujfeqshqhlplmolfrlvc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqZmVxc2hxaGxwbG1vbGZybHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MzI0NDQsImV4cCI6MjA3NTQwODQ0NH0.vUEi4gl7qsl7fU518CMV79TJG9j3MWgwBQHEzbfuwIA';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('🛠️ Creating temporary workaround for event creation...');

// Based on our migrations, the events table should have these columns:
// id, title, sport_type, description, max_participants, latitude, longitude, 
// location_name, location_address, scheduled_datetime, status, created_by, 
// created_at, updated_at, participants_count

// Let's try creating an event with the exact structure from our migrations
const testEvent = {
  title: 'Test Basketball Game',
  sport_type: 'Basketball', 
  description: 'Test event for functionality verification',
  max_participants: 10,
  latitude: 51.1079,
  longitude: 17.0385,
  location_name: 'Test Location',
  location_address: 'Test Address',
  scheduled_datetime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  status: 'active',
  created_by: 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7',
  participants_count: 1
};

console.log('➕ Creating test event with full structure...');
supabase.from('events').insert(testEvent).then(({ data, error }) => {
  if (error) {
    console.log('❌ Event creation failed:', error.message);
    console.log('🔍 Full error:', error);
    
    // Try with minimal required fields only
    console.log('🔄 Trying with minimal fields...');
    const minimalEvent = {
      title: 'Minimal Test Event',
      max_participants: 5,
      latitude: 51.1079,
      longitude: 17.0385,
      created_by: 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7'
    };
    
    supabase.from('events').insert(minimalEvent).then(({ data: minData, error: minError }) => {
      if (minError) {
        console.log('❌ Minimal event creation failed:', minError.message);
        
        // Try with just the basic fields that definitely exist
        console.log('🔄 Trying with basic fields only...');
        const basicEvent = {
          max_participants: 5,
          latitude: 51.1079,
          longitude: 17.0385
        };
        
        supabase.from('events').insert(basicEvent).then(({ data: basicData, error: basicError }) => {
          if (basicError) {
            console.log('❌ Basic event creation failed:', basicError.message);
          } else {
            console.log('✅ Basic event creation successful!');
            console.log('📋 Created event:', basicData);
          }
        });
      } else {
        console.log('✅ Minimal event creation successful!');
        console.log('📋 Created event:', minData);
      }
    });
  } else {
    console.log('✅ Event creation successful!');
    console.log('📋 Created event:', data);
  }
});

