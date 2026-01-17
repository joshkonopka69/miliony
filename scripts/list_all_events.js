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

async function listAllEvents() {
    console.log('🔍 Fetching EVERY SINGLE event from Supabase (ignoring status filters)...');

    const { data, error } = await supabase
        .from('events')
        .select('*');

    if (error) {
        console.error('❌ Error:', error.message);
        return;
    }

    if (data && data.length > 0) {
        console.log(`✅ Found ${data.length} events:`);
        data.forEach(e => {
            console.log(`- [${e.id}] Name: "${e.name || e.title}" | Status: ${e.status} | Location: ${e.location_name || e.place_name}`);
        });
    } else {
        console.log('ℹ️ No events found in the database.');
    }
}

listAllEvents();
