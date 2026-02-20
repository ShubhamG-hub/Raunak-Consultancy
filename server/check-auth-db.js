const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

async function check() {
    console.log('--- Database Diagnostic ---');

    // 1. Check profiles table
    console.log('Checking profiles table...');
    const { data: profiles, error: pError } = await supabase
        .from('profiles')
        .select('*')
        .limit(5);

    if (pError) {
        console.error('Error fetching profiles:', pError.message);
    } else {
        console.log(`Profiles found: ${profiles.length}`);
        console.log('Sample profiles:', profiles);
    }

    // 2. Check admins table
    console.log('\nChecking admins table...');
    const { data: admins, error: aError } = await supabase
        .from('admins')
        .select('email, role')
        .limit(5);

    if (aError) {
        console.error('Error fetching admins:', aError.message);
    } else {
        console.log(`Admins found: ${admins.length}`);
        console.log('Sample admins:', admins);
    }

    // 3. Simple Auth check (listing users requires admin access/service key)
    console.log('\nChecking Auth Users list...');
    const { data: { users }, error: uError } = await supabase.auth.admin.listUsers();

    if (uError) {
        console.error('Error listing users (check service_role key):', uError.message);
    } else {
        console.log(`Total users in Auth: ${users.length}`);
        for (const u of users) {
            console.log(`- ${u.email} (${u.id}) - Confirmed: ${!!u.email_confirmed_at}`);
            if (!u.email_confirmed_at) {
                console.log(`  Confirming email for ${u.email}...`);
                const { error: cError } = await supabase.auth.admin.updateUserById(
                    u.id,
                    { email_confirm: true }
                );
                if (cError) console.error(`  Failed to confirm: ${cError.message}`);
                else console.log(`  Email confirmed successfully!`);
            }
        }
    }
}

check();
