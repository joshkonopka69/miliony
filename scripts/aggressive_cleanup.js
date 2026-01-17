const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load .env manually
const envContent = fs.readFileSync(path.join(__dirname, '../.env'), 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.trim();
    }
});

const SUPABASE_URL = env['EXPO_PUBLIC_SUPABASE_URL'];
const SUPABASE_KEY = env['EXPO_PUBLIC_SUPABASE_ANON_KEY'];

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function aggressiveCleanup() {
    console.log('🔄 Starting AGGRESSIVE Supabase event cleanup...');

    // 1. Fetch current counts
    const { data: initialData } = await supabase.from('events').select('id');
    console.log(`📊 Current event count: ${initialData?.length || 0}`);

    // 2. Perform a blanket deletion of all events
    // Since this is a test/dev environment and the user explicitly asked to "restart the events and delete all that are now created"
    console.log('🗑️ Deleting ALL events from the "events" table...');

    const { error: deleteError } = await supabase
        .from('events')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Standard way to target all rows

    if (deleteError) {
        console.error('❌ Error during blanket deletion:', deleteError.message);

        // Fallback: Delete by name patterns if blanket fails (e.g. due to RLS if it was turned on)
        console.log('🔄 Attempting targeted deletion by name patterns...');
        const patterns = ['bbb', 'jej', 'bo', 'pizda', 'elo', 'jebac', 'test', 'miliony', 'hh'];
        for (const pattern of patterns) {
            const { error: pError } = await supabase
                .from('events')
                .delete()
                .ilike('name', `%${pattern}%`);
            if (pError) console.error(`❌ Failed to delete pattern "${pattern}":`, pError.message);
            else console.log(`✅ Targeted pattern "${pattern}" cleanup attempted.`);
        }
    } else {
        console.log('✅ Blanket deletion successful.');
    }

    // 3. Double check remaining
    const { data: finalData } = await supabase.from('events').select('id, name');
    console.log(`📊 Final event count: ${finalData?.length || 0}`);
    if (finalData && finalData.length > 0) {
        console.log('⚠️ Some events still remain:');
        finalData.forEach(e => console.log(`- ${e.id}: ${e.name}`));
    } else {
        console.log('✨ All events have been purged.');
    }

    console.log('🏁 Aggressive cleanup finished.');
}

aggressiveCleanup();
