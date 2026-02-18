const supabase = require('../config/supabase');

async function listClaimsColumns() {
    try {
        const { data, error } = await supabase.rpc('get_table_columns', { table_name: 'claims' });

        // If RPC doesn't exist, try a simple select
        if (error) {
            const { data: claim, error: selError } = await supabase.from('claims').select('*').limit(1);
            if (selError) {
                console.error('Error fetching claims columns:', selError);
            } else {
                console.log('Columns in claims table:', Object.keys(claim[0] || {}));
            }
        } else {
            console.log('Columns for claims:', data);
        }
    } catch (err) {
        console.error('Fatal error:', err);
    }
    process.exit(0);
}

listClaimsColumns();
