const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ujfeqshqhlplmolfrlvc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqZmVxc2hxaGxwbG1vbGZybHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MzI0NDQsImV4cCI6MjA3NTQwODQ0NH0.vUEi4gl7qsl7fU518CMV79TJG9j3MWgwBQHEzbfuwIA'
);

async function checkDatabaseStructure() {
  console.log('🔍 Checking Database Structure...\n');

  try {
    // Check events table structure
    console.log('1. Checking events table...');
    const { data: eventsData, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .limit(1);
    
    if (eventsError) {
      console.log('   ❌ Events error:', eventsError.message);
    } else {
      console.log('   ✅ Events table accessible');
      if (eventsData && eventsData.length > 0) {
        console.log('   📋 Events columns:', Object.keys(eventsData[0]));
      } else {
        console.log('   📋 Events table exists but no data');
      }
    }

    // Try to insert a test event to see what columns are available
    console.log('\n2. Testing event insertion...');
    const testEvent = {
      title: 'Test Event',
      sport_type: 'Basketball',
      created_by: 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7',
      scheduled_datetime: new Date().toISOString(),
      latitude: 51.1079,
      longitude: 17.0385,
      max_participants: 10
    };

    const { data: insertData, error: insertError } = await supabase
      .from('events')
      .insert(testEvent)
      .select();

    if (insertError) {
      console.log('   ❌ Insert error:', insertError.message);
    } else {
      console.log('   ✅ Event inserted successfully!');
      console.log('   📋 Inserted event:', insertData);
    }

    // Check other tables
    console.log('\n3. Checking event_participants table...');
    const { data: participantsData, error: participantsError } = await supabase
      .from('event_participants')
      .select('*')
      .limit(1);
    
    if (participantsError) {
      console.log('   ❌ Event participants error:', participantsError.message);
    } else {
      console.log('   ✅ Event participants table accessible');
    }

    console.log('\n4. Checking event_messages table...');
    const { data: messagesData, error: messagesError } = await supabase
      .from('event_messages')
      .select('*')
      .limit(1);
    
    if (messagesError) {
      console.log('   ❌ Event messages error:', messagesError.message);
    } else {
      console.log('   ✅ Event messages table accessible');
    }

  } catch (error) {
    console.log('❌ General error:', error.message);
  }
}

checkDatabaseStructure();

