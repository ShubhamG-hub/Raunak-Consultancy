const supabase = require('../config/supabase');

async function testEndToEnd() {
    console.log('--- STARTING E2E CLAIM TEST ---');
    try {
        // 1. Submit a new claim
        const testEmail = `test_${Date.now()}@example.com`;
        const testPayload = {
            client_name: 'E2E Tester',
            email: testEmail,
            phone: '9876543210',
            type: 'Health Claim',
            description: 'Testing persistence and notifications'
        };

        console.log('\nSTEP 1: Submitting Claim...');
        const { data: newClaim, error: postErr } = await supabase
            .from('claims')
            .insert([{ ...testPayload, status: 'Pending' }])
            .select();

        if (postErr) {
            console.error('❌ POST Failed:', postErr.message);
            if (postErr.code === 'PGRST204') console.log('HINT: Columns are truly missing.');
            return;
        }

        const claimId = newClaim[0].id;
        console.log('✅ Claim Submitted! ID:', claimId);
        console.log('Initial Status:', newClaim[0].status);
        console.log('Stored Email:', newClaim[0].email);

        // 2. Update the status
        console.log('\nSTEP 2: Updating Status to "Processing"...');
        const { data: updatedClaim, error: putErr } = await supabase
            .from('claims')
            .update({ status: 'Processing', admin_notes: 'Checking notification' })
            .eq('id', claimId)
            .select();

        if (putErr) {
            console.error('❌ PUT Failed:', putErr.message);
        } else {
            console.log('✅ Update Success!');
            console.log('New Status:', updatedClaim[0].status);

            // Check if status changed as expected for notification
            if (newClaim[0].status !== updatedClaim[0].status) {
                console.log('✅ TRACE: Notification trigger condition (status change) was MET.');
            }
        }

        // Clean up
        // await supabase.from('claims').delete().eq('id', claimId);

    } catch (err) {
        console.error('Fatal Test Error:', err);
    }
    process.exit(0);
}

testEndToEnd();
