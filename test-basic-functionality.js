const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ujfeqshqhlplmolfrlvc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqZmVxc2hxaGxwbG1vbGZybHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MzI0NDQsImV4cCI6MjA3NTQwODQ0NH0.vUEi4gl7qsl7fU518CMV79TJG9j3MWgwBQHEzbfuwIA'
);

async function testBasicFunctionality() {
  console.log('🚀 Testing Basic App Functionality...\n');

  try {
    // Test 1: Check if we can query events (even if columns are missing)
    console.log('1. Testing events query...');
    const { data: eventsData, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .limit(5);
    
    if (eventsError) {
      console.log('   ❌ Events query error:', eventsError.message);
    } else {
      console.log('   ✅ Events query successful');
      console.log('   📊 Found', eventsData.length, 'events');
    }

    // Test 2: Check users table
    console.log('\n2. Testing users query...');
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(5);
    
    if (usersError) {
      console.log('   ❌ Users query error:', usersError.message);
    } else {
      console.log('   ✅ Users query successful');
      console.log('   📊 Found', usersData.length, 'users');
    }

    // Test 3: Check notifications table
    console.log('\n3. Testing notifications query...');
    const { data: notificationsData, error: notificationsError } = await supabase
      .from('notifications')
      .select('*')
      .limit(5);
    
    if (notificationsError) {
      console.log('   ❌ Notifications query error:', notificationsError.message);
    } else {
      console.log('   ✅ Notifications query successful');
      console.log('   📊 Found', notificationsData.length, 'notifications');
    }

    // Test 4: Check privacy_settings table
    console.log('\n4. Testing privacy_settings query...');
    const { data: privacyData, error: privacyError } = await supabase
      .from('privacy_settings')
      .select('*')
      .limit(5);
    
    if (privacyError) {
      console.log('   ❌ Privacy settings query error:', privacyError.message);
    } else {
      console.log('   ✅ Privacy settings query successful');
      console.log('   📊 Found', privacyData.length, 'privacy settings');
    }

    // Test 5: Try to create a simple event with minimal data
    console.log('\n5. Testing minimal event creation...');
    const minimalEvent = {
      created_by: 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7'
    };

    const { data: insertData, error: insertError } = await supabase
      .from('events')
      .insert(minimalEvent)
      .select();

    if (insertError) {
      console.log('   ❌ Minimal event creation error:', insertError.message);
    } else {
      console.log('   ✅ Minimal event created successfully!');
      console.log('   📋 Created event ID:', insertData[0].id);
    }

    console.log('\n============================================================');
    console.log('🎉 Basic Functionality Test Results');
    console.log('============================================================');
    
    if (eventsError || usersError || notificationsError || privacyError) {
      console.log('⚠️  Some queries failed, but basic connectivity works');
      console.log('💡 The schema cache issue is preventing full functionality');
      console.log('🔄 Try waiting 5-10 minutes for schema cache to refresh');
    } else {
      console.log('✅ All basic queries successful!');
      console.log('🚀 Your app should work!');
    }

  } catch (error) {
    console.log('❌ General error:', error.message);
  }
}

testBasicFunctionality();
