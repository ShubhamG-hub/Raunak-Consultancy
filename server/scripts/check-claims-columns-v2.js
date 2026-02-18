const supabase = require('../config/supabase');

async function checkColumns() {
    try {
        // Querying information_schema to see all columns
        const { data, error } = await supabase.rpc('run_sql', {
            sql_query: "SELECT column_name FROM information_schema.columns WHERE table_name = 'claims'"
        });

        if (error) {
            // If run_sql RPC doesn't exist, we'll try a different approach
            console.warn('RPC run_sql not available, trying select method...');
            const { data: testData, error: testErr } = await supabase.from('claims').select('*').limit(0);
            if (testErr) {
                console.error('Error Checking columns:', testErr);
            } else {
                // This doesn't work if there are no rows, but sometimes Supabase returns empty objects with keys?
                // Actually, let's try a different trick: insert then rollback or just insert a dummy and delete.
                console.log('Using select approach...');
                // We'll just try to insert a dummy row with email and see if it fails
                const { error: insErr } = await supabase.from('claims').insert([{ client_name: 'Column Check', email: 'test@test.com', phone: '123', type: 'Other' }]);
                if (insErr && insErr.code === 'PGRST204') {
                    console.log('RESULT: Columns email/phone ARE MISSING (PGRST204).');
                } else if (insErr) {
                    console.log('RESULT: Different error:', insErr.message);
                } else {
                    console.log('RESULT: Columns email/phone ARE PRESENT (Insertion succeeded).');
                    // Clean up
                    await supabase.from('claims').delete().eq('client_name', 'Column Check');
                }
            }
        } else {
            console.log('Columns found via SQL:', data.map(c => c.column_name));
        }
    } catch (err) {
        console.error('Fatal error:', err);
    }
    process.exit(0);
}

checkColumns();
