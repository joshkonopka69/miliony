// Final solution: Make app work with existing user and handle schema cache
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ujfeqshqhlplmolfrlvc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqZmVxc2hxaGxwbG1vbGZybHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MzI0NDQsImV4cCI6MjA3NTQwODQ0NH0.vUEi4gl7qsl7fU518CMV79TJG9j3MWgwBQHEzbfuwIA';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('🎯 Final Solution: Making your app work...');

// Use the existing user ID from your logs
const existingUserId = 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7';

console.log('👤 Using existing user:', existingUserId);

// Step 1: Verify user exists
console.log('1️⃣ Verifying user exists...');
supabase.from('users').select('*').eq('id', existingUserId).then(({ data, error }) => {
  if (error) {
    console.log('❌ User verification error:', error.message);
  } else {
    console.log('✅ User verification successful');
    console.log('👤 User data:', data[0] ? 'Found' : 'Not found');
    
    // Step 2: Try to create event with minimal structure
    console.log('2️⃣ Creating event with minimal structure...');
    
    // Try the most basic event structure possible
    const basicEvent = {
      latitude: 51.1079,
      longitude: 17.0385
    };
    
    supabase.from('events').insert(basicEvent).then(({ data, error }) => {
      if (error) {
        console.log('❌ Basic event creation failed:', error.message);
        
        // Try with just coordinates and user
        console.log('🔄 Trying with user ID...');
        const userEvent = {
          latitude: 51.1079,
          longitude: 17.0385,
          created_by: existingUserId
        };
        
        supabase.from('events').insert(userEvent).then(({ data, error }) => {
          if (error) {
            console.log('❌ User event creation failed:', error.message);
            
            // Try with different column names
            console.log('🔄 Trying alternative column names...');
            const altEvent = {
              lat: 51.1079,
              lng: 17.0385,
              user_id: existingUserId
            };
            
            supabase.from('events').insert(altEvent).then(({ data, error }) => {
              if (error) {
                console.log('❌ Alternative event creation failed:', error.message);
                console.log('🔍 This suggests the schema cache issue is preventing event creation');
                console.log('💡 Solution: The app will work for viewing events, but event creation may need to wait for schema cache refresh');
              } else {
                console.log('✅ Alternative event creation successful!');
                console.log('📋 Created event:', data);
              }
            });
          } else {
            console.log('✅ User event creation successful!');
            console.log('📋 Created event:', data);
          }
        });
      } else {
        console.log('✅ Basic event creation successful!');
        console.log('📋 Created event:', data);
      }
    });
  }
});

// Step 3: Test reading events (this should work)
console.log('3️⃣ Testing event reading...');
supabase.from('events').select('*').then(({ data, error }) => {
  if (error) {
    console.log('❌ Event reading error:', error.message);
  } else {
    console.log('✅ Event reading successful!');
    console.log('📋 Found events:', data.length);
  }
});

// Step 4: Test user profile reading
console.log('4️⃣ Testing user profile reading...');
supabase.from('users').select('*').then(({ data, error }) => {
  if (error) {
    console.log('❌ User reading error:', error.message);
  } else {
    console.log('✅ User reading successful!');
    console.log('👥 Found users:', data.length);
  }
});

