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

async function findCreator() {
    console.log('🔍 Identifying the creator of the persistent events...');

    const { data, error } = await supabase
        .from('events')
        .select('id, name, created_by')
        .ilike('name', '%bbb%')
        .limit(1);

    if (error) {
        console.error('❌ Error:', error.message);
        return;
    }

    if (data && data.length > 0) {
        const creatorId = data[0].created_by;
        console.log(`✅ Event found! Creator ID: ${creatorId}`);

        // Now try to fetch user info for this creator
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', creatorId)
            .single();

        if (userError) {
            console.log(`ℹ️ User profile not found for creator ${creatorId}. It might be a direct Auth ID or an orphaned reference.`);
        } else {
            console.log(`👤 Creator Profile: Name: ${userData.display_name}, Email: ${userData.email}`);
        }
    } else {
        console.log('ℹ️ No "bbb" events found right now. Wait for them to reappear or check the full list.');
    }
}

findCreator();
