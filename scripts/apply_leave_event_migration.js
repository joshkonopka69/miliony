/**
 * Apply Leave Event Migration to Supabase
 * 
 * This script applies the leave_event RPC function to your Supabase database.
 * Run this with: node scripts/apply_leave_event_migration.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing Supabase credentials in environment variables.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const MIGRATION_SQL = `
-- Function to safely leave an event and update participant count
CREATE OR REPLACE FUNCTION public.leave_event(event_uuid UUID, user_uuid UUID)
RETURNS boolean AS $$
DECLARE
  deleted_rows INTEGER;
BEGIN
  DELETE FROM public.event_participants
  WHERE event_id = event_uuid AND user_id = user_uuid;
  
  GET DIAGNOSTICS deleted_rows = ROW_COUNT;
  
  IF deleted_rows > 0 THEN
    UPDATE public.events
    SET participants_count = (
      SELECT count(*)
      FROM public.event_participants
      WHERE event_id = event_uuid
    ),
    updated_at = NOW()
    WHERE id = event_uuid;
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.leave_event(UUID, UUID) TO authenticated;
`;

async function applyMigration() {
    console.log('Applying leave_event migration...');

    const { data, error } = await supabase.rpc('exec_sql', { sql: MIGRATION_SQL });

    if (error) {
        console.error('Migration failed via RPC:', error.message);
        console.log('\n--- MANUAL STEP REQUIRED ---');
        console.log('Please run the following SQL in your Supabase SQL Editor:\n');
        console.log(MIGRATION_SQL);
        console.log('\n--- END OF SQL ---');
        return;
    }

    console.log('Migration applied successfully!');
}

applyMigration();
