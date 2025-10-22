const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ujfeqshqhlplmolfrlvc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqZmVxc2hxaGxwbG1vbGZybHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MzI0NDQsImV4cCI6MjA3NTQwODQ0NH0.vUEi4gl7qsl7fU518CMV79TJG9j3MWgwBQHEzbfuwIA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('\n🔍 Testing Supabase Connection...\n');
  console.log('URL:', supabaseUrl);
  console.log('Key:', supabaseAnonKey.substring(0, 20) + '...\n');
  
  try {
    // Test 1: Check if we can query users table
    console.log('Test 1: Checking users table...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (usersError) {
      console.log('❌ Users table error:', usersError.message);
      console.log('   Code:', usersError.code);
    } else {
      console.log('✅ Users table accessible');
    }

    // Test 2: Check new tables from migration
    console.log('\nTest 2: Checking groups table...');
    const { data: groups, error: groupsError } = await supabase
      .from('groups')
      .select('id')
      .limit(1);
    
    if (groupsError) {
      console.log('❌ Groups table error:', groupsError.message);
      console.log('   Code:', groupsError.code);
      console.log('   ⚠️  You need to run the migration!');
    } else {
      console.log('✅ Groups table exists');
    }

    // Test 3: Check group_members table
    console.log('\nTest 3: Checking group_members table...');
    const { data: groupMembers, error: groupMembersError } = await supabase
      .from('group_members')
      .select('id')
      .limit(1);
    
    if (groupMembersError) {
      console.log('❌ Group_members table error:', groupMembersError.message);
      console.log('   Code:', groupMembersError.code);
      console.log('   ⚠️  You need to run the migration!');
    } else {
      console.log('✅ Group_members table exists');
    }

    // Test 4: Check consent_settings table
    console.log('\nTest 4: Checking consent_settings table...');
    const { data: consent, error: consentError } = await supabase
      .from('consent_settings')
      .select('id')
      .limit(1);
    
    if (consentError) {
      console.log('❌ Consent_settings table error:', consentError.message);
      console.log('   Code:', consentError.code);
      console.log('   ⚠️  You need to run the migration!');
    } else {
      console.log('✅ Consent_settings table exists');
    }

    // Test 5: Check events.scheduled_datetime column
    console.log('\nTest 5: Checking events.scheduled_datetime column...');
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('scheduled_datetime')
      .limit(1);
    
    if (eventsError) {
      console.log('❌ Events.scheduled_datetime error:', eventsError.message);
      console.log('   Code:', eventsError.code);
      console.log('   ⚠️  You need to run the migration!');
    } else {
      console.log('✅ Events.scheduled_datetime column exists');
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ Connection test complete!');
    console.log('='.repeat(50) + '\n');
    
    // Summary
    const allPassed = !usersError && !groupsError && !groupMembersError && !consentError && !eventsError;
    
    if (allPassed) {
      console.log('🎉 All tests passed! Your Supabase connection is working perfectly.');
    } else {
      console.log('\n⚠️  MIGRATION NEEDED!');
      console.log('\nTo fix:');
      console.log('1. Open Supabase Dashboard → SQL Editor');
      console.log('2. Copy content from: supabase/migrations/001_fix_schema_issues.sql');
      console.log('3. Paste and click "Run"');
      console.log('4. Restart your app: npx expo start --clear\n');
    }
    
  } catch (error) {
    console.error('\n❌ CRITICAL ERROR - Connection failed:', error.message);
    console.log('\nPossible causes:');
    console.log('- Network/internet connection issue');
    console.log('- Firewall blocking connection');
    console.log('- Supabase project is paused or deleted');
    console.log('- Invalid API credentials\n');
  }
}

testConnection();



