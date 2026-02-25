const db = require('./config/db');

async function diag() {
    try {
        console.log('--- Checking chat_sessions table ---');
        const [rows] = await db.query('DESCRIBE chat_sessions');
        console.log('Columns:', rows.map(r => r.Field).join(', '));

        console.log('\n--- Checking row count ---');
        const [countRow] = await db.query('SELECT COUNT(*) as count FROM chat_sessions');
        console.log('Count:', countRow[0].count);

        process.exit(0);
    } catch (err) {
        console.error('DIAG ERROR:', err.message);
        process.exit(1);
    }
}

diag();
