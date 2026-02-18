const supabase = require('../config/supabase');
const fs = require('fs');
const path = require('path');

async function testInsert() {
    let output = '--- MESSAGE INSERT TEST (NO METADATA) ---\n';
    try {
        const { data: sessions, error: sErr } = await supabase.from('chat_sessions').select('id').limit(1);
        if (sErr || !sessions.length) {
            output += `NO SESSION FOUND\n`;
            fs.writeFileSync(path.join(__dirname, 'diagnostic_result.txt'), output);
            process.exit(0);
        }

        const sessionId = sessions[0].id;
        output += `Testing with Session ID: ${sessionId}\n`;

        // Attempting to insert WITHOUT metadata key to see if it bypasses the schema check
        const { data, error } = await supabase
            .from('chat_messages')
            .insert([{
                session_id: sessionId,
                sender: 'user',
                content: 'Test message WITHOUT metadata key'
            }])
            .select();

        if (error) {
            output += `INSERT ERROR: ${JSON.stringify(error, null, 2)}\n`;
        } else {
            output += `INSERT SUCCESS: ${JSON.stringify(data, null, 2)}\n`;
        }
    } catch (err) {
        output += `FATAL: ${err.message}\n`;
    }
    fs.writeFileSync(path.join(__dirname, 'diagnostic_result.txt'), output);
    console.log('Test finished.');
    process.exit(0);
}

testInsert();
