const supabase = require('../config/supabase');
const bcrypt = require('bcryptjs');

async function insertAdmin() {
    const email = 'ms.sudhirgupta@rediffmail.com';
    const password = 'admin@1277899';
    const name = 'Sudhir Gupta';

    console.log(`--- Seeding Admin: ${email} ---`);

    try {
        const password_hash = await bcrypt.hash(password, 10);

        const { data, error } = await supabase
            .from('admins')
            .upsert({
                email,
                password_hash,
                name,
                role: 'Administrator'
            }, { onConflict: 'email' })
            .select();

        if (error) {
            console.error('Error inserting admin:', error.message);
        } else {
            console.log('Admin successfully seeded/updated in database!', data);
        }
    } catch (err) {
        console.error('Fatal error:', err.message);
    }
    process.exit(0);
}

insertAdmin();
