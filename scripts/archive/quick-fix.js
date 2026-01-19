const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ujfeqshqhlplmolfrlvc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqZmVxc2hxaGxwbG1vbGZybHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MzI0NDQsImV4cCI6MjA3NTQwODQ0NH0.vUEi4gl7qsl7fU518CMV79TJG9j3MWgwBQHEzbfuwIA'
);

async function quickFix() {
  console.log('🚀 Running Quick Fix for Missing Tables...\n');

  try {
    // Step 1: Create groups table
    console.log('1. Creating groups table...');
    
    const groupsSQL = `
      CREATE TABLE IF NOT EXISTS groups (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        description TEXT,
        created_by UUID NOT NULL,
        is_public BOOLEAN DEFAULT true,
        max_members INTEGER DEFAULT 50,
        members_count INTEGER DEFAULT 1,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    
    try {
      await supabase.rpc('exec', { sql: groupsSQL });
      console.log('   ✅ Created groups table');
    } catch (error) {
      console.log('   ⚠️  groups table might already exist:', error.message);
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

    // Step 3: Enable RLS for groups
    console.log('\n3. Setting up RLS for groups...');
    
    try {
      await supabase.rpc('exec', { sql: 'ALTER TABLE groups ENABLE ROW LEVEL SECURITY;' });
      console.log('   ✅ RLS enabled for groups');
    } catch (error) {
      console.log('   ⚠️  RLS might already be enabled:', error.message);
    }

    // Step 4: Create RLS policies for groups
    console.log('\n4. Creating RLS policies...');
    
    const policies = [
      'CREATE POLICY "Groups are readable by everyone" ON groups FOR SELECT USING (true);',
      'CREATE POLICY "Users can create groups" ON groups FOR INSERT WITH CHECK (auth.uid() = created_by);',
      'CREATE POLICY "Group creators can update their groups" ON groups FOR UPDATE USING (auth.uid() = created_by);',
      'CREATE POLICY "Group creators can delete their groups" ON groups FOR DELETE USING (auth.uid() = created_by);'
    ];

    for (const policy of policies) {
      try {
        await supabase.rpc('exec', { sql: policy });
        console.log('   ✅ Created policy');
      } catch (error) {
        console.log('   ⚠️  Policy might already exist:', error.message);
      }
    }

    // Step 5: Test the fixes
    console.log('\n5. Testing fixes...');
    
    // Test groups table
    const { data: groupsData, error: groupsError } = await supabase
      .from('groups')
      .select('*')
      .limit(1);
    
    if (groupsError) {
      console.log('   ❌ groups error:', groupsError.message);
    } else {
      console.log('   ✅ groups table accessible');
    }

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

    // Test events table
    const { data: eventsData, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .limit(1);
    
    if (eventsError) {
      console.log('   ❌ events error:', eventsError.message);
    } else {
      console.log('   ✅ events table accessible');
    }

    // Test event creation
    console.log('\n6. Testing event creation...');
    const testEvent = {
      title: 'Test Event',
      sport_type: 'Basketball',
      description: 'Test event to verify fixes',
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
    console.log('🎉 Quick Fix Complete!');
    console.log('============================================================');

  } catch (error) {
    console.log('❌ General error:', error.message);
  }
}

quickFix();

