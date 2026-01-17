const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load .env manually since we're in a script
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

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Supabase credentials missing in .env');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function cleanup() {
    console.log('🔄 Starting Supabase event cleanup...');

    // 1. Delete events named 'bbb'
    console.log("🔍 Searching for 'bbb' events...");
    const { data: bbbEvents, error: findError } = await supabase
        .from('events')
        .select('id, name')
        .ilike('name', '%bbb%');

    if (findError) {
        console.error('❌ Error finding bbb events:', findError.message);
    } else if (bbbEvents && bbbEvents.length > 0) {
        console.log(`🗑️ Found ${bbbEvents.length} 'bbb' events. Deleting...`);
        const { error: deleteError } = await supabase
            .from('events')
            .delete()
            .in('id', bbbEvents.map(e => e.id));

        if (deleteError) {
            console.error('❌ Error deleting bbb events:', deleteError.message);
        } else {
            console.log('✅ Specific junk events deleted.');
        }
    } else {
        console.log("ℹ️ No 'bbb' events found.");
    }

    // 2. Optional: Delete ALL events (as requested by user "delete all that are now created")
    const deleteAll = true; // Set to true as per user request "maybe restart the events and delete all that are now created"

    if (deleteAll) {
        console.log('🗑️ Deleting ALL events as requested...');
        const { error: finalDeleteError } = await supabase
            .from('events')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete everything

        if (finalDeleteError) {
            console.error('❌ Error performing general reset:', finalDeleteError.message);
        } else {
            console.log('✅ General event reset complete. All test events removed.');
        }
    }

    console.log('🏁 Cleanup process finished.');
}

cleanup();
