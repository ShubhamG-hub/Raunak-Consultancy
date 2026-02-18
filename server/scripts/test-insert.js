const supabase = require('../config/supabase');
const fs = require('fs');
const path = require('path');

async function testInsert() {
    let output = '--- MESSAGE INSERT TEST ---\n';
    try {
        // 1. Get first session
        const { data: sessions, error: sErr } = await supabase.from('chat_sessions').select('id').limit(1);
        if (sErr || !sessions.length) {
            output += `NO SESSION FOUND: ${sErr ? sErr.message : 'No rows'}\n`;
            fs.writeFileSync(path.join(__dirname, 'diagnostic_result.txt'), output);
            process.exit(0);
        }

        const sessionId = sessions[0].id;
        output += `Testing with Session ID: ${sessionId}\n`;

        // 2. Try insert message
        const { data, error } = await supabase
            .from('chat_messages')
            .insert([{
                session_id: sessionId,
                sender: 'user',
                content: 'Test message from script',
                metadata: { debug: true }
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
