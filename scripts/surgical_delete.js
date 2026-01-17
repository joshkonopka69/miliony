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

const junkNames = ['Bbb', 'Jej', 'Bo', 'Pizda', 'Elo', 'Jebac', 'Test', 'Miliony', 'Hh', 'Gh'];

async function surgicalDelete() {
    console.log('🔬 Starting SURGICAL delete of identified junk events...');

    // 1. Fetch current junk events
    const { data: events, error: fetchError } = await supabase
        .from('events')
        .select('id, name');

    if (fetchError) {
        console.error('❌ Fetch failed:', fetchError.message);
        return;
    }

    const toDelete = events.filter(e => {
        const name = e.name || '';
        return junkNames.some(junk => name.toLowerCase().includes(junk.toLowerCase()));
    });

    if (toDelete.length === 0) {
        console.log('✨ No junk events found matching the criteria.');
        return;
    }

    console.log(`📊 Found ${toDelete.length} junk events. Deleting surgically...`);

    for (const event of toDelete) {
        console.log(`🗑️ Deleting [${event.id}] "${event.name}"...`);

        // Using .select() to see if deletion actually happens
        const { data: deletedRows, error: delError } = await supabase
            .from('events')
            .delete()
            .eq('id', event.id)
            .select();

        if (delError) {
            console.error(`  ❌ Error: ${delError.message}`);
        } else if (deletedRows && deletedRows.length > 0) {
            console.log(`  ✅ Successfully deleted ${deletedRows.length} row(s).`);
        } else {
            console.log(`  ⚠️ Delete reported success but 0 rows were affected. (Possible RLS issue)`);

            // Try clearing participants first just in case
            console.log(`  🔗 Trying to clear participants for ${event.id} first...`);
            const { data: pDeleted, error: pError } = await supabase
                .from('event_participants')
                .delete()
                .eq('event_id', event.id)
                .select();

            if (pError) {
                console.error(`  ❌ Participant clear error: ${pError.message}`);
            } else {
                console.log(`  ✅ Participants cleared (${pDeleted?.length || 0} rows). Retrying event delete...`);
                const { data: finalDeleted, error: finalError } = await supabase
                    .from('events')
                    .delete()
                    .eq('id', event.id)
                    .select();

                if (finalError) console.error(`  ❌ Final retry failed: ${finalError.message}`);
                else if (finalDeleted && finalDeleted.length > 0) console.log(`  ✅ Successfully deleted on retry.`);
                else console.log(`  ❌ Final retry also affected 0 rows.`);
            }
        }
    }

    // 2. Final check
    const { data: finalCheck } = await supabase.from('events').select('id, name');
    const remainingJunk = finalCheck.filter(e => {
        const name = e.name || '';
        return junkNames.some(junk => name.toLowerCase().includes(junk.toLowerCase()));
    });

    console.log(`📊 Final Check: ${finalCheck?.length || 0} total events, ${remainingJunk.length} junk remaining.`);
    if (remainingJunk.length > 0) {
        remainingJunk.forEach(e => console.log(`- Still here: ${e.id} (${e.name})`));
    }
}

surgicalDelete();
