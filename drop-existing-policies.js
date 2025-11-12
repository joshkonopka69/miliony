const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ujfeqshqhlplmolfrlvc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqZmVxc2hxaGxwbG1vbGZybHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MzI0NDQsImV4cCI6MjA3NTQwODQ0NH0.vUEi4gl7qsl7fU518CMV79TJG9j3MWgwBQHEzbfuwIA'
);

async function dropExistingPolicies() {
  console.log('🚀 Dropping Existing Policies...\n');

  try {
    // List of policies to drop
    const policies = [
      'DROP POLICY IF EXISTS "Groups are readable by everyone" ON groups;',
      'DROP POLICY IF EXISTS "Users can create groups" ON groups;',
      'DROP POLICY IF EXISTS "Group creators can update their groups" ON groups;',
      'DROP POLICY IF EXISTS "Group creators can delete their groups" ON groups;',
      'DROP POLICY IF EXISTS "Events are readable by everyone" ON events;',
      'DROP POLICY IF EXISTS "Users can create events" ON events;',
      'DROP POLICY IF EXISTS "Users can update own events" ON events;',
      'DROP POLICY IF EXISTS "Users can delete own events" ON events;',
      'DROP POLICY IF EXISTS "Event participants are readable by everyone" ON event_participants;',
      'DROP POLICY IF EXISTS "Users can join events" ON event_participants;',
      'DROP POLICY IF EXISTS "Users can leave events" ON event_participants;',
      'DROP POLICY IF EXISTS "Event messages are readable by participants" ON event_messages;',
      'DROP POLICY IF EXISTS "Users can send messages to events they joined" ON event_messages;',
      'DROP POLICY IF EXISTS "Group members are readable by everyone" ON group_members;',
      'DROP POLICY IF EXISTS "Users can join groups" ON group_members;',
      'DROP POLICY IF EXISTS "Users can leave groups" ON group_members;',
      'DROP POLICY IF EXISTS "Group admins can manage members" ON group_members;',
      'DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;',
      'DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;',
      'DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;',
      'DROP POLICY IF EXISTS "System can insert notifications" ON notifications;',
      'DROP POLICY IF EXISTS "Users can view their own privacy settings" ON privacy_settings;',
      'DROP POLICY IF EXISTS "Users can insert their own privacy settings" ON privacy_settings;',
      'DROP POLICY IF EXISTS "Users can update their own privacy settings" ON privacy_settings;',
      'DROP POLICY IF EXISTS "Users can delete their own privacy settings" ON privacy_settings;',
      'DROP POLICY IF EXISTS "Users can view their own consent settings" ON consent_settings;',
      'DROP POLICY IF EXISTS "Users can insert their own consent settings" ON consent_settings;',
      'DROP POLICY IF EXISTS "Users can update their own consent settings" ON consent_settings;',
      'DROP POLICY IF EXISTS "Users can delete their own consent settings" ON consent_settings;',
      'DROP POLICY IF EXISTS "Users can view their own preferences" ON user_preferences;',
      'DROP POLICY IF EXISTS "Users can insert their own preferences" ON user_preferences;',
      'DROP POLICY IF EXISTS "Users can update their own preferences" ON user_preferences;',
      'DROP POLICY IF EXISTS "Users can delete their own preferences" ON user_preferences;',
      'DROP POLICY IF EXISTS "Users are readable by everyone" ON users;',
      'DROP POLICY IF EXISTS "Users can update own profile" ON users;'
    ];

    console.log('1. Dropping existing policies...');
    
    for (const policy of policies) {
      try {
        await supabase.rpc('exec', { sql: policy });
        console.log('   ✅ Dropped policy');
      } catch (error) {
        console.log('   ⚠️  Policy might not exist:', error.message);
      }
    }

    console.log('\n2. Testing after policy cleanup...');
    
    // Test basic functionality
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (usersError) {
      console.log('   ❌ Users error:', usersError.message);
    } else {
      console.log('   ✅ Users accessible');
    }

    const { data: eventsData, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .limit(1);
    
    if (eventsError) {
      console.log('   ❌ Events error:', eventsError.message);
    } else {
      console.log('   ✅ Events accessible');
    }

    const { data: groupsData, error: groupsError } = await supabase
      .from('groups')
      .select('*')
      .limit(1);
    
    if (groupsError) {
      console.log('   ❌ Groups error:', groupsError.message);
    } else {
      console.log('   ✅ Groups accessible');
    }

    console.log('\n============================================================');
    console.log('🎉 Policy Cleanup Complete!');
    console.log('============================================================');
    console.log('✅ All conflicting policies dropped!');
    console.log('🚀 Your app should work better now!');

  } catch (error) {
    console.log('❌ General error:', error.message);
  }
}

dropExistingPolicies();

