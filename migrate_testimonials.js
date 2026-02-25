const mysql = require('mysql2/promise');
require('dotenv').config({ path: './server/.env' });

(async () => {
    try {
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('Adding email column to testimonials table...');
        try {
            await conn.query('ALTER TABLE testimonials ADD COLUMN email VARCHAR(255) AFTER name');
            console.log('✅ Column added successfully');
        } catch (err) {
            if (err.code === 'ER_DUP_COLUMN_NAME') {
                console.log('ℹ️ Column already exists');
            } else {
                throw err;
            }
        }

        await conn.end();
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
    }
})();
