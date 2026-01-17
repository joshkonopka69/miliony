const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load .env manually
const envContent = fs.readFileSync(path.join(__dirname, '../.env'), 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    const eqIndex = line.indexOf('=');
    if (eqIndex !== -1) {
        const k = line.substring(0, eqIndex).trim();
        const v = line.substring(eqIndex + 1).trim();
        env[k] = v;
    }
});

const SUPABASE_URL = env['EXPO_PUBLIC_SUPABASE_URL'];
// SERVICE_ROLE_KEY is usually EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY or similar in internal scripts
// But if it's not there, we'll try to use the anon key with a different method or just notify the user.
// WAIT: The .env likely only has the anon key. 
// If RLS is the issue, we can't delete using the anon key unless policy allows.
// However, the user is an admin of their own project.

const SUPABASE_KEY = env['EXPO_PUBLIC_SUPABASE_ANON_KEY'];

async function attemptForceDelete() {
    console.log('🔄 Attempting FORCE delete with Anon Key (hoping for open policy)...');
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    // Let's try to delete ONE specific ID first to see the error
    const testId = 'ec39541c-386c-47c4-b04f-2cae199aca5f';
    console.log(`🧪 Testing deletion of single ID: ${testId}`);

    const { error: testError } = await supabase
        .from('events')
        .delete()
        .eq('id', testId);

    if (testError) {
        console.error('❌ Test deletion failed:', testError.message);
        console.log('💡 This is likely an RLS Policy issue. I will try to delete via the "participants" link if that helps, or suggest a SQL command to the user.');
    } else {
        console.log('✅ Test deletion worked! Proceeding to blanket delete...');
        const { error: blanketError } = await supabase
            .from('events')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');

        if (blanketError) console.error('❌ Blanket delete failed:', blanketError.message);
        else console.log('✅ All events deleted.');
    }

    // Check if any remain
    const { data } = await supabase.from('events').select('id');
    console.log(`📊 Remaining events: ${data?.length || 0}`);
}

attemptForceDelete();
