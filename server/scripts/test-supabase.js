const supabase = require('../config/supabase');
const fs = require('fs');
const path = require('path');

async function testConnection() {
    let output = '--- CHAT DATA DUMP ---\n';
    try {
        const { data: sessions, error: sError } = await supabase.from('chat_sessions').select('*');
        if (sError) {
            output += `SESSIONS ERROR: ${sError.message}\n`;
        } else {
            output += `SESSIONS (${sessions.length}):\n${JSON.stringify(sessions, null, 2)}\n`;
        }

        const { data: messages, error: mError } = await supabase.from('chat_messages').select('*');
        if (mError) {
            output += `MESSAGES ERROR: ${mError.message}\n`;
        } else {
            output += `MESSAGES (${messages.length}):\n${JSON.stringify(messages, null, 2)}\n`;
        }
    } catch (err) {
        output += `FATAL ERROR: ${err.message}\n`;
    }
    fs.writeFileSync(path.join(__dirname, 'diagnostic_result.txt'), output);
    console.log('Diagnostic finished.');
    process.exit(0);
}

testConnection();
