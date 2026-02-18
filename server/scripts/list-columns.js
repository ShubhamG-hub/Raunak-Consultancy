const supabase = require('../config/supabase');
const fs = require('fs');
const path = require('path');

async function listColumns() {
    let output = '--- COLUMN LIST ---\n';
    try {
        // Query to get column names for chat_messages
        const { data: colsM, error: errM } = await supabase.rpc('get_table_columns', { table_name: 'chat_messages' });
        // RPC might not exist, so let's try a direct query to information_schema if possible
        // But Supabase client doesn't allow direct information_schema access easily without RPC.

        // Alternative: Try to select one row and see keys
        const { data: rowsM, error: eM } = await supabase.from('chat_messages').select('*').limit(1);
        output += `chat_messages columns: ${rowsM && rowsM.length ? Object.keys(rowsM[0]).join(', ') : 'No data to infer'}\n`;

        const { data: rowsS, error: eS } = await supabase.from('chat_sessions').select('*').limit(1);
        output += `chat_sessions columns: ${rowsS && rowsS.length ? Object.keys(rowsS[0]).join(', ') : 'No data to infer'}\n`;
        if (rowsS && rowsS.length) {
            output += `First session row: ${JSON.stringify(rowsS[0], null, 2)}\n`;
        }
    } catch (err) {
        output += `FATAL: ${err.message}\n`;
    }
    fs.writeFileSync(path.join(__dirname, 'diagnostic_result.txt'), output);
    console.log('Test finished.');
    process.exit(0);
}

listColumns();
