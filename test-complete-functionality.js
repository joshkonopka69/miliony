// Test complete app functionality with real data synchronization
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ujfeqshqhlplmolfrlvc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqZmVxc2hxaGxwbG1vbGZybHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MzI0NDQsImV4cCI6MjA3NTQwODQ0NH0.vUEi4gl7qsl7fU518CMV79TJG9j3MWgwBQHEzbfuwIA';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('🎯 Testing Complete App Functionality...');

// Test 1: Check current data
console.log('1️⃣ Checking current data...');
supabase.from('events').select('*').then(({ data, error }) => {
  if (error) {
    console.log('❌ Events error:', error.message);
  } else {
    console.log('✅ Events found:', data.length);
    data.forEach(event => {
      console.log(`   📅 ${event.title} - ${event.sport_type} - ${event.status}`);
    });
  }
});

// Test 2: Check event participants
console.log('2️⃣ Checking event participants...');
supabase.from('event_participants').select('*').then(({ data, error }) => {
  if (error) {
    console.log('❌ Participants error:', error.message);
  } else {
    console.log('✅ Participants found:', data.length);
  }
});

// Test 3: Check event messages
console.log('3️⃣ Checking event messages...');
supabase.from('event_messages').select('*').then(({ data, error }) => {
  if (error) {
    console.log('❌ Messages error:', error.message);
  } else {
    console.log('✅ Messages found:', data.length);
    data.forEach(msg => {
      console.log(`   💬 ${msg.message} (Event: ${msg.event_id})`);
    });
  }
});

// Test 4: Check users
console.log('4️⃣ Checking users...');
supabase.from('users').select('*').then(({ data, error }) => {
  if (error) {
    console.log('❌ Users error:', error.message);
  } else {
    console.log('✅ Users found:', data.length);
    data.forEach(user => {
      console.log(`   👤 ${user.display_name || user.email} (${user.id})`);
    });
  }
});

// Test 5: Test real-time subscriptions
console.log('5️⃣ Testing real-time subscriptions...');
const channel = supabase
  .channel('test-channel')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'events' },
    (payload) => {
      console.log('🔄 Real-time event update:', payload.eventType, payload.new);
    }
  )
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'event_messages' },
    (payload) => {
      console.log('💬 Real-time message update:', payload.eventType, payload.new);
    }
  )
  .subscribe((status) => {
    console.log('📡 Real-time subscription status:', status);
  });

// Test 6: Create a test event
console.log('6️⃣ Creating test event...');
const testEvent = {
  title: 'Test Event - Real Time',
  sport_type: 'Basketball',
  description: 'Testing real-time synchronization',
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
    console.log('❌ Test event creation failed:', error.message);
  } else {
    console.log('✅ Test event created successfully!');
    console.log('📋 Event ID:', data[0].id);
    
    // Test 7: Add participant to test event
    console.log('7️⃣ Adding participant to test event...');
    supabase.from('event_participants').insert({
      event_id: data[0].id,
      user_id: 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7'
    }).then(({ data: partData, error: partError }) => {
      if (partError) {
        console.log('❌ Participant addition failed:', partError.message);
      } else {
        console.log('✅ Participant added successfully!');
        
        // Test 8: Send test message
        console.log('8️⃣ Sending test message...');
        supabase.from('event_messages').insert({
          event_id: data[0].id,
          user_id: 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7',
          message: 'Hello! This is a test message for real-time chat!'
        }).then(({ data: msgData, error: msgError }) => {
          if (msgError) {
            console.log('❌ Message sending failed:', msgError.message);
          } else {
            console.log('✅ Message sent successfully!');
            console.log('💬 Message ID:', msgData[0].id);
          }
        });
      }
    });
  }
});

// Test 9: Test user profile synchronization
console.log('9️⃣ Testing user profile synchronization...');
supabase.from('users').select('*').eq('id', 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7').then(({ data, error }) => {
  if (error) {
    console.log('❌ User profile error:', error.message);
  } else {
    console.log('✅ User profile found:', data[0] ? 'Yes' : 'No');
    if (data[0]) {
      console.log('👤 Profile data:', {
        display_name: data[0].display_name,
        email: data[0].email,
        favorite_sports: data[0].favorite_sports,
        location: data[0].location_latitude ? 'Set' : 'Not set'
      });
    }
  }
});

// Cleanup after 30 seconds
setTimeout(() => {
  console.log('🧹 Cleaning up real-time subscription...');
  supabase.removeChannel(channel);
  console.log('✅ Test completed!');
}, 30000);
