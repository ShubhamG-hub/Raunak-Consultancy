const supabase = require('../config/supabase');
const fs = require('fs');
const path = require('path');

async function testClaimUpdate() {
    let output = '--- CLAIM UPDATE TEST ---\n';
    try {
        // 1. Get a claim ID
        const { data: claims, error: cErr } = await supabase.from('claims').select('*').limit(1);
        if (cErr || !claims.length) {
            output += `NO CLAIMS FOUND: ${cErr ? cErr.message : 'Empty table'}\n`;
            fs.writeFileSync(path.join(__dirname, 'diagnostic_result.txt'), output);
            process.exit(0);
        }

        const claimId = claims[0].id;
        output += `Found Claim: ${JSON.stringify(claims[0], null, 2)}\n`;

        // 2. Try update status to something common
        const testStatus = 'Processing';
        const { data, error } = await supabase
            .from('claims')
            .update({ status: testStatus, admin_notes: 'Diagnostic update' })
            .eq('id', claimId)
            .select();

        if (error) {
            output += `UPDATE ERROR: ${JSON.stringify(error, null, 2)}\n`;
        } else {
            output += `UPDATE SUCCESS: ${JSON.stringify(data, null, 2)}\n`;
        }
    } catch (err) {
        output += `FATAL: ${err.message}\n`;
    }
    fs.writeFileSync(path.join(__dirname, 'diagnostic_result.txt'), output);
    console.log('Test finished.');
    process.exit(0);
}

testClaimUpdate();
