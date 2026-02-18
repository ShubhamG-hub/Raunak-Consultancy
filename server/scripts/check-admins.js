const supabase = require('../config/supabase');

async function checkAdmins() {
    console.log('--- ADMIN CHECK ---');
    try {
        const { data, error } = await supabase.from('admins').select('email, name, role');
        if (error) {
            console.error('Error fetching admins:', error.message);
        } else {
            console.log('Admins found:', data);
        }
    } catch (err) {
        console.error('Fatal error:', err.message);
    }
    process.exit(0);
}

checkAdmins();
