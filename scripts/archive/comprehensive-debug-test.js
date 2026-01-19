// COMPREHENSIVE APP TESTING & DEBUGGING SCRIPT
// This will identify all issues and provide fixes

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ujfeqshqhlplmolfrlvc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqZmVxc2hxaGxwbG1vbGZybHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MzI0NDQsImV4cCI6MjA3NTQwODQ0NH0.vUEi4gl7qsl7fU518CMV79TJG9j3MWgwBQHEzbfuwIA';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('🔍 COMPREHENSIVE APP TESTING & DEBUGGING');
console.log('==========================================');

let testResults = {
  database: {},
  realtime: {},
  auth: {},
  events: {},
  chat: {},
  users: {},
  errors: []
};

// Test 1: Database Connection
console.log('\n1️⃣ TESTING DATABASE CONNECTION...');
async function testDatabaseConnection() {
  try {
    const { data, error } = await supabase.from('users').select('*').limit(1);
    if (error) {
      testResults.database.connection = 'FAILED';
      testResults.errors.push(`Database connection failed: ${error.message}`);
      console.log('❌ Database connection failed:', error.message);
    } else {
      testResults.database.connection = 'SUCCESS';
      console.log('✅ Database connection successful');
    }
  } catch (err) {
    testResults.database.connection = 'FAILED';
    testResults.errors.push(`Database connection error: ${err.message}`);
    console.log('❌ Database connection error:', err.message);
  }
}

// Test 2: Check All Tables
console.log('\n2️⃣ CHECKING ALL TABLES...');
async function checkAllTables() {
  const tables = ['users', 'events', 'event_participants', 'event_messages', 'notifications', 'privacy_settings', 'groups', 'group_members'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        testResults.database[table] = 'FAILED';
        testResults.errors.push(`Table ${table} failed: ${error.message}`);
        console.log(`❌ Table ${table}: ${error.message}`);
      } else {
        testResults.database[table] = 'SUCCESS';
        console.log(`✅ Table ${table}: Accessible`);
      }
    } catch (err) {
      testResults.database[table] = 'FAILED';
      testResults.errors.push(`Table ${table} error: ${err.message}`);
      console.log(`❌ Table ${table}: ${err.message}`);
    }
  }
}

// Test 3: Check Table Structures
console.log('\n3️⃣ CHECKING TABLE STRUCTURES...');
async function checkTableStructures() {
  // Check events table structure
  try {
    const { data, error } = await supabase.from('events').select('*').limit(0);
    if (error) {
      console.log('❌ Events table structure error:', error.message);
      testResults.errors.push(`Events table structure: ${error.message}`);
    } else {
      console.log('✅ Events table structure: OK');
    }
  } catch (err) {
    console.log('❌ Events table structure error:', err.message);
    testResults.errors.push(`Events table structure error: ${err.message}`);
  }

  // Try to get actual column names
  try {
    const { data, error } = await supabase.from('events').select('*').limit(1);
    if (data && data.length > 0) {
      console.log('📊 Events table columns:', Object.keys(data[0]));
    } else {
      console.log('⚠️ Events table is empty');
    }
  } catch (err) {
    console.log('❌ Cannot read events table:', err.message);
  }
}

// Test 4: Authentication
console.log('\n4️⃣ TESTING AUTHENTICATION...');
async function testAuthentication() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      testResults.auth.session = 'FAILED';
      testResults.errors.push(`Auth session failed: ${error.message}`);
      console.log('❌ Auth session failed:', error.message);
    } else {
      testResults.auth.session = 'SUCCESS';
      console.log('✅ Auth session check successful');
      console.log('👤 Current session:', data.session ? 'Active' : 'None');
    }
  } catch (err) {
    testResults.auth.session = 'FAILED';
    testResults.errors.push(`Auth session error: ${err.message}`);
    console.log('❌ Auth session error:', err.message);
  }
}

