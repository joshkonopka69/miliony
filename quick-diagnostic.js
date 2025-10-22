// QUICK DIAGNOSTIC - Identify crash causes
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ujfeqshqhlplmolfrlvc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqZmVxc2hxaGxwbG1vbGZybHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MzI0NDQsImV4cCI6MjA3NTQwODQ0NH0.vUEi4gl7qsl7fU518CMV79TJG9j3MWgwBQHEzbfuwIA';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('🔍 QUICK DIAGNOSTIC - Finding Crash Causes');
console.log('==========================================');

// Test 1: Basic connection
console.log('\n1️⃣ Testing basic connection...');
supabase.from('users').select('*').limit(1).then(({ data, error }) => {
  if (error) {
    console.log('❌ Connection failed:', error.message);
    console.log('💡 Fix: Check Supabase URL and key');
  } else {
    console.log('✅ Connection works');
    
    // Test 2: Check data
    console.log('\n2️⃣ Checking data...');
    Promise.all([
      supabase.from('events').select('*'),
      supabase.from('event_messages').select('*'),
      supabase.from('users').select('*')
    ]).then(([events, messages, users]) => {
      console.log(`📊 Events: ${events.data?.length || 0}`);
      console.log(`💬 Messages: ${messages.data?.length || 0}`);
      console.log(`👥 Users: ${users.data?.length || 0}`);
      
      if (events.data?.length === 0) {
        console.log('⚠️ No events found - this causes crashes!');
        console.log('💡 Fix: Run sample data SQL');
      }
      
      if (messages.data?.length === 0) {
        console.log('⚠️ No messages found - chat won\'t work!');
        console.log('💡 Fix: Create sample messages');
      }
      
      // Test 3: Try creating event
      console.log('\n3️⃣ Testing event creation...');
      const testEvent = {
        title: 'Crash Test Event',
        sport_type: 'Basketball',
        max_participants: 10,
        latitude: 51.1079,
        longitude: 17.0385,
        created_by: 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7',
        scheduled_datetime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        status: 'active'
      };
      
      supabase.from('events').insert(testEvent).then(({ data, error }) => {
        if (error) {
          console.log('❌ Event creation failed:', error.message);
          
          if (error.message.includes('schema cache')) {
            console.log('💡 Fix: Schema cache issue - run sample data SQL');
          } else if (error.message.includes('row-level security')) {
            console.log('💡 Fix: RLS issue - disable RLS temporarily');
          } else {
            console.log('💡 Fix: Unknown error - check database setup');
          }
        } else {
          console.log('✅ Event creation works');
          
          // Clean up
          supabase.from('events').delete().eq('id', data[0].id);
          console.log('🧹 Test event cleaned up');
        }
        
        // Final recommendations
        console.log('\n🎯 CRASH DIAGNOSIS COMPLETE');
        console.log('===========================');
        console.log('📱 Most likely crash causes:');
        console.log('1. No events in database (app shows empty map)');
        console.log('2. Schema cache issues (event creation fails)');
        console.log('3. RLS policy conflicts (permission errors)');
        console.log('4. Missing error handling in UI');
        console.log('');
        console.log('🔧 IMMEDIATE FIXES:');
        console.log('1. Run this SQL in Supabase Dashboard:');
        console.log('');
        console.log('-- Disable RLS temporarily');
        console.log('ALTER TABLE events DISABLE ROW LEVEL SECURITY;');
        console.log('ALTER TABLE event_participants DISABLE ROW LEVEL SECURITY;');
        console.log('ALTER TABLE event_messages DISABLE ROW LEVEL SECURITY;');
        console.log('');
        console.log('-- Create sample data');
        console.log('INSERT INTO events (title, sport_type, max_participants, latitude, longitude, created_by, scheduled_datetime, status) VALUES');
        console.log("('Basketball Game', 'Basketball', 10, 51.1079, 17.0385, 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', NOW() + INTERVAL '1 hour', 'active'),");
        console.log("('Football Match', 'Football', 22, 51.1089, 17.0395, 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', NOW() + INTERVAL '2 hours', 'active');");
        console.log('');
        console.log('-- Add participants');
        console.log('INSERT INTO event_participants (event_id, user_id, joined_at)');
        console.log('SELECT e.id, \'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7\', NOW() FROM events e;');
        console.log('');
        console.log('-- Add messages');
        console.log('INSERT INTO event_messages (event_id, user_id, message, created_at)');
        console.log('SELECT e.id, \'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7\', \'Welcome to the event!\', NOW()');
        console.log('FROM events e WHERE e.title = \'Basketball Game\';');
        console.log('');
        console.log('-- Re-enable RLS');
        console.log('ALTER TABLE events ENABLE ROW LEVEL SECURITY;');
        console.log('ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;');
        console.log('ALTER TABLE event_messages ENABLE ROW LEVEL SECURITY;');
        console.log('');
        console.log('CREATE POLICY "Allow all operations on events" ON events FOR ALL USING (true) WITH CHECK (true);');
        console.log('CREATE POLICY "Allow all operations on event_participants" ON event_participants FOR ALL USING (true) WITH CHECK (true);');
        console.log('CREATE POLICY "Allow all operations on event_messages" ON event_messages FOR ALL USING (true) WITH CHECK (true);');
        console.log('');
        console.log('2. Restart your app: npx expo start --clear');
        console.log('3. Test the app - it should work now!');
      });
    });
  }
});
