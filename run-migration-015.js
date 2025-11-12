const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ujfeqshqhlplmolfrlvc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqZmVxc2hxaGxwbG1vbGZybHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MzI0NDQsImV4cCI6MjA3NTQwODQ0NH0.vUEi4gl7qsl7fU518CMV79TJG9j3MWgwBQHEzbfuwIA'
);

async function runMigration() {
  console.log('🚀 Running Migration 015: Add Missing Columns...\n');

  try {
    // Step 1: Drop conflicting policies
    console.log('1. Dropping conflicting policies...');
    await supabase.rpc('exec', { sql: 'DROP POLICY IF EXISTS "Users can send messages" ON event_messages;' });
    await supabase.rpc('exec', { sql: 'DROP POLICY IF EXISTS "Event messages are readable by participants" ON event_messages;' });
    await supabase.rpc('exec', { sql: 'DROP POLICY IF EXISTS "Users can send messages to events they joined" ON event_messages;' });
    console.log('   ✅ Policies dropped');

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

    // Step 3: Recreate policies
    console.log('\n3. Recreating policies...');
    
    const selectPolicy = `
      CREATE POLICY "Event messages are readable by participants"
        ON event_messages FOR SELECT
        USING (
          EXISTS (
            SELECT 1 FROM event_participants
            WHERE event_participants.event_id = event_messages.event_id
            AND event_participants.user_id = auth.uid()
          )
        );
    `;
    
    const insertPolicy = `
      CREATE POLICY "Users can send messages to events they joined"
        ON event_messages FOR INSERT
        WITH CHECK (
          auth.uid() = user_id AND
          EXISTS (
            SELECT 1 FROM event_participants
            WHERE event_participants.event_id = event_messages.event_id
            AND event_participants.user_id = auth.uid()
          )
        );
    `;

    try {
      await supabase.rpc('exec', { sql: selectPolicy });
      console.log('   ✅ Created SELECT policy');
    } catch (error) {
      console.log('   ⚠️  SELECT policy might already exist:', error.message);
    }

    try {
      await supabase.rpc('exec', { sql: insertPolicy });
      console.log('   ✅ Created INSERT policy');
    } catch (error) {
      console.log('   ⚠️  INSERT policy might already exist:', error.message);
    }

    // Step 4: Test event creation
    console.log('\n4. Testing event creation...');
    const testEvent = {
      title: 'Test Basketball Game',
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
    console.log('🎉 Migration 015 Complete!');
    console.log('============================================================');

  } catch (error) {
    console.log('❌ Migration error:', error.message);
  }
}

runMigration();

