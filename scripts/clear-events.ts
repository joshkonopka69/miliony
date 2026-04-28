/**
 * Script to clear all events from the database
 * Run with: npx ts-node scripts/clear-events.ts
 * Or: npx tsx scripts/clear-events.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials in .env file');
    console.log('Required: EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function clearAllEvents() {
    console.log('🗑️  Starting event cleanup...\n');

    try {
        // First, get count of events
        const { count, error: countError } = await supabase
            .from('events')
            .select('*', { count: 'exact', head: true });

        if (countError) {
            console.error('❌ Error counting events:', countError);
            return;
        }

        console.log(`📊 Found ${count} events in database`);

        if (count === 0) {
            console.log('✅ No events to delete');
            return;
        }

        // Step 1: Delete all event participants (due to foreign key constraint)
        console.log('\n🔄 Step 1: Deleting event participants...');
        const { error: participantsError } = await supabase
            .from('event_participants')
            .delete()
            .neq('user_id', '00000000-0000-0000-0000-000000000000'); // Delete all (neq dummy value)

        if (participantsError) {
            console.error('❌ Error deleting participants:', participantsError);
        } else {
            console.log('✅ All event participants deleted');
        }

        // Step 2: Delete all event messages
        console.log('\n🔄 Step 2: Deleting event messages...');
        const { error: messagesError } = await supabase
            .from('event_messages')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

        if (messagesError) {
            console.error('⚠️  Error deleting messages (may not exist):', messagesError.message);
        } else {
            console.log('✅ All event messages deleted');
        }

        // Step 3: Delete all events
        console.log('\n🔄 Step 3: Deleting all events...');
        const { error: eventsError } = await supabase
            .from('events')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

        if (eventsError) {
            console.error('❌ Error deleting events:', eventsError);
            return;
        }

        console.log('✅ All events deleted');

        // Verify cleanup
        const { count: remainingCount } = await supabase
            .from('events')
            .select('*', { count: 'exact', head: true });

        console.log(`\n📊 Remaining events: ${remainingCount}`);
        console.log('🎉 Cleanup complete!');

    } catch (error) {
        console.error('❌ Unexpected error:', error);
    }
}

// Run the script
clearAllEvents();
