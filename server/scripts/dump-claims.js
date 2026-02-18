const supabase = require('../config/supabase');

async function dumpClaims() {
    try {
        const { data, error } = await supabase.from('claims').select('*').order('created_at', { ascending: false }).limit(5);
        if (error) {
            console.error('Error fetching claims:', error);
        } else {
            console.log('Recent Claims:', JSON.stringify(data, null, 2));
        }
    } catch (err) {
        console.error('Fatal error:', err);
    }
    process.exit(0);
}

dumpClaims();