// Test 5: Real-time Subscriptions
console.log('\n5️⃣ TESTING REAL-TIME SUBSCRIPTIONS...');
async function testRealtimeSubscriptions() {
  return new Promise((resolve) => {
    const channel = supabase
      .channel('test-channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'events' },
        (payload) => {
          console.log('🔄 Real-time event update received:', payload.eventType);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          testResults.realtime.subscription = 'SUCCESS';
          console.log('✅ Real-time subscription: SUBSCRIBED');
        } else {
          testResults.realtime.subscription = 'FAILED';
          testResults.errors.push(`Real-time subscription failed: ${status}`);
          console.log('❌ Real-time subscription failed:', status);
        }
        
        // Clean up after 2 seconds
        setTimeout(() => {
          supabase.removeChannel(channel);
          resolve();
        }, 2000);
      });
  });
}

// Test 6: Event Operations
console.log('\n6️⃣ TESTING EVENT OPERATIONS...');
async function testEventOperations() {
  // Test reading events
  try {
    const { data, error } = await supabase.from('events').select('*');
    if (error) {
      testResults.events.read = 'FAILED';
      testResults.errors.push(`Event read failed: ${error.message}`);
      console.log('❌ Event read failed:', error.message);
    } else {
      testResults.events.read = 'SUCCESS';
      console.log(`✅ Event read successful: ${data.length} events found`);
      
      if (data.length > 0) {
        console.log('📋 Sample event:', {
          id: data[0].id,
          title: data[0].title,
          sport_type: data[0].sport_type,
          status: data[0].status
        });
      }
    }
  } catch (err) {
    testResults.events.read = 'FAILED';
    testResults.errors.push(`Event read error: ${err.message}`);
    console.log('❌ Event read error:', err.message);
  }

  // Test creating event with minimal fields
  try {
    const testEvent = {
      title: 'Debug Test Event',
      max_participants: 5,
      latitude: 51.1079,
      longitude: 17.0385,
      created_by: 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7',
      scheduled_datetime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      status: 'active'
    };

    const { data, error } = await supabase.from('events').insert(testEvent);
    if (error) {
      testResults.events.create = 'FAILED';
      testResults.errors.push(`Event creation failed: ${error.message}`);
      console.log('❌ Event creation failed:', error.message);
    } else {
      testResults.events.create = 'SUCCESS';
      console.log('✅ Event creation successful');
      
      // Clean up test event
      await supabase.from('events').delete().eq('id', data[0].id);
      console.log('🧹 Test event cleaned up');
    }
  } catch (err) {
    testResults.events.create = 'FAILED';
    testResults.errors.push(`Event creation error: ${err.message}`);
    console.log('❌ Event creation error:', err.message);
  }
}

// Test 7: Chat Operations
console.log('\n7️⃣ TESTING CHAT OPERATIONS...');
async function testChatOperations() {
  // Test reading messages
  try {
    const { data, error } = await supabase.from('event_messages').select('*');
    if (error) {
      testResults.chat.read = 'FAILED';
      testResults.errors.push(`Chat read failed: ${error.message}`);
      console.log('❌ Chat read failed:', error.message);
    } else {
      testResults.chat.read = 'SUCCESS';
      console.log(`✅ Chat read successful: ${data.length} messages found`);
    }
  } catch (err) {
    testResults.chat.read = 'FAILED';
    testResults.errors.push(`Chat read error: ${err.message}`);
    console.log('❌ Chat read error:', err.message);
  }
}

// Test 8: User Operations
console.log('\n8️⃣ TESTING USER OPERATIONS...');
async function testUserOperations() {
  try {
    const { data, error } = await supabase.from('users').select('*');
    if (error) {
      testResults.users.read = 'FAILED';
      testResults.errors.push(`User read failed: ${error.message}`);
      console.log('❌ User read failed:', error.message);
    } else {
      testResults.users.read = 'SUCCESS';
      console.log(`✅ User read successful: ${data.length} users found`);
      
      data.forEach(user => {
        console.log(`👤 User: ${user.display_name || user.email} (${user.id})`);
      });
    }
  } catch (err) {
    testResults.users.read = 'FAILED';
    testResults.errors.push(`User read error: ${err.message}`);
    console.log('❌ User read error:', err.message);
  }
}

