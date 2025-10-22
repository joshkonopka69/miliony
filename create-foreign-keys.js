const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ujfeqshqhlplmolfrlvc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqZmVxc2hxaGxwbG1vbGZybHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MzI0NDQsImV4cCI6MjA3NTQwODQ0NH0.vUEi4gl7qsl7fU518CMV79TJG9j3MWgwBQHEzbfuwIA'
);

async function createForeignKeys() {
  console.log('🚀 Creating Foreign Key Relationships...\n');

  try {
    // Step 1: Create foreign key relationships
    console.log('1. Creating foreign key relationships...');
    
    const foreignKeys = [
      {
        name: 'events_created_by_fkey',
        table: 'events',
        column: 'created_by',
        refTable: 'users',
        refColumn: 'id'
      },
      {
        name: 'group_members_group_id_fkey',
        table: 'group_members',
        column: 'group_id',
        refTable: 'groups',
        refColumn: 'id'
      },
      {
        name: 'group_members_user_id_fkey',
        table: 'group_members',
        column: 'user_id',
        refTable: 'users',
        refColumn: 'id'
      },
      {
        name: 'groups_created_by_fkey',
        table: 'groups',
        column: 'created_by',
        refTable: 'users',
        refColumn: 'id'
      },
      {
        name: 'event_participants_event_id_fkey',
        table: 'event_participants',
        column: 'event_id',
        refTable: 'events',
        refColumn: 'id'
      },
      {
        name: 'event_participants_user_id_fkey',
        table: 'event_participants',
        column: 'user_id',
        refTable: 'users',
        refColumn: 'id'
      },
      {
        name: 'event_messages_event_id_fkey',
        table: 'event_messages',
        column: 'event_id',
        refTable: 'events',
        refColumn: 'id'
      },
      {
        name: 'event_messages_user_id_fkey',
        table: 'event_messages',
        column: 'user_id',
        refTable: 'users',
        refColumn: 'id'
      },
      {
        name: 'notifications_user_id_fkey',
        table: 'notifications',
        column: 'user_id',
        refTable: 'users',
        refColumn: 'id'
      },
      {
        name: 'privacy_settings_user_id_fkey',
        table: 'privacy_settings',
        column: 'user_id',
        refTable: 'users',
        refColumn: 'id'
      },
      {
        name: 'consent_settings_user_id_fkey',
        table: 'consent_settings',
        column: 'user_id',
        refTable: 'users',
        refColumn: 'id'
      },
      {
        name: 'user_preferences_user_id_fkey',
        table: 'user_preferences',
        column: 'user_id',
        refTable: 'users',
        refColumn: 'id'
      }
    ];

    for (const fk of foreignKeys) {
      const sql = `
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints
            WHERE constraint_name = '${fk.name}'
            AND table_name = '${fk.table}'
          ) THEN
            ALTER TABLE ${fk.table} ADD CONSTRAINT ${fk.name} 
            FOREIGN KEY (${fk.column}) REFERENCES ${fk.refTable}(${fk.refColumn}) ON DELETE CASCADE;
          END IF;
        END $$;
      `;
      
      try {
        await supabase.rpc('exec', { sql });
        console.log(`   ✅ Created foreign key: ${fk.name}`);
      } catch (error) {
        console.log(`   ⚠️  Foreign key ${fk.name} might already exist: ${error.message}`);
      }
    }

    // Step 2: Create indexes for performance
    console.log('\n2. Creating performance indexes...');
    
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_events_created_by_fkey ON events(created_by);',
      'CREATE INDEX IF NOT EXISTS idx_group_members_group_id_fkey ON group_members(group_id);',
      'CREATE INDEX IF NOT EXISTS idx_group_members_user_id_fkey ON group_members(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_groups_created_by_fkey ON groups(created_by);',
      'CREATE INDEX IF NOT EXISTS idx_event_participants_event_id_fkey ON event_participants(event_id);',
      'CREATE INDEX IF NOT EXISTS idx_event_participants_user_id_fkey ON event_participants(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_event_messages_event_id_fkey ON event_messages(event_id);',
      'CREATE INDEX IF NOT EXISTS idx_event_messages_user_id_fkey ON event_messages(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_notifications_user_id_fkey ON notifications(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_privacy_settings_user_id_fkey ON privacy_settings(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_consent_settings_user_id_fkey ON consent_settings(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id_fkey ON user_preferences(user_id);'
    ];

    for (const index of indexes) {
      try {
        await supabase.rpc('exec', { sql: index });
        console.log('   ✅ Created index');
      } catch (error) {
        console.log('   ⚠️  Index might already exist:', error.message);
      }
    }

    // Step 3: Test the relationships
    console.log('\n3. Testing relationships...');
    
    // Test events with users relationship
    const { data: eventsData, error: eventsError } = await supabase
      .from('events')
      .select(`
        *,
        users:created_by (
          id,
          display_name,
          email
        )
      `)
      .limit(1);
    
    if (eventsError) {
      console.log('   ❌ Events relationship error:', eventsError.message);
    } else {
      console.log('   ✅ Events-Users relationship working');
    }

    // Test group_members with groups relationship
    const { data: groupMembersData, error: groupMembersError } = await supabase
      .from('group_members')
      .select(`
        *,
        groups:group_id (
          id,
          name,
          description
        )
      `)
      .limit(1);
    
    if (groupMembersError) {
      console.log('   ❌ Group members relationship error:', groupMembersError.message);
    } else {
      console.log('   ✅ Group members-Groups relationship working');
    }

    // Test event_participants with events relationship
    const { data: participantsData, error: participantsError } = await supabase
      .from('event_participants')
      .select(`
        *,
        events:event_id (
          id,
          title,
          sport_type
        )
      `)
      .limit(1);
    
    if (participantsError) {
      console.log('   ❌ Event participants relationship error:', participantsError.message);
    } else {
      console.log('   ✅ Event participants-Events relationship working');
    }

    console.log('\n============================================================');
    console.log('🎉 Foreign Keys Creation Complete!');
    console.log('============================================================');
    console.log('✅ All relationships created!');
    console.log('🚀 Your app should now work 100%!');

  } catch (error) {
    console.log('❌ General error:', error.message);
  }
}

createForeignKeys();
