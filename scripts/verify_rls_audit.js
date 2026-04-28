const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ujfeqshqhlplmolfrlvc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqZmVxc2hxaGxwbG1vbGZybHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MzI0NDQsImV4cCI6MjA3NTQwODQ0NH0.vUEi4gl7qsl7fU518CMV79TJG9j3MWgwBQHEzbfuwIA';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const TABLES_TO_CHECK = [
    'user_blocks',
    'user_reports',
    'user_activities',
    'sports',
    'security_threats',
    'security_events',
    'security_rules',
    'security_alerts',
    'rate_limits',
    'blocked_ips',
    'security_config',
    'report_categories',
    'report_templates',
    'report_submissions',
    'content_moderation',
    'moderation_queue',
    'moderation_actions',
    'user_moderation_status',
    'appeal_requests',
    'user_preferences'
];

async function verifyRLS() {
    console.log('🛡️ Starting RLS Security Audit...\n');
    console.log('--------------------------------------------------');

    let tablesFound = 0;
    let rlsConfirmed = 0;

    for (const table of TABLES_TO_CHECK) {
        process.stdout.write(`Checking [${table}]... `);

        try {
            // Attempt to select from table to see if it exists
            const { data, error } = await supabase.from(table).select('*').limit(1);

            if (error) {
                if (error.code === 'PGRST116' || error.message.includes('not found') || error.message.includes('does not exist')) {
                    console.log('❌ MISSING');
                } else if (error.message.includes('row-level security')) {
                    console.log('✅ RLS ACTIVE (Access Denied)');
                    tablesFound++;
                    rlsConfirmed++;
                } else {
                    console.log(`⚠️ ERROR: ${error.message}`);
                    tablesFound++;
                }
            } else {
                // Successful select might mean RLS is NOT active OR table is public OR table is empty
                if (table === 'sports') {
                    console.log('✅ PUBLIC ACCESS (Expected)');
                } else {
                    console.log('🟡 ACCESSIBLE (May need RLS check)');
                }
                tablesFound++;
            }
        } catch (err) {
            console.log(`❌ FAILED: ${err.message}`);
        }
    }

    console.log('\n--------------------------------------------------');
    console.log(`Audit Summary:`);
    console.log(`- Tables Found: ${tablesFound}/${TABLES_TO_CHECK.length}`);
    console.log(`- RLS Likely Active: ${rlsConfirmed} tables`);
    console.log('--------------------------------------------------\n');

    console.log('Performing Mock Attack: Attempting unauthenticated INSERT into user_blocks...');
    const { error: insertError } = await supabase.from('user_blocks').insert({
        user_id: '00000000-0000-0000-0000-000000000000',
        blocked_user_id: '00000000-0000-0000-0000-000000000001'
    });

    if (insertError) {
        console.log(`✅ ATTACK THWARTED: ${insertError.message}`);
    } else {
        console.log('❌ SECURITY VULNERABILITY: Unauthenticated insert into user_blocks succeeded!');
    }
}

verifyRLS();