// Test 9: RLS Policies
console.log('\n9️⃣ CHECKING RLS POLICIES...');
async function checkRLSPolicies() {
  try {
    // Try to create an event as anonymous user
    const { data, error } = await supabase.from('events').insert({
      title: 'RLS Test',
      max_participants: 5,
      latitude: 51.1079,
      longitude: 17.0385,
      created_by: 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7',
      scheduled_datetime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      status: 'active'
    });

    if (error) {
      if (error.message.includes('row-level security')) {
        console.log('⚠️ RLS is enabled (this is good for security)');
        testResults.database.rls = 'ENABLED';
      } else {
        console.log('❌ RLS test failed:', error.message);
        testResults.errors.push(`RLS test failed: ${error.message}`);
      }
    } else {
      console.log('✅ RLS test passed - event created');
      testResults.database.rls = 'DISABLED';
      
      // Clean up
      await supabase.from('events').delete().eq('id', data[0].id);
    }
  } catch (err) {
    console.log('❌ RLS test error:', err.message);
    testResults.errors.push(`RLS test error: ${err.message}`);
  }
}

// Run all tests
async function runAllTests() {
  await testDatabaseConnection();
  await checkAllTables();
  await checkTableStructures();
  await testAuthentication();
  await testRealtimeSubscriptions();
  await testEventOperations();
  await testChatOperations();
  await testUserOperations();
  await checkRLSPolicies();

  // Generate report
  console.log('\n📊 TEST RESULTS SUMMARY');
  console.log('======================');
  
  console.log('\n✅ SUCCESSFUL TESTS:');
  Object.keys(testResults).forEach(category => {
    if (typeof testResults[category] === 'object') {
      Object.keys(testResults[category]).forEach(test => {
        if (testResults[category][test] === 'SUCCESS') {
          console.log(`  ✅ ${category}.${test}`);
        }
      });
    }
  });

  console.log('\n❌ FAILED TESTS:');
  Object.keys(testResults).forEach(category => {
    if (typeof testResults[category] === 'object') {
      Object.keys(testResults[category]).forEach(test => {
        if (testResults[category][test] === 'FAILED') {
          console.log(`  ❌ ${category}.${test}`);
        }
      });
    }
  });

  console.log('\n🚨 ERRORS FOUND:');
  testResults.errors.forEach((error, index) => {
    console.log(`  ${index + 1}. ${error}`);
  });

  // Generate recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  
  if (testResults.errors.length === 0) {
    console.log('🎉 All tests passed! Your app should work perfectly.');
    console.log('📱 Next step: Restart your app and test the UI.');
  } else {
    console.log('🔧 Issues found. Here are the fixes needed:');
    
    if (testResults.errors.some(e => e.includes('schema cache'))) {
      console.log('1. Schema cache issue: Run the WORKING_FINAL.sql again');
    }
    
    if (testResults.errors.some(e => e.includes('row-level security'))) {
      console.log('2. RLS issue: Disable RLS temporarily for testing');
    }
    
    if (testResults.errors.some(e => e.includes('connection'))) {
      console.log('3. Connection issue: Check Supabase URL and key');
    }
    
    console.log('\n📋 Run this SQL to fix most issues:');
    console.log('-- Disable RLS temporarily');
    console.log('ALTER TABLE events DISABLE ROW LEVEL SECURITY;');
    console.log('ALTER TABLE event_participants DISABLE ROW LEVEL SECURITY;');
    console.log('ALTER TABLE event_messages DISABLE ROW LEVEL SECURITY;');
    console.log('');
    console.log('-- Create sample data');
    console.log('INSERT INTO events (title, sport_type, max_participants, latitude, longitude, created_by, scheduled_datetime, status) VALUES');
    console.log("('Basketball Game', 'Basketball', 10, 51.1079, 17.0385, 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', NOW() + INTERVAL '1 hour', 'active');");
  }

  console.log('\n🎯 NEXT STEPS:');
  console.log('1. Fix any database issues found above');
  console.log('2. Restart your app: npx expo start --clear');
  console.log('3. Test the UI on your phone');
  console.log('4. If still crashing, check the app logs for specific errors');
}

// Run the tests
runAllTests().catch(console.error);
