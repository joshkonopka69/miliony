const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load .env manually
const envContent = fs.readFileSync(path.join(__dirname, '../.env'), 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const eqIndex = line.indexOf('=');
    if (eqIndex !== -1) {
        const k = line.substring(0, eqIndex).trim();
        const v = line.substring(eqIndex + 1).trim();
        env[k] = v;
    }
});

const SUPABASE_URL = env['EXPO_PUBLIC_SUPABASE_URL'];
const SUPABASE_KEY = env['EXPO_PUBLIC_SUPABASE_ANON_KEY'];

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function finalPurge() {
    console.log('🔄 Starting FINAL PURGE of all events...');

    // 1. Get all IDs
    const { data: events, error: fetchError } = await supabase.from('events').select('id, name');
    if (fetchError) {
        console.error('❌ Fetch failed:', fetchError.message);
        return;
    }

    if (!events || events.length === 0) {
        console.log('✨ No events found to delete.');
        return;
    }

    console.log(`📊 Found ${events.length} events. Deleting one by one...`);

    for (const event of events) {
        console.log(`🗑️ Deleting event [${event.id}] "${event.name}"...`);

        // Attempt specific delete
        const { error: delError } = await supabase
            .from('events')
            .delete()
            .eq('id', event.id);

        if (delError) {
            console.error(`  ❌ Failed to delete ${event.id}: ${delError.message}`);

            // If it's a foreign key constraint, we might need to delete participants first
            if (delError.message.toLowerCase().includes('foreign key')) {
                console.log(`  🔗 Attempting to clear participants for ${event.id} first...`);
                const { error: partError } = await supabase
                    .from('event_participants')
                    .delete()
                    .eq('event_id', event.id);

                if (partError) {
                    console.error(`  ❌ Failed to clear participants: ${partError.message}`);
                } else {
                    console.log(`  ✅ Participants cleared. Retrying event delete...`);
                    const { error: retryError } = await supabase
                        .from('events')
                        .delete()
                        .eq('id', event.id);
                    if (retryError) console.error(`  ❌ Retry failed: ${retryError.message}`);
                    else console.log(`  ✅ Successfully deleted ${event.id} on retry.`);
                }
            }
        } else {
            console.log(`  ✅ Deleted.`);
        }
    }

    // Final verification
    const { data: finalCheck } = await supabase.from('events').select('id');
    console.log(`📊 Final count: ${finalCheck?.length || 0}`);
}

finalPurge();
