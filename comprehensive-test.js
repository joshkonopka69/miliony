// Comprehensive fix for Supabase issues
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ujfeqshqhlplmolfrlvc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqZmVxc2hxaGxwbG1vbGZybHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MzI0NDQsImV4cCI6MjA3NTQwODQ0NH0.vUEi4gl7qsl7fU518CMV79TJG9j3MWgwBQHEzbfuwIA';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('🔧 Comprehensive Supabase Fix...');

// Step 1: Test authentication
console.log('1️⃣ Testing authentication...');
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.log('❌ Auth session error:', error.message);
  } else {
    console.log('✅ Auth session check successful');
    console.log('👤 Current session:', data.session ? 'Active' : 'None');
    
    if (data.session) {
      console.log('👤 User ID:', data.session.user.id);
    }
  }
});

// Step 2: Test user creation/login
console.log('2️⃣ Testing user authentication...');
const testEmail = 'test@example.com';
const testPassword = 'testpassword123';

// Try to sign up a test user
supabase.auth.signUp({
  email: testEmail,
  password: testPassword,
  options: {
    data: {
      display_name: 'Test User',
      favorite_sports: ['Basketball']
    }
  }
}).then(({ data, error }) => {
  if (error) {
    console.log('❌ Sign up error:', error.message);
    
    // Try to sign in instead
    console.log('🔄 Trying sign in...');
    supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    }).then(({ data, error }) => {
      if (error) {
        console.log('❌ Sign in error:', error.message);
      } else {
        console.log('✅ Sign in successful!');
        console.log('👤 User:', data.user?.id);
        
        // Now try to create an event with this authenticated user
        testEventCreation(data.user.id);
      }
    });
  } else {
    console.log('✅ Sign up successful!');
    console.log('👤 User:', data.user?.id);
    
    // Try to create an event
    if (data.user) {
      testEventCreation(data.user.id);
    }
  }
});

function testEventCreation(userId) {
  console.log('3️⃣ Testing event creation with authenticated user...');
  
  // Try different event structures to find what works
  const eventStructures = [
    // Structure 1: Based on our migrations
    {
      title: 'Test Basketball Game',
      sport_type: 'Basketball',
      description: 'Test event',
      max_participants: 10,
      latitude: 51.1079,
      longitude: 17.0385,
      location_name: 'Test Location',
      created_by: userId,
      status: 'active'
    },
    // Structure 2: Minimal structure
    {
      max_participants: 5,
      latitude: 51.1079,
      longitude: 17.0385,
      created_by: userId
    },
    // Structure 3: Very basic
    {
      latitude: 51.1079,
      longitude: 17.0385
    }
  ];
  
  let attempt = 0;
  
  function tryNextStructure() {
    if (attempt >= eventStructures.length) {
      console.log('❌ All event creation attempts failed');
      return;
    }
    
    const eventData = eventStructures[attempt];
    console.log(`🔄 Attempt ${attempt + 1}:`, Object.keys(eventData));
    
    supabase.from('events').insert(eventData).then(({ data, error }) => {
      if (error) {
        console.log(`❌ Attempt ${attempt + 1} failed:`, error.message);
        attempt++;
        tryNextStructure();
      } else {
        console.log(`✅ Attempt ${attempt + 1} successful!`);
        console.log('📋 Created event:', data);
        
        // Test event participants
        testEventParticipants(data[0].id, userId);
      }
    });
  }
  
  tryNextStructure();
}

function testEventParticipants(eventId, userId) {
  console.log('4️⃣ Testing event participants...');
  
  supabase.from('event_participants').insert({
    event_id: eventId,
    user_id: userId
  }).then(({ data, error }) => {
    if (error) {
      console.log('❌ Event participant creation failed:', error.message);
    } else {
      console.log('✅ Event participant created successfully!');
      
      // Test event messages
      testEventMessages(eventId, userId);
    }
  });
}

function testEventMessages(eventId, userId) {
  console.log('5️⃣ Testing event messages...');
  
  supabase.from('event_messages').insert({
    event_id: eventId,
    user_id: userId,
    message: 'Test message'
  }).then(({ data, error }) => {
    if (error) {
      console.log('❌ Event message creation failed:', error.message);
    } else {
      console.log('✅ Event message created successfully!');
      console.log('🎉 All core functionality working!');
    }
  });
}
