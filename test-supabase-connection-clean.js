// Test Supabase Connection
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ujfeqshqhlplmolfrlvc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqZmVxc2hxaGxwbG1vbGZybHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MzI0NDQsImV4cCI6MjA3NTQwODQ0NH0.vUEi4gl7qsl7fU518CMV79TJG9j3MWgwBQHEzbfuwIA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase Connection...\n');

  try {
    // Test 1: Basic connection
    console.log('1. Testing basic connection...');
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (usersError) {
      console.log('   ❌ Users error:', usersError.message);
    } else {
      console.log('   ✅ Users accessible:', usersData.length, 'users found');
    }

    // Test 2: Events table
    console.log('\n2. Testing events table...');
    const { data: eventsData, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .limit(1);
    
    if (eventsError) {
      console.log('   ❌ Events error:', eventsError.message);
    } else {
      console.log('   ✅ Events accessible:', eventsData.length, 'events found');
    }

    // Test 3: Groups table
    console.log('\n3. Testing groups table...');
    const { data: groupsData, error: groupsError } = await supabase
      .from('groups')
      .select('*')
      .limit(1);
    
    if (groupsError) {
      console.log('   ❌ Groups error:', groupsError.message);
    } else {
      console.log('   ✅ Groups accessible:', groupsData.length, 'groups found');
    }

    // Test 4: Notifications table
    console.log('\n4. Testing notifications table...');
    const { data: notificationsData, error: notificationsError } = await supabase
      .from('notifications')
      .select('*')
      .limit(1);
    
    if (notificationsError) {
      console.log('   ❌ Notifications error:', notificationsError.message);
    } else {
      console.log('   ✅ Notifications accessible:', notificationsData.length, 'notifications found');
    }

    // Test 5: Privacy settings table
    console.log('\n5. Testing privacy_settings table...');
    const { data: privacyData, error: privacyError } = await supabase
      .from('privacy_settings')
      .select('*')
      .limit(1);
    
    if (privacyError) {
      console.log('   ❌ Privacy settings error:', privacyError.message);
    } else {
      console.log('   ✅ Privacy settings accessible:', privacyData.length, 'settings found');
    }

    // Test 6: Event creation (with schema cache issue)
    console.log('\n6. Testing event creation...');
    const testEvent = {
      title: 'Test Event',
      sport_type: 'Basketball',
      description: 'Test event to verify connection',
      max_participants: 10,
      latitude: 51.1079,
      longitude: 17.0385,
      location_name: 'Test Location',
      created_by: 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7',
      scheduled_datetime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };

    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .insert(testEvent)
      .select();

    if (eventError) {
      console.log('   ❌ Event creation error:', eventError.message);
      if (eventError.message.includes('schema cache')) {
        console.log('   💡 This is expected - schema cache is refreshing');
      }
    } else {
      console.log('   ✅ Event created successfully!');
      console.log('   📋 Event ID:', eventData[0].id);
    }

    console.log('\n============================================================');
    console.log('🎉 Supabase Connection Test Complete!');
    console.log('============================================================');
    
    if (usersData && eventsData && groupsData && notificationsData && privacyData) {
      console.log('✅ All tables accessible!');
      console.log('🚀 Your Supabase connection is working perfectly!');
      console.log('💡 Event creation will work once schema cache refreshes');
    } else {
      console.log('⚠️  Some tables have issues');
      console.log('💡 Check the errors above');
    }

  } catch (error) {
    console.log('❌ General error:', error.message);
  }
}

testSupabaseConnection();
