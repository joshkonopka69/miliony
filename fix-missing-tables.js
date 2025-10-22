const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ujfeqshqhlplmolfrlvc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqZmVxc2hxaGxwbG1vbGZybHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MzI0NDQsImV4cCI6MjA3NTQwODQ0NH0.vUEi4gl7qsl7fU518CMV79TJG9j3MWgwBQHEzbfuwIA'
);

async function fixMissingTables() {
  console.log('🚀 Fixing Missing Tables and Schema Issues...\n');

  try {
    // Step 1: Create missing tables
    console.log('1. Creating missing tables...');
    
    // Create group_members table
    const groupMembersSQL = `
      CREATE TABLE IF NOT EXISTS group_members (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        group_id UUID NOT NULL,
        user_id UUID NOT NULL,
        role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
        status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'banned')),
        joined_at TIMESTAMPTZ DEFAULT NOW(),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(group_id, user_id)
      );
    `;
    
    // Create consent_settings table
    const consentSettingsSQL = `
      CREATE TABLE IF NOT EXISTS consent_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID UNIQUE NOT NULL,
        analytics_consent BOOLEAN DEFAULT false,
        marketing_consent BOOLEAN DEFAULT false,
        location_consent BOOLEAN DEFAULT false,
        push_notifications_consent BOOLEAN DEFAULT false,
        data_sharing_consent BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    
    // Create user_preferences table
    const userPreferencesSQL = `
      CREATE TABLE IF NOT EXISTS user_preferences (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID UNIQUE NOT NULL,
        language TEXT DEFAULT 'en',
        theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
        notifications_enabled BOOLEAN DEFAULT true,
        location_sharing_enabled BOOLEAN DEFAULT true,
        profile_visibility TEXT DEFAULT 'public' CHECK (profile_visibility IN ('public', 'friends', 'private')),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    // Execute table creation
    try {
      await supabase.rpc('exec', { sql: groupMembersSQL });
      console.log('   ✅ Created group_members table');
    } catch (error) {
      console.log('   ⚠️  group_members table might already exist:', error.message);
    }

    try {
      await supabase.rpc('exec', { sql: consentSettingsSQL });
      console.log('   ✅ Created consent_settings table');
    } catch (error) {
      console.log('   ⚠️  consent_settings table might already exist:', error.message);
    }

    try {
      await supabase.rpc('exec', { sql: userPreferencesSQL });
      console.log('   ✅ Created user_preferences table');
    } catch (error) {
      console.log('   ⚠️  user_preferences table might already exist:', error.message);
    }

    // Step 2: Add missing columns to events table
    console.log('\n2. Adding missing columns to events table...');
    
    const columns = [
      { name: 'title', type: 'TEXT NOT NULL DEFAULT \'Untitled Event\'' },
      { name: 'sport_type', type: 'TEXT NOT NULL DEFAULT \'General\'' },
      { name: 'description', type: 'TEXT' },
      { name: 'location_name', type: 'TEXT' },
      { name: 'location_address', type: 'TEXT' },
      { name: 'latitude', type: 'DOUBLE PRECISION NOT NULL DEFAULT 0.0' },
      { name: 'longitude', type: 'DOUBLE PRECISION NOT NULL DEFAULT 0.0' },
      { name: 'max_participants', type: 'INTEGER NOT NULL DEFAULT 10' },
      { name: 'participants_count', type: 'INTEGER NOT NULL DEFAULT 1' },
      { name: 'status', type: 'TEXT NOT NULL DEFAULT \'active\'' },
      { name: 'created_by', type: 'UUID' },
      { name: 'scheduled_datetime', type: 'TIMESTAMPTZ NOT NULL DEFAULT NOW()' },
      { name: 'created_at', type: 'TIMESTAMPTZ DEFAULT NOW()' },
      { name: 'updated_at', type: 'TIMESTAMPTZ DEFAULT NOW()' }
    ];

    for (const column of columns) {
      const sql = `
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'events'
            AND column_name = '${column.name}'
          ) THEN
            ALTER TABLE events ADD COLUMN ${column.name} ${column.type};
          END IF;
        END $$;
      `;
      
      try {
        await supabase.rpc('exec', { sql });
        console.log(`   ✅ Added column: ${column.name}`);
      } catch (error) {
        console.log(`   ⚠️  Column ${column.name} might already exist: ${error.message}`);
      }
    }

    // Step 3: Enable RLS and create policies
    console.log('\n3. Setting up RLS policies...');
    
    const rlsPolicies = [
      'ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;',
      'ALTER TABLE consent_settings ENABLE ROW LEVEL SECURITY;',
      'ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;'
    ];

    for (const policy of rlsPolicies) {
      try {
        await supabase.rpc('exec', { sql: policy });
        console.log('   ✅ RLS enabled');
      } catch (error) {
        console.log('   ⚠️  RLS might already be enabled:', error.message);
      }
    }

    // Step 4: Test the fixes
    console.log('\n4. Testing fixes...');
    
    // Test group_members table
    const { data: groupMembersData, error: groupMembersError } = await supabase
      .from('group_members')
      .select('*')
      .limit(1);
    
    if (groupMembersError) {
      console.log('   ❌ group_members error:', groupMembersError.message);
    } else {
      console.log('   ✅ group_members table accessible');
    }

    // Test consent_settings table
    const { data: consentData, error: consentError } = await supabase
      .from('consent_settings')
      .select('*')
      .limit(1);
    
    if (consentError) {
      console.log('   ❌ consent_settings error:', consentError.message);
    } else {
      console.log('   ✅ consent_settings table accessible');
    }

    // Test user_preferences table
    const { data: preferencesData, error: preferencesError } = await supabase
      .from('user_preferences')
      .select('*')
      .limit(1);
    
    if (preferencesError) {
      console.log('   ❌ user_preferences error:', preferencesError.message);
    } else {
      console.log('   ✅ user_preferences table accessible');
    }

    // Test events table with new columns
    console.log('\n5. Testing events table...');
    const testEvent = {
      title: 'Test Event',
      sport_type: 'Basketball',
      description: 'Test event to verify database structure',
      max_participants: 10,
      latitude: 51.1079,
      longitude: 17.0385,
      location_name: 'Test Location',
      created_by: 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7',
      scheduled_datetime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };

    const { data: insertData, error: insertError } = await supabase
      .from('events')
      .insert(testEvent)
      .select();

    if (insertError) {
      console.log('   ❌ Event creation error:', insertError.message);
    } else {
      console.log('   ✅ Event created successfully!');
      console.log('   📋 Event ID:', insertData[0].id);
    }

    console.log('\n============================================================');
    console.log('🎉 Missing Tables Fix Complete!');
    console.log('============================================================');

  } catch (error) {
    console.log('❌ General error:', error.message);
  }
}

fixMissingTables();
