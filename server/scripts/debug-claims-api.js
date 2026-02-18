const supabase = require('../config/supabase');
const fs = require('fs');
const path = require('path');

async function debugClaims() {
    let output = '--- CLAIMS API DEBUG ---\n';
    try {
        // 1. Test POST (Submission)
        output += '\n1. Testing POST /api/claims...\n';
        const testPayload = {
            client_name: 'Test user',
            email: 'test@example.com',
            phone: '1234567890',
            type: 'Health Claim',
            status: 'Pending'
        };
        const { error: postError } = await supabase.from('claims').insert([testPayload]);
        if (postError) {
            output += `POST Error: ${JSON.stringify(postError, null, 2)}\n`;
        } else {
            output += `POST Success!\n`;
        }

        // 2. Test PUT (Update)
        output += '\n2. Testing PUT /api/claims/:id...\n';
        const { data: claims } = await supabase.from('claims').select('id').limit(1);
        if (claims && claims.length > 0) {
            const id = claims[0].id;
            output += `Testing update for ID: ${id}\n`;

            // Simulating the fetch in PUT
            const { data: c, error: fErr } = await supabase.from('claims').select('*').eq('id', id).single();
            if (fErr) {
                output += `Fetch Error: ${JSON.stringify(fErr, null, 2)}\n`;
            } else {
                output += `Fetch Success, email: ${c.email}, phone: ${c.phone}\n`;
            }
        } else {
            output += 'No claims to test update.\n';
        }

    } catch (err) {
        output += `FATAL: ${err.message}\n`;
    }
    fs.writeFileSync(path.join(__dirname, 'diagnostic_result.txt'), output);
    console.log('Debug finished.');
    process.exit(0);
}

debugClaims();
