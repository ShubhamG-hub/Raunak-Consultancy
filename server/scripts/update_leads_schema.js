const mysql = require('mysql2/promise');
require('dotenv').config({ path: './.env' });

(async () => {
    let conn;
    try {
        conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('Checking leads table schema...');
        const [cols] = await conn.query('DESCRIBE leads');
        const fields = cols.map(c => c.Field);

        if (!fields.includes('created_at')) {
            console.log('Adding created_at column to leads table...');
            await conn.query('ALTER TABLE leads ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
            console.log('Created_at column added successfully.');
        }

        if (!fields.includes('notes')) {
            console.log('Adding notes column to leads table...');
            await conn.query('ALTER TABLE leads ADD COLUMN notes TEXT DEFAULT NULL');
            console.log('Notes column added successfully.');
        }

        // Also check for 'type' ENUM consistency if needed, but it seemed okay in DESCRIBE

        await conn.end();
        console.log('Schema update complete.');
        process.exit(0);
    } catch (err) {
        console.error('Update failed:', err.message);
        if (conn) await conn.end();
        process.exit(1);
    }
})();
